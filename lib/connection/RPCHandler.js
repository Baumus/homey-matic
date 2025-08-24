'use strict';

const { createServer } = require('homematic-xmlrpc');

/**
 * RpcHandler
 * - Starts an XML-RPC listener with exponential backoff + jitter
 * - Returns an unsubscribe closure for proper cleanup
 * - Queues 'event' notifications to avoid bursts overwhelming the consumer
 */
class RpcHandler {
  constructor({ logger, backoff = { min: 1000, max: 30000, factor: 2, jitter: 0.2 }, maxAttempts = 5 } = {}) {
    this.logger = logger ?? defaultLogger();
    this.servers = new Map(); // type -> server
    this._backoff = backoff;
    this._maxAttempts = maxAttempts;
    this._closed = false;
  }

  async listen(interfaceConfig, onEvent) {
    const { type = 'generic', host = '0.0.0.0', port = 0 } = interfaceConfig ?? {};
    let attempt = 0;

    while (!this._closed) {
      attempt++;
      try {
        const server = await this._createRpcServer({ host, port, type, onEvent });
        this.servers.set(type, server);
        this.logger.info(`[RpcHandler] Listening on ${server.host}:${server.port} (${type})`);

        // Return unsubscribe function
        return () => {
          try { server.close(); } catch (_) {}
          if (this.servers.get(type) === server) this.servers.delete(type);
        };
      } catch (err) {
        this.logger.warn(`[RpcHandler] Listen attempt ${attempt} failed for ${type}: ${err.message}`);
        if (attempt >= this._maxAttempts) {
          this.logger.error(`[RpcHandler] Giving up after ${attempt} attempts for ${type}`);
          throw err;
        }
        await delay(calcBackoff(this._backoff, attempt));
      }
    }
  }

  async _createRpcServer({ host, port, type, onEvent }) {
    return new Promise((resolve, reject) => {
      const server = createServer({ host, port });

      let resolved = false;
      const to = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { server.close(); } catch (_) {}
          reject(new Error('RPC server start timeout'));
        }
      }, 7000);

      // Latch address/port once listening
      server.on('listening', () => {
        if (resolved) return;
        clearTimeout(to);
        resolved = true;
        const info = server.server?.address?.() || { address: host, port };
        server.host = info.address;
        server.port = info.port;
        resolve(server);
      });

      // Burst-safe event handling
      const queue = [];
      let processing = false;
      const drain = async () => {
        if (processing) return;
        processing = true;
        try {
          while (queue.length) {
            const [ifaceId, address, datapoint, value] = queue.shift();
            try {
              onEvent({ interfaceId: ifaceId, address, datapoint, value });
            } catch (err) {
              this.logger.error(`[RpcHandler] Error in onEvent for ${address}:${datapoint}`, err);
            }
          }
        } finally {
          processing = false;
        }
      };

      server.on('event', (interfaceId, address, datapoint, value) => {
        queue.push([interfaceId, address, datapoint, value]);
        setImmediate(drain);
      });

      server.on('NotFound', (method, params) => {
        this.logger.warn(`[RpcHandler] Unknown RPC method: ${method}`, params);
      });

      server.on('error', err => {
        if (!resolved) {
          clearTimeout(to);
          resolved = true;
          reject(err);
        } else {
          this.logger.error(`[RpcHandler] RPC server error (${type}):`, err);
        }
      });
    });
  }

  async shutdown() {
    this._closed = true;
    for (const [type, server] of this.servers.entries()) {
      try {
        server.close();
        this.logger.info(`[RpcHandler] Server closed (${type})`);
      } catch (err) {
        this.logger.error(`[RpcHandler] Error closing server (${type}):`, err);
      }
    }
    this.servers.clear();
  }
}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

function calcBackoff({ min = 1000, max = 30000, factor = 2, jitter = 0.2 } = {}, attempt = 1) {
  const base = Math.min(max, Math.round(min * Math.pow(factor, attempt - 1)));
  const rand = 1 + (Math.random() * 2 - 1) * jitter; // 1 ± jitter
  return Math.max(min, Math.min(max, Math.round(base * rand)));
}

function defaultLogger() {
  const levels = ['debug', 'info', 'warn', 'error'];
  const log = {};
  for (const lvl of levels) log[lvl] = (...a) => console[lvl === 'debug' ? 'log' : lvl](`[${lvl.toUpperCase()}]`, ...a);
  return log;
}

module.exports = RpcHandler;
