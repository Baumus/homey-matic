'use strict';

const Constants = require('./constants');
const Convert = require('./convert');

/**
 * CapabilityManager
 * - Debounces outgoing capability writes
 * - Converts values consistently using convert.js or provided converters
 * - Subscribes to bridge device events and unsubscribes on dispose()
 * - Applies setCapabilityValue only when a value actually changes (with numeric tolerance)
 * - DEDUPES outbound writes to avoid redundant MQTT publishes
 */
class CapabilityManager {
  constructor(device, capabilityMap) {
    this.device = device;
    this.capabilityMap = capabilityMap;
    this.deviceAddress = device.deviceAddress;
    this.HomeyInterfaceName = device.HomeyInterfaceName;

    this._unsubs = [];               // unsubscribe functions for bridge events
    this._lastKnown = new Map();     // capabilityName -> last value set in Homey
    this._lastOutbound = new Map();  // capabilityName -> last value sent to bridge
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
            // Choose converter priority: set.convertMQTT (when transport=mqtt) > set.convert > valueType mapping
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

            // Dedupe outbound writes per capability to avoid redundant MQTT publishes
            const prevSent = this._lastOutbound.get(capabilityName);
            if (this._equals(capabilityName, prevSent, out)) return;

            await this.device.setValue(channel, key, out);
            this._lastOutbound.set(capabilityName, out);
          } catch (err) {
            this.device.logger.log('error',
              `Failed to set capability ${capabilityName} for ${this.device.getName()} (${this.deviceAddress})`, err);
          }
        },
        debounceMs // Homey debounces the listener calls to avoid request storms
      );
    }
  }

  async initializeCapabilities() {
    // Read initial values and subscribe to device events (single wiring path)
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

  /**
   * Subscribe to bridge updates for this capability and remember how to unsubscribe.
   */
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
      // Backward compat: if older bridge implementation returns nothing, we can't auto-unsub.
      this.device.logger.log('warn', `Bridge returned no unsubscribe for ${capabilityName}; potential leak if device is deleted.`);
    }
  }

  /**
   * Public hook for device.js to remove event subscriptions.
   */
  dispose() {
    for (const unsub of this._unsubs.splice(0)) {
      try { unsub(); } catch (err) { this.device.logger.log('warn', 'Unsubscribe failed:', err); }
    }
  }

  handleCapabilityUpdate(channel, key, value) {
    // Kept for compatibility in case other code routes updates here.
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
      case 'boolean':       return Convert.toBoolean(value);     // robust now
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

  _equals(capabilityName, a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;

    // Use outbound type when available, else inbound type.
    const entry = this.capabilityMap[capabilityName] || {};
    const type = (entry.set && entry.set.valueType) || entry.valueType;

    // Numeric-ish types: allow tiny epsilon to prevent jitter
    if (type === 'float' || type === 'Wh' || type === 'floatPercent' || type === 'mA' || type === 'onOffDimGet') {
      const na = Number(a), nb = Number(b);
      if (Number.isFinite(na) && Number.isFinite(nb)) {
        return Math.abs(na - nb) < 0.005;
      }
    }
    return false;
  }

  async _safeSetCapability(capabilityName, value) {
    const prev = this._lastKnown.get(capabilityName);
    if (this._equals(capabilityName, prev, value)) return; // suppress identical updates

    // Also avoid redundant Homey updates/Flows
    const current = this.device.getCapabilityValue(capabilityName);
    if (this._equals(capabilityName, current, value)) {
      this._lastKnown.set(capabilityName, value);
      return;
    }

    try {
      await this.device.setCapabilityValue(capabilityName, value);
      this._lastKnown.set(capabilityName, value);
    } catch (err) {
      // setCapabilityValue can throw when device is deleting or restarting
      this.device.logger.log('error', `setCapabilityValue(${capabilityName}) failed:`, err);
    }
  }
}

module.exports = CapabilityManager;
