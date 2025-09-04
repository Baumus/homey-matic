'use strict';

/**
 * Robust, low-allocation conversions.
 * - Handles strings/numbers/booleans consistently
 * - Avoids NaN propagation; provides sensible defaults
 */

const TRUE_RE  = /^(true|1|on|yes)$/i;
const FALSE_RE = /^(false|0|off|no)$/i;

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  const s = String(value).trim();
  if (TRUE_RE.test(s)) return true;
  if (FALSE_RE.test(s)) return false;
  return !!s; // last resort
}

module.exports = {
  toFloat(value, fallback = 0) { return toNumber(value, fallback); },
  toString(value) { return value == null ? '' : String(value); },
  toInt(value, fallback = 0) { return Math.trunc(toNumber(value, fallback)); },
  toBoolean,
  levelToOnOff(value) { return toNumber(value, 0) > 0; },
  toggleBoolean(value) { return !toBoolean(value); },
  onOffToLevel(value) { return toBoolean(value) ? '0.99' : '0.0'; },
  WhToKWh(value) { return toNumber(value, 0) / 1000; },
  floatToPercent(value) { return Math.floor(toNumber(value, 0) * 100); },
  mAToA(value) { return toNumber(value, 0) / 1000; },
  toTrue() { return true; },
  tofix(value) { return toNumber(value, 0).toFixed(2); },
  faultLowbatToBoolean(value) { return toNumber(value, 0) === 6; },
};
