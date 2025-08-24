'use strict';

const os = require('os');

/**
 * DiscoveryService
 * - Dependency-injectable; defaults are safe and work in plain Node
 * - Auto-selects a host IPv4 for RPC binding (falls back to 0.0.0.0)
 * - Returns interfaces + an optional pre-populated device list
 *
 * If you want to integrate your existing HomeMaticDiscovery + DeviceLister,
 * inject them and populate `interfaces` / `devices` accordingly.
 */
class DiscoveryService {
  constructor({ logger, interfaces, devices } = {}) {
    this.logger = logger ?? defaultLogger();
    this.interfaces = interfaces ?? [];
    this.devices = devices ?? [];
  }

  async init() {
    this.logger.info('[DiscoveryService] Initializing');

    // If the app didn't inject interfaces, pick one automatically
    if (this.interfaces.length === 0) {
      const host = pickHostIP();
      // Use ephemeral port 0; RPCHandler will report the actual port on 'listening'
      this.interfaces = [{ type: 'generic', host, port: 0 }];
      this.logger.info(`[DiscoveryService] Using interface ${host}:0 (generic)`);
    }

    // Devices may be injected externally (e.g., from a CCU lister)
    this.logger.info(`[DiscoveryService] Devices preset: ${this.devices.length}`);
  }

  getInterfaces() {
    return this.interfaces;
  }

  getDevices() {
    return this.devices;
  }
}

function pickHostIP() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const info of ifaces[name]) {
      if (info.family === 'IPv4' && !info.internal) return info.address;
    }
  }
  return '0.0.0.0';
}

function defaultLogger() {
  const levels = ['debug', 'info', 'warn', 'error'];
  const log = {};
  for (const lvl of levels) log[lvl] = (...a) => console[lvl === 'debug' ? 'log' : lvl](`[${lvl.toUpperCase()}]`, ...a);
  return log;
}

module.exports = DiscoveryService;
