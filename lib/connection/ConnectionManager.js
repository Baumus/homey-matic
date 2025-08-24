'use strict';

const EventEmitter = require('events');
const RpcHandler = require('./RpcHandler');
const DiscoveryService = require('./DiscoveryService');

/**
 * ConnectionManager
 * - Orchestrates discovery + RPC listeners
 * - Dedupe steady-state events (address/datapoint unchanged)
 * - Sequential event loop to avoid races under burst
 * - Clean lifecycle with idempotent init() and shutdown()
 */
class ConnectionManager extends EventEmitter {
  constructor({ logger, discoveryService, rpcHandler, capabilityManager } = {}) {
    super();
    this.logger = logger ?? defaultLogger();
    this.discovery = discoveryService ?? new DiscoveryService({ logger: this.logger });
    this.rpc = rpcHandler ?? new RpcHandler({ logger: this.logger });
    this.capabilityManager = capabilityManager ?? null; // optional adapter with {registerCapabilities, handleEvent}

    this.devices = new Map();
    this._initialized = false;
    this._initPromise = null;

    this._last = new Map();          // key: `${address}/${datapoint}` -> last value
    this._eventQueue = [];
    this._eventProcessing = false;
    this._rpcUnsubs = [];            // unsubscribe fns returned by rpc.listen()
  }

  async init() {
    if (this._initialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      this.logger.info('[ConnectionManager] Initializing...');
      try {
        await this.discovery.init();

        const interfaces = this.discovery.getInterfaces();
        const devices = this.discovery.getDevices();

        // Start RPC listeners per interface and remember how to unsubscribe
        for (const iface of interfaces) {
          const unsub = await this.rpc.listen(iface, (event) => this._enqueueEvent(event));
          if (typeof unsub === 'function') this._rpcUnsubs.push(unsub);
        }

        // Register devices (if any are enumerated by your discovery implementation)
        for (const device of devices) {
          this.registerDevice(device);
        }

        this._initialized = true;
        this.logger.info(`[ConnectionManager] Ready. Interfaces: ${interfaces.length} | Devices: ${devices.length}`);
        this.emit('ready');
      } catch (err) {
        this.logger.error('[ConnectionManager] Initialization failed:', err);
        this.emit('error', err);
        throw err;
      }
    })();

    return this._initPromise;
  }

  async shutdown() {
    this.logger.info('[ConnectionManager] Shutting down...');
    try {
      // Stop RPC listeners
      for (const unsub of this._rpcUnsubs.splice(0)) {
        try { unsub(); } catch (e) { this.logger.warn('[ConnectionManager] RPC unsubscribe failed:', e); }
      }
      await this.rpc.shutdown();
    } finally {
      this._initialized = false;
      this._initPromise = null;
      this._eventQueue.length = 0;
      this._eventProcessing = false;
      this.logger.info('[ConnectionManager] Shutdown complete');
    }
  }

  getDeviceByAddress(address) {
    return this.devices.get(address);
  }

  registerDevice(device) {
    if (!device || !device.address) {
      this.logger.warn('[ConnectionManager] registerDevice called without valid device');
      return;
    }
    if (this.devices.has(device.address)) {
      this.devices.set(device.address, { ...this.devices.get(device.address), ...device });
    } else {
      this.devices.set(device.address, device);
    }

    // Optional capability adapter (if you plug in a Homey-aware CapabilityManager, etc.)
    if (this.capabilityManager?.registerCapabilities) {
      try {
        this.capabilityManager.registerCapabilities(device);
      } catch (e) {
        this.logger.warn('[ConnectionManager] capabilityManager.registerCapabilities error:', e);
      }
    }
    this.logger.debug?.(`[ConnectionManager] Registered device ${device.address}`);
  }

  _enqueueEvent(event) {
    const { address, datapoint, value } = event || {};
    if (!address || typeof datapoint === 'undefined') {
      this.logger.warn('[ConnectionManager] Ignoring malformed event:', event);
      return;
    }

    // Dedupe noisy identical values
    const key = `${address}/${datapoint}`;
    if (this._last.get(key) === value) return;
    this._last.set(key, value);

    this._eventQueue.push(event);
    if (!this._eventProcessing) {
      this._processEvents().catch(e => this.logger.error('[ConnectionManager] Event loop error:', e));
    }
  }

  async _processEvents() {
    if (this._eventProcessing) return;
    this._eventProcessing = true;
    try {
      while (this._eventQueue.length) {
        const event = this._eventQueue.shift();
        const device = this.devices.get(event.address);

        if (!device) {
          this.logger.warn(`[ConnectionManager] Event for unknown device: ${event.address}`);
          continue;
        }

        // Optional capability adapter hook
        if (this.capabilityManager?.handleEvent) {
          try {
            await this.capabilityManager.handleEvent(device, event);
          } catch (err) {
            this.logger.error('[ConnectionManager] capabilityManager.handleEvent error:', err);
          }
        }

        // Emit to any external listeners
        try {
          this.emit('deviceEvent', { device, event });
        } catch (err) {
          this.logger.error('[ConnectionManager] Error emitting deviceEvent:', err);
        }
      }
    } finally {
      this._eventProcessing = false;
    }
  }
}

function defaultLogger() {
  const levels = ['debug', 'info', 'warn', 'error'];
  const log = {};
  for (const lvl of levels) log[lvl] = (...a) => console[lvl === 'debug' ? 'log' : lvl](`[${lvl.toUpperCase()}]`, ...a);
  return log;
}

module.exports = ConnectionManager;
