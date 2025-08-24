module.exports = {
  toFloat(value) {
    const n = Number.parseFloat(String(value));
    return Number.isNaN(n) ? 0 : n;
  },
  toString(value) {
    return value == null ? '' : String(value);
  },
  toInt(value) {
    const n = Number.parseInt(String(value), 10);
    return Number.isNaN(n) ? 0 : n;
  },
  toBoolean(value) {
    if (typeof value === 'boolean') return value;
    const s = String(value).trim().toLowerCase();
    // Treat common falsy representations as false; everything else true
    return !['0', 'false', 'off', 'no', 'null', 'undefined', ''].includes(s);
  },
  levelToOnOff(value) {
    return Number(value) > 0;
  },
  toggleBoolean(value) {
    return !this.toBoolean(value);
  },
  onOffToLevel(value) {
    // Keep string format if your CCU expects strings
    return this.toBoolean(value) ? '0.99' : '0.0';
  },
  WhToKWh(value) {
    return this.toFloat(value) / 1000;
  },
  floatToPercent(value) {
    return Math.floor(this.toFloat(value) * 100);
  },
  mAToA(value) {
    return this.toFloat(value) / 1000;
  },
  toTrue() {
    return true;
  },
  tofix(value) {
    return this.toFloat(value).toFixed(2);
  },
  faultLowbatToBoolean(value) {
    return Number(value) === 6;
  }
};
