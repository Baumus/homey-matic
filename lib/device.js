'use strict';

const Homey = require('homey');
const CapabilityManager = require('./CapabilityManager');

class Device extends Homey.Device {

  /**
   * @param {Object} capabilityMap - passed from your driver when constructing the device
   */
  async onInit(capabilityMap) {
    this.logger = this.homey.app.logger;
    this.capabilityMap = capabilityMap;
    this.deviceAddress = this.getData().id;
    this.HomeyInterfaceName = this.getData().attributes.HomeyInterfaceName;
    this.bridgeSerial = this.getSetting('ccuSerial') || this.getData().attributes.bridgeSerial;

    try {
      // Resolve bridge once; driver.getBridge already discovers on demand
      this.bridge = await this.driver.getBridge({ serial: this.bridgeSerial });

      // Capability wiring (includes initial read + event subscription)
      this.capabilityManager = new CapabilityManager(this, this.capabilityMap);
      await this.capabilityManager.initializeCapabilities();
      this.capabilityManager.registerCapabilityListeners();

      // Useful device info for Settings → Advanced
      await this.setSettings({
        address: this.deviceAddress,
        ccuIP: this.bridge.ccuIP,
        ccuSerial: this.bridge.serial,
        driver: this.driver.manifest.id,
      });

      await this.setAvailable();
      this.logger.log('info', `Device ready: ${this.getName()} (${this.deviceAddress})`);
    } catch (err) {
      this.logger.log('error', 'Failed to initialize device:', err);
      await this.setUnavailable('Failed to initialize device');
    }
  }

  async onDeleted() {
    // Ensure all bridge subscriptions are removed (no leaks)
    try {
      if (this.capabilityManager) this.capabilityManager.dispose();
    } catch (e) {
      this.logger.log('warn', 'Error cleaning capability manager subscriptions:', e);
    }
    this.logger.log('info', `Device deleted: ${this.deviceAddress}`);
  }

  /**
   * Write a datapoint via bridge with logging + propagated error on failure
   */
  async setValue(channel, key, value) {
    try {
      await this.bridge.setValue(this.HomeyInterfaceName, `${this.deviceAddress}:${channel}`, key, value);
      this.logger.log('info', `Set ${key} ok – value:${value} device:${this.deviceAddress}`);
    } catch (err) {
      this.logger.log('error', `Set ${key} failed – value:${value} device:${this.deviceAddress}`, err);
      throw new Error('Failed to set value');
    }
  }
}

module.exports = Device;
