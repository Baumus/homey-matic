'use strict';

const EventEmitter = require('events');
const axios = require('axios');
const mqtt = require('mqtt');
const http = require('http');
const Constants = require('./constants.js');

const mqttStatusPrefix = 'device/status/';

class HomeMaticCCUJack extends EventEmitter {
  constructor({ logger, homey, type, serial, ccuIP, mqttPort, user, password }) {
    super();
    this.homey = homey;
    this.logger = logger;

    this.type = type;
    this.serial = serial;
    this.ccuIP = ccuIP;
    this.mqttPort = mqttPort;
    this.user = user;
    this.password = password;

    this.transport = Constants.TRANSPORT_MQTT;
    this.homeyIP = homey.app.homeyIP;

    // Event/listener bookkeeping
    this.listeners = new Map();       // eventName -> Set<callback>
    this.eventToTopic = new Map();    // eventName -> topic
    this.subscribedTopics = new Set();// topics currently subscribed (desired)
    this.connected = false;

    // MQTT reconnect/backoff (we control reconnects ourselves)
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;

    // Request queue (concurrency-limited + bounded + retries)
    this.queue = [];
    this.queueActive = 0;
    this.queueConcurrency = 4;
    this.maxQueueSize = 1000;
    this.defaultTimeoutMs = 10000;
    this.defaultRetries = 2;       // retry failed HTTP ops a couple of times
    this.retryBaseDelayMs = 250;   // 250ms, 500ms, 1000ms...

    this.jackClient = this.createJackClient();
  }

  createJackClient() {
    const agent = new http.Agent({ keepAlive: true, maxSockets: 16 });
    return axios.create({
      baseURL: `http://${this.ccuIP}:2121/`,
      timeout: 10000,
      httpAgent: agent,
      auth: this.user && this.password ? { username: this.user, password: this.password } : undefined,
    });
  }

  async start() {
    this.setupMqtt();
  }

  updateCcuIp(newIp) {
    if (newIp && newIp !== this.ccuIP) {
      this.logger.log('info', `Bridge IP changed ${this.ccuIP} → ${newIp}; reconnecting MQTT/HTTP`);
      this.ccuIP = newIp;
      this.jackClient = this.createJackClient();
      this.setupMqtt();
    }
  }

  setupMqtt() {
    if (this.MQTTClient) {
      try {
        this.MQTTClient.removeAllListeners();
        this.MQTTClient.end(true);
      } catch (_) {}
      this.MQTTClient = null;
    }

    const options = {
      clientId: `homey-hmjack-${this.serial}-${this.homeyIP}`,
      keepalive: 30,
      reconnectPeriod: 0,           // we'll do our own backoff
      connectTimeout: 10000,
    };
    if (this.user && this.password) {
      options.username = this.user;
      options.password = this.password;
    }

    this.MQTTClient = mqtt.connect(`mqtt://${this.ccuIP}:${this.mqttPort}`, options);

    this.MQTTClient.on('connect', () => {
      this.logger.log('info', `Connected to CCU Jack broker at ${this.ccuIP}:${this.mqttPort}`);
      this.connected = true;
      this.reconnectAttempts = 0;

      // Resubscribe desired topics
      for (const topic of this.subscribedTopics) {
        this.MQTTClient.subscribe(topic, (err) => {
          if (err) this.logger.log('error', `Resubscribe failed: ${topic}`, err);
          else this.logger.log('info', `Subscribed: ${topic}`);
        });
      }
    });

    this.MQTTClient.on('message', (topic, message) => this._handleMessage(topic, message));
    this.MQTTClient.on('close', () => this._handleDisconnect('MQTT disconnected'));
    this.MQTTClient.on('offline', () => this._handleDisconnect('MQTT offline'));
    this.MQTTClient.on('error', err => this._handleDisconnect(`MQTT error: ${err.message}`));
  }

  _handleMessage(topic, message) {
    if (!topic.startsWith(mqttStatusPrefix)) return;

    // Topics are published as:
    //   device/status/<ADDRESS with ":" replaced by "/">/<CHANNEL>/<DATAPOINT>
    // So after prefix removal we typically have 4 parts: [addrLeft, addrRight, channel, datapoint]
    const parts = topic.slice(mqttStatusPrefix.length).split('/');

    let address, channel, datapoint;
    if (parts.length === 3) {
      [address, channel, datapoint] = parts;
    } else if (parts.length >= 4) {
      address = `${parts[0]}:${parts[1]}`;
      channel = parts[2];
      datapoint = parts[3];
    } else {
      this.logger.log('warn', 'Malformed MQTT topic', topic);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(message.toString());
    } catch (e) {
      this.logger.log('warn', 'Non-JSON MQTT payload for', topic);
      return;
    }

    const value = parsed && Object.prototype.hasOwnProperty.call(parsed, 'v') ? parsed.v : parsed;

    // Emit a generic event for app-level observers (if any)
    this.emit('deviceUpdate', { address, channel, datapoint, value });

    const eventName = this._formatEventName(address, channel, datapoint);
    const set = this.listeners.get(eventName);
    if (set && set.size) {
      for (const cb of set) {
        try { cb(value); } catch (e) { this.logger.log('error', 'Listener error for', eventName, e); }
      }
    }
  }

  _handleDisconnect(msg) {
    this.logger.log('warn', msg);
    this.connected = false;

    if (this.reconnectTimer) return; // already scheduled

    const attempt = ++this.reconnectAttempts;
    const base = Math.min(30000, 5000 * Math.pow(2, attempt - 1)); // 5s, 10s, 20s, 30s capped
    const jitter = 0.2 + Math.random() * 0.6; // 0.2–0.8 jitter
    const delay = Math.round(base * jitter);

    this.reconnectTimer = this.homey.setTimeout(() => {
      this.reconnectTimer = null;
      this.setupMqtt();
    }, delay);
  }

  _formatEventName(address, channel, datapoint) {
    return `${address}:${channel}-${datapoint}`;
  }

  /**
   * Subscribe to a single datapoint. Returns an unsubscribe function.
   */
  subscribeToDeviceEvent(address, channel, datapoint, callback) {
    const eventName = this._formatEventName(address, channel, datapoint);
    const topic = `device/status/${address.replace(':', '/')}/${channel}/${datapoint}`;

    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
    const set = this.listeners.get(eventName);
    set.add(callback);

    this.eventToTopic.set(eventName, topic);
    if (!this.subscribedTopics.has(topic)) {
      this.subscribedTopics.add(topic);
      if (this.connected) {
        this.MQTTClient.subscribe(topic, err => {
          if (err) this.logger.log('error', `Subscribe failed: ${topic}`, err);
          else this.logger.log('info', `Subscribed: ${topic}`);
        });
      }
    }

    let unsubscribed = false;
    return () => {
      if (unsubscribed) return;
      unsubscribed = true;

      const setNow = this.listeners.get(eventName);
      if (setNow) {
        setNow.delete(callback);
        if (setNow.size === 0) {
          this.listeners.delete(eventName);
          const t = this.eventToTopic.get(eventName);
          this.eventToTopic.delete(eventName);
          const stillUsed = [...this.eventToTopic.values()].some(x => x === t);
          if (!stillUsed && this.subscribedTopics.has(t)) {
            this.subscribedTopics.delete(t);
            if (this.connected) {
              this.MQTTClient.unsubscribe(t, err => {
                if (err) this.logger.log('warn', `Unsubscribe failed: ${t}`, err);
                else this.logger.log('info', `Unsubscribed: ${t}`);
              });
            }
          }
        }
      }
    };
  }

  // ---------------- Queue with concurrency, per-task timeout, retries, bounds ----------------

  enqueueRequest(fn, { timeoutMs, retries } = {}) {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.maxQueueSize) {
        this.logger.log('warn', `Queue overflow (>${this.maxQueueSize}), dropping oldest`);
        const dropped = this.queue.shift();
        if (dropped) dropped.reject(new Error('Request dropped due to queue overflow'));
      }
      this.queue.push({
        fn,
        resolve,
        reject,
        timeoutMs: timeoutMs ?? this.defaultTimeoutMs,
        retries: (retries ?? this.defaultRetries)
      });
      this._drainQueue();
    });
  }

  _drainQueue() {
    while (this.queueActive < this.queueConcurrency && this.queue.length > 0) {
      const task = this.queue.shift();
      this._runTask(task);
    }
  }

  async _runTask(task) {
    this.queueActive++;
    let timedOut = false;

    const to = task.timeoutMs > 0
      ? this.homey.setTimeout(() => {
          timedOut = true;
          task.reject(new Error(`Request timeout after ${task.timeoutMs}ms`));
          this.queueActive--;
          this._drainQueue();
        }, task.timeoutMs)
      : null;

    const runWithRetries = async (attempt) => {
      try {
        return await task.fn();
      } catch (err) {
        if (attempt < task.retries) {
          const backoff = Math.min(3000, this.retryBaseDelayMs * Math.pow(2, attempt));
          await new Promise(r => this.homey.setTimeout(r, backoff));
          return runWithRetries(attempt + 1);
        }
        throw err;
      }
    };

    try {
      const result = await runWithRetries(0);
      if (!timedOut) {
        if (to) this.homey.clearTimeout(to);
        task.resolve(result);
      }
    } catch (err) {
      if (!timedOut) {
        if (to) this.homey.clearTimeout(to);
        task.reject(err);
      }
    } finally {
      if (!timedOut) {
        this.queueActive--;
        this._drainQueue();
      }
    }
  }

  // ---------------- Public bridge API ----------------

  async listDevices() {
    const response = await this.enqueueRequest(() => this.jackClient.get('device'));
    const links = response.data['~links'];

    const details = await Promise.all(
      links.map(link => this.enqueueRequest(() => this.jackClient.get(`device/${link.href}`)))
    );

    return details.reduce((acc, { data }) => {
      const { type, address, interfaceType } = data;
      if (!acc[interfaceType]) acc[interfaceType] = [];
      acc[interfaceType].push({ TYPE: type, ADDRESS: address });
      return acc;
    }, {});
  }

  async getValue(interfaceName, address, key) {
    const valueURL = `device/${address.replace(':', '/')}/${key}/~pv`;
    const response = await this.enqueueRequest(() => this.jackClient.get(valueURL));
    return response.data.v;
  }

  async setValue(interfaceName, address, key, value) {
    const adjusted = value === '1.0' ? 1 : value === '0.0' ? 0 : value;
    const topic = `device/set/${address.replace(':', '/')}/${key}`;

    await this.enqueueRequest(() => new Promise((resolve, reject) => {
      this.MQTTClient.publish(topic, JSON.stringify(adjusted), { qos: 1, retain: false }, err => {
        if (err) {
          this.logger.log('error', `MQTT publish failed ${topic}`, err);
          return reject(err);
        }
        resolve();
      });
    }));
  }

  async stop() {
    if (this.reconnectTimer) {
      this.homey.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.MQTTClient) {
      try { this.MQTTClient.removeAllListeners(); } catch (_) {}
      this.MQTTClient.end(true, () => {
        this.logger.log('info', 'MQTT client disconnected');
      });
    }
    this.queue = [];
    this.queueActive = 0;
    this.subscribedTopics.clear();
    this.eventToTopic.clear();
    this.listeners.clear();
    this.connected = false;
  }
}

module.exports = HomeMaticCCUJack;
