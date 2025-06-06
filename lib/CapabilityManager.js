'use strict';

const Constants = require('./constants');

class CapabilityManager {
  constructor(device, capabilityMap) {
    this.device = device;
    this.capabilityMap = capabilityMap;
    this.deviceAddress = device.deviceAddress;
    this.HomeyInterfaceName = device.HomeyInterfaceName;
  }

  registerCapabilityListeners() {
    for (const [capabilityName, capability] of Object.entries(this.capabilityMap)) {
      this.device.logger.log('info', `Registering capability listener for ${capabilityName}`);
      if (!capability.set) continue;
      this.device.registerCapabilityListener(capabilityName, async (value, opts) => {
        try {
          let setValue = value;
          if (capability.set.convertMQTT && this.device.bridge.transport === Constants.TRANSPORT_MQTT) {
            setValue = capability.set.convertMQTT(value);
          } else if (capability.set.convert) {
            setValue = capability.set.convert(value);
          } else {
            setValue = this.convertValue(capability.set.valueType, value);
          }

          let key = capability.set.key;
          if (capability.set.convertKey) key = capability.set.convertKey(key, value);
          let channel = capability.set.channel;
          if (capability.set.convertChannel) channel = capability.set.convertChannel(channel, value);

          await this.device.setValue(channel, key, setValue);
        } catch (err) {
          this.device.logger.log('error', `Failed to set capability ${capabilityName} for device ${this.device.getName()} (${this.deviceAddress})`, err);
        }
      });
    }
  }

  async initializeCapabilities() {
    await Promise.all(Object.keys(this.capabilityMap).map(async name => {
      const capability = this.capabilityMap[name];
      if (capability.channel && capability.key) {
        await this.getCapabilityValue(name);
        this.initializeEventListener(name);
      }
    }));
  }

  async getCapabilityValue(capabilityName) {
    try {
      const capability = this.capabilityMap[capabilityName];
      let value = await this.device.bridge.getValue(this.HomeyInterfaceName, `${this.deviceAddress}:${capability.channel}`, capability.key);
      value = this.convertCapabilityValue(value, capabilityName);
      await this.device.setCapabilityValue(capabilityName, value);
    } catch (err) {
      this.device.logger.log('error', `Failed to get capability ${capabilityName} for device ${this.device.getName()} (${this.deviceAddress})`, err);
    }
  }

  initializeEventListener(capabilityName) {
    const capability = this.capabilityMap[capabilityName];
    const eventName = `event-${this.deviceAddress}:${capability.channel}-${capability.key}`;

    this.device.logger.log('info', `Initializing event listener for ${capabilityName} with event name ${eventName}`);
    this.device.bridge.on(eventName, async value => {
      try {
        value = this.convertCapabilityValue(value, capabilityName);
        if (value !== undefined) {
          await this.device.setCapabilityValue(capabilityName, value);
        }
      } catch (err) {
        this.device.logger.log('error', `Failed to set capability ${capabilityName} for device ${this.device.getName()} (${this.deviceAddress})`, err);
      }
    });
    this.device.addedEvents.push(eventName);
  }

  handleCapabilityUpdate(channel, key, value) {
    for (const [capabilityName, capability] of Object.entries(this.capabilityMap)) {
      if (capability.channel === channel && capability.key === key) {
        const converted = this.convertCapabilityValue(value, capabilityName);
        this.device.setCapabilityValue(capabilityName, converted);
      }
    }
  }

  convertCapabilityValue(value, capabilityName) {
    const { convert, convertMQTT, valueType } = this.capabilityMap[capabilityName];
    if (convertMQTT && this.device.bridge.transport === Constants.TRANSPORT_MQTT) {
      return convertMQTT(value);
    } else if (convert) {
      return convert(value);
    } else {
      return this.convertValue(valueType, value);
    }
  }

  convertValue(valueType, value) {
    switch (valueType) {
      case 'string': return value.toString();
      case 'int': return parseInt(value, 10);
      case 'float': return parseFloat(value);
      case 'boolean': return value === 1;
      case 'onOffDimGet': return value > 0;
      case 'keymatic': return true;
      case 'keymatic_swap': return !value;
      case 'onOffDimSet': return value ? 0.99 : "0.0";
      case 'Wh': return parseFloat(value) / 1000;
      case 'floatPercent': return parseFloat(value) * 100;
      case 'mA': return parseFloat(value) / 1000;
      default: return value;
    }
  }
}

module.exports = CapabilityManager;
