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
    this.ccuIP = ccuIP;
    this.mqttPort = mqttPort;
    this.type = type;
    this.serial = serial;
    this.user = user;
    this.password = password;

    this.transport = Constants.TRANSPORT_MQTT;
    this.homeyIP = homey.app.homeyIP;

    // Event/listener bookkeeping
    this.listeners = new Map();        // eventName -> Set<callback>
    this.eventToTopic = new Map();     // eventName -> topic
    this.subscribedTopics = new Set(); // desired topics
    this.topicRefCount = new Map();    // topic -> refcount
    this.lastValueByEvent = new Map(); // eventName -> last payload value
    this.connected = false;

    // MQTT reconnect/backoff
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;

    // Request queue (concurrency-limited)
    this.queue = [];
    this.queueActive = 0;
    this.queueConcurrency = 4;
    this.defaultTimeoutMs = 10000;

    // HTTP keep-alive to reduce CPU/socket churn
    this.httpAgent = new http.Agent({ keepAlive: true, maxSockets: 6 });

    this.jackClient = this.createJackClient();
  }

  createJackClient() {
    return axios.create({
      baseURL: `http://${this.ccuIP}:2121/`,
      timeout: this.defaultTimeoutMs,
      httpAgent: this.httpAgent,
      auth: this.user && this.password ? { username: this.user, password: this.password } : undefined,
    });
  }

  async start() {
    this.setupMqtt();
  }

  setupMqtt() {
    if (this.MQTTClient) {
      try { this.MQTTClient.end(true); } catch (_) {}
      this.MQTTClient = null;
    }

    const options = {
      ...(this.user && this.password ? { username: this.user, password: this.password } : {}),
      keepalive: 30,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      clean: true,
      resubscribe: false,   // we resubscribe manually below
      queueQoSZero: false,  // we mostly use QoS 1 anyway
      clientId: `homey-${this.serial}-${Math.random().toString(16).slice(2)}`
    };

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

    // Expect: device/status/ADDRESS/CHANNEL/DATAPOINT  payload: { "v": <value> }
    const parts = topic.replace(mqttStatusPrefix, '').split('/');
    if (parts.length !== 3) {
      this.logger.log('error', 'Malformed MQTT topic', topic);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(message.toString());
    } catch (e) {
      this.logger.log('warn', 'Non-JSON MQTT payload for', topic);
      return;
    }

    const [address, channel, datapoint] = parts;
    const value = parsed?.v;
    const eventName = this._formatEventName(address, channel, datapoint);

    // Drop duplicates early to reduce CPU + Homey flows
    const prev = this.lastValueByEvent.get(eventName);
    if (prev === value) return;
    this.lastValueByEvent.set(eventName, value);

    this.emit('deviceUpdate', { address, channel, datapoint, value });

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

    // Track callback set per event
    if (!this.listeners.has(eventName)) this.listeners.set(eventName, new Set());
    const set = this.listeners.get(eventName);
    set.add(callback);

    // Map event->topic
    this.eventToTopic.set(eventName, topic);

    // Manage topic refcount + subscription
    const prevCount = this.topicRefCount.get(topic) || 0;
    this.topicRefCount.set(topic, prevCount + 1);
    if (prevCount === 0) {
      this.subscribedTopics.add(topic);
      if (this.connected) {
        this.MQTTClient.subscribe(topic, err => {
          if (err) this.logger.log('error', `Subscribe failed: ${topic}`, err);
          else this.logger.log('info', `Subscribed: ${topic}`);
        });
      }
    }

    // Return unsubscribe closure
    let unsubscribed = false;
    return () => {
      if (unsubscribed) return;
      unsubscribed = true;

      // Remove callback
      const s = this.listeners.get(eventName);
      if (s) {
        s.delete(callback);
        if (s.size === 0) {
          this.listeners.delete(eventName);
          this.lastValueByEvent.delete(eventName);

          const t = this.eventToTopic.get(eventName);
          this.eventToTopic.delete(eventName);
          // Decrease topic refcount and possibly unsubscribe
          const newCount = (this.topicRefCount.get(t) || 0) - 1;
          if (newCount <= 0) {
            this.topicRefCount.delete(t);
            if (this.subscribedTopics.has(t)) {
              this.subscribedTopics.delete(t);
              if (this.connected) {
                this.MQTTClient.unsubscribe(t, err => {
                  if (err) this.logger.log('warn', `Unsubscribe failed: ${t}`, err);
                  else this.logger.log('info', `Unsubscribed: ${t}`);
                });
              }
            }
          } else {
            this.topicRefCount.set(t, newCount);
          }
        }
      }
    };
  }

  // ---------------- Queue with concurrency & per-task timeout ----------------

  enqueueRequest(fn, { timeoutMs } = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject, timeoutMs: timeoutMs ?? this.defaultTimeoutMs });
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

    try {
      const result = await task.fn();
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
    // Fetch device links (queued)
    const response = await this.enqueueRequest(() => this.jackClient.get('device'));
    const links = response.data['~links'];

    // Fetch each device detail through the queue to avoid bursts
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
      // QoS 1 for delivery guarantee; broker must support it
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
      this.MQTTClient.end(true, () => {
        this.logger.log('info', 'MQTT client disconnected');
      });
    }

    // Clear bookkeeping
    this.queue = [];
    this.queueActive = 0;
    this.subscribedTopics.clear();
    this.topicRefCount.clear();
    this.eventToTopic.clear();
    this.listeners.clear();
    this.lastValueByEvent.clear();
    this.connected = false;

    try {
      // Free sockets held by keep-alive
      if (this.httpAgent && typeof this.httpAgent.destroy === 'function') this.httpAgent.destroy();
    } catch (_) {}
    this.httpAgent = null;
  }
}

module.exports = HomeMaticCCUJack;
