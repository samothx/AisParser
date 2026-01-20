"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _AisBitField = _interopRequireDefault(require("./AisBitField"));
var _AisMessage2 = _interopRequireDefault(require("./AisMessage"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); } /*
 * AisParser: A parser for NMEA0183 AIS messages.
 * Copyright (C) 2025 Davide Gessa <gessadavide@gmail.com>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Apache License Version 2.0 as published by
 * Apache Software foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the Apache License Version 2.0
 * along with this program.  If not, see <https://www.apache.org/licenses/LICENSE-2.0/>.
 */
var MOD_NAME = 'Ais8MsgDac367Fid23';
var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'dac', 'fid', 'version', 'utcDay', 'utcHour', 'utcMinute', 'longitude', 'latitude', 'airPressure', 'airTemperature', 'avgWindSpeed', 'avgGustSpeed', 'avgWindDirection'];
var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field |Len |Description |Member |T|Units
|0-5 | 6 |Message Type |type |u|Constant: 14
|6-7 | 2 |Repeat Indicator |repeat |u|Message repeat count
|8-37 | 30 |MMSI |mmsi |u|9 decimal digits
|38-39 | 2 |spare | |u|not used
|40-49 | 10 |Designated area code |dac |u|
|50-55 | 6 |Function identifier |fid |u|
|56-58 | 3 |Version |version |u| 0=test, 1-7=version
|59-63 | 5 |Day (UTC) |day |u|1-31; 0 = N/A (default)
|64-68 | 5 |Hour (UTC) |hour |u|0-23; 24 = N/A (default)
|69-74 | 6 |Minute (UTC) |minute |u|0-59; 60 = N/A (default)
|75-99 | 25 |Longitude |lon |I4| Long in 1/1000 min, +-180 deg as per 2's complement (e => +, w => -, 181 not available)
|100-123 | 24 |Latitude |lat |I4| Lat in 1/1000 min, +-90 deg as per 2's complement (n => +, s => -, 91 not available)
|124-132 | 9  |Air Pressure |air_pressure |u |0=799 hPa/less, 1–401=800–1200 hPa, 402=1201+/N/A=511
|133-143 | 11 |Air Temperature |air_temp |I4|Dry bulb temp, 0.1°C steps, -60.0 to +60.0°C (-1024=N/A, 601–1023 reserved)
|144-150 | 7  |Avg 10-min wind speed |avg_wind_speed |u|0-125 knots; 127 = N/A (default)
|151-157 | 7  |Avg 10-min gust speed|avg_gust_speed |u|0-125 knots; 127 = N/A (default)
|158-166 | 9  |Avg 10-min wind direction|avg_wind_dir |u|0-359 degree; 360 = N/A (default)
|167     | 1  |Spare | |u |Not used, set to zero
|==============================================================================
*/
var Ais8MsgDac367Fid23 = exports["default"] = /*#__PURE__*/function (_AisMessage) {
  function Ais8MsgDac367Fid23(aisType, bitField, channel) {
    var _this;
    _classCallCheck(this, Ais8MsgDac367Fid23);
    _this = _callSuper(this, Ais8MsgDac367Fid23, [aisType, bitField, channel]);
    if (bitField.bits == 168) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 8 msg dac 1 fid 31:' + bitField.bits;
    }
    return _this;
  }
  _inherits(Ais8MsgDac367Fid23, _AisMessage);
  return _createClass(Ais8MsgDac367Fid23, [{
    key: "class",
    get: function get() {
      return 'A';
    }
  }, {
    key: "supportedValues",
    get: function get() {
      if (!suppValuesValid) {
        SUPPORTED_FIELDS.forEach(function (field) {
          var unit = _AisMessage2["default"].getUnit(field);
          if (unit) {
            suppValues[field] = unit;
          } else {
            console.warn(MOD_NAME + 'field without unit encountered:' + field);
          }
        });
        suppValuesValid = true;
      }
      return suppValues;
    }

    // |40-49   | 10    |Designated area code     |dac       |u|
  }, {
    key: "dac",
    get: function get() {
      return this._bitField.getInt(40, 10, true);
    }

    // |50-55   | 6     |Function identifier      |fid       |u|
  }, {
    key: "fid",
    get: function get() {
      return this._bitField.getInt(50, 6, true);
    }

    // |56-58 | 3 |Version |version |u| 0=test, 1-7=version
  }, {
    key: "version",
    get: function get() {
      return this._bitField.getInt(56, 3, true);
    }

    // |59-63 | 5 |Day (UTC) |day |u|1-31; 0 = N/A (default)
  }, {
    key: "day",
    get: function get() {
      var v = this._bitField.getInt(59, 5, true);
      return v === 0 ? NaN : v;
    }

    // |64-68 | 5 |Hour (UTC) |hour |u|0-23; 24 = N/A (default)
  }, {
    key: "hour",
    get: function get() {
      var v = this._bitField.getInt(64, 5, true);
      return v >= 24 ? NaN : v;
    }

    // |69-74 | 6 |Minute (UTC) |minute |u|0-59; 60 = N/A (default)
  }, {
    key: "minute",
    get: function get() {
      var v = this._bitField.getInt(69, 6, true);
      return v >= 60 ? NaN : v;
    }

    // |75-99 | 25 |Longitude |lon |I4| Long in 1/1000 min, +-180 deg as per 2's complement (e => +, w => -, 181 not available)
  }, {
    key: "_getRawLon",
    value: function _getRawLon() {
      return this._bitField.getInt(75, 25, false) * 10;
    }

    // |100-123 | 24 |Latitude |lat |I4| Lat in 1/1000 min, +-90 deg as per 2's complement (n => +, s => -, 91 not available)
  }, {
    key: "_getRawLat",
    value: function _getRawLat() {
      return this._bitField.getInt(100, 24, false) * 10;
    }

    // |124-132 | 9  |Air Pressure |air_pressure |u |0=799 hPa/less, 1–401=800–1200 hPa, 402=1201+/N/A=511
  }, {
    key: "airPressure",
    get: function get() {
      var v = this._bitField.getInt(124, 9, true);
      if (v === 0) return 799;
      if (v === 402) return 1201;
      if (v >= 403) return NaN;
      return 800 + v;
    }

    // |133-143 | 11 |Air Temperature |air_temp |I4|Dry bulb temp, 0.1°C steps, -60.0 to +60.0°C (-1024=N/A, 601–1023 reserved)
  }, {
    key: "airTemperature",
    get: function get() {
      var v = this._bitField.getInt(133, 11, false);
      if (v === -1024) return NaN;
      return v / 10.0;
    }

    // |144-150 | 7  |Avg 10-min wind speed |avg_wind_speed |u|0-125 knots; 127 = N/A (default)
  }, {
    key: "avgWindSpeed",
    get: function get() {
      var v = this._bitField.getInt(144, 7, true);
      return v >= 127 ? NaN : v;
    }

    // |151-157 | 7  |Avg 10-min gust speed|avg_gust_speed |u|0-125 knots; 127 = N/A (default)
  }, {
    key: "avgGustSpeed",
    get: function get() {
      var v = this._bitField.getInt(151, 7, true);
      return v >= 127 ? NaN : v;
    }

    // |158-166 | 9  |Avg 10-min wind direction|avg_wind_dir |u|0-359 degree; 360 = N/A (default)
  }, {
    key: "avgWindDirection",
    get: function get() {
      var v = this._bitField.getInt(158, 9, true);
      return v >= 360 ? NaN : v;
    }
  }]);
}(_AisMessage2["default"]);
