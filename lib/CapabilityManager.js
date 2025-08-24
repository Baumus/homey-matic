'use strict';

const Constants = require('./constants');
const Convert = require('./convert');

class CapabilityManager {
  constructor(device, capabilityMap) {
    this.device = device;
    this.capabilityMap = capabilityMap;
    this.deviceAddress = device.deviceAddress;
    this.HomeyInterfaceName = device.HomeyInterfaceName;
    this._unsubs = [];
    this._lastKnown = new Map();
  }

  registerCapabilityListeners() {
    for (const [capabilityName, capability] of Object.entries(this.capabilityMap)) {
      if (!capability.set) continue;

      const debounceMs = typeof capability.set.debounceMs === 'number' ? capability.set.debounceMs : 400;
      this.device.logger.log('info', `Registering capability listener for ${capabilityName} (debounce ${debounceMs}ms)`);

      this.device.registerCapabilityListener(
        capabilityName,
        async (value /*, opts */) => {
          try {
            let out = value;
            if (capability.set.convertMQTT && this.device.bridge.transport === Constants.TRANSPORT_MQTT) {
              out = capability.set.convertMQTT(value);
            } else if (capability.set.convert) {
              out = capability.set.convert(value);
            } else {
              out = this._convertByType(capability.set.valueType, value);
            }

            let key = capability.set.key;
            if (capability.set.convertKey) key = capability.set.convertKey(key, value);

            let channel = capability.set.channel;
            if (capability.set.convertChannel) channel = capability.set.convertChannel(channel, value);

            await this.device.setValue(channel, key, out);
          } catch (err) {
            this.device.logger.log('error',
              `Failed to set capability ${capabilityName} for ${this.device.getName()} (${this.deviceAddress})`, err);
          }
        },
        debounceMs
      );
    }
  }

  async initializeCapabilities() {
    await Promise.all(Object.keys(this.capabilityMap).map(async name => {
      const capability = this.capabilityMap[name];
      if (capability.channel && capability.key) {
        await this.getCapabilityValue(name);
        this._subscribeToBridge(name, capability.channel, capability.key);
      }
    }));
  }

  async getCapabilityValue(capabilityName) {
    try {
      const capability = this.capabilityMap[capabilityName];
      const address = `${this.deviceAddress}:${capability.channel}`;
      let value = await this.device.bridge.getValue(this.HomeyInterfaceName, address, capability.key);
      value = this.convertCapabilityValue(value, capabilityName);
      await this._safeSetCapability(capabilityName, value);
    } catch (err) {
      this.device.logger.log('error',
        `Failed to get capability ${capabilityName} for ${this.device.getName()} (${this.deviceAddress})`, err);
    }
  }

  _subscribeToBridge(capabilityName, channel, key) {
    const unsub = this.device.bridge.subscribeToDeviceEvent(
      this.deviceAddress,
      channel,
      key,
      async raw => {
        try {
          const value = this.convertCapabilityValue(raw, capabilityName);
          if (value !== undefined) {
            await this._safeSetCapability(capabilityName, value);
          }
        } catch (err) {
          this.device.logger.log('error',
            `Failed to handle update for ${capabilityName} ${this.device.getName()} (${this.deviceAddress})`, err);
        }
      }
    );
    if (typeof unsub === 'function') {
      this._unsubs.push(unsub);
    } else {
      this.device.logger.log('warn', `Bridge returned no unsubscribe for ${capabilityName}; potential leak if device is deleted.`);
    }
  }

  dispose() {
    for (const unsub of this._unsubs.splice(0)) {
      try { unsub(); } catch (err) { this.device.logger.log('warn', 'Unsubscribe failed:', err); }
    }
  }

  handleCapabilityUpdate(channel, key, value) {
    for (const [capabilityName, capability] of Object.entries(this.capabilityMap)) {
      if (capability.channel === channel && capability.key === key) {
        const converted = this.convertCapabilityValue(value, capabilityName);
        this._safeSetCapability(capabilityName, converted).catch(err => {
          this.device.logger.log('error', `Failed to set ${capabilityName} on event`, err);
        });
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
      return this._convertByType(valueType, value);
    }
  }

  _convertByType(valueType, value) {
    switch (valueType) {
      case 'string':        return Convert.toString(value);
      case 'int':           return Convert.toInt(value);
      case 'float':         return Convert.toFloat(value);
      case 'boolean':       return Convert.toBoolean(value);
      case 'onOffDimGet':   return Convert.levelToOnOff(value);
      case 'keymatic':      return Convert.toTrue();
      case 'keymatic_swap': return Convert.toggleBoolean(value);
      case 'onOffDimSet':   return Convert.onOffToLevel(value);
      case 'Wh':            return Convert.WhToKWh(value);
      case 'floatPercent':  return Convert.floatToPercent(value);
      case 'mA':            return Convert.mAToA(value);
      default:              return value;
    }
  }

  _equalish(a, b) {
    if (a === b) return true;
    // Coerce number-like strings
    const aNum = (typeof a === 'string' && a.trim() !== '' && !Number.isNaN(Number(a))) ? Number(a) : a;
    const bNum = (typeof b === 'string' && b.trim() !== '' && !Number.isNaN(Number(b))) ? Number(b) : b;
    if (typeof aNum === 'number' && typeof bNum === 'number') {
      if (Number.isNaN(aNum) && Number.isNaN(bNum)) return true;
      return Math.abs(aNum - bNum) <= 0.0001; // epsilon for float jitter
    }
    return false;
  }

  async _safeSetCapability(capabilityName, value) {
    const prev = this._lastKnown.get(capabilityName);
    if (this._equalish(prev, value)) return;

    // Also avoid redundant Homey updates/Flows
    const current = this.device.getCapabilityValue(capabilityName);
    if (this._equalish(current, value)) {
      this._lastKnown.set(capabilityName, value);
      return;
    }

    try {
      await this.device.setCapabilityValue(capabilityName, value);
      this._lastKnown.set(capabilityName, value);
    } catch (err) {
      this.device.logger.log('error', `setCapabilityValue(${capabilityName}) failed:`, err);
    }
  }
}

module.exports = CapabilityManager;
