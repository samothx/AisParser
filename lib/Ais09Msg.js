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
 * Copyright (C) 2026 Davide Gessa <gessadavide@gmail.com>.
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
var MOD_NAME = 'Ais09Msg';

/*
|==============================================================================
|Field   |Len |Description             |Member         |T|Units
|0-5     | 6  |Message Type            |type           |u|Constant: 9
|6-7     | 2  |Repeat Indicator        |repeat         |u|0-3
|8-37    |30  |MMSI                    |mmsi           |u|9 decimal digits
|38-49   |12  |Altitude (GNSS)         |altitude       |u|0-4094m, 4095=N/A
|50-59   |10  |Speed Over Ground       |speed          |u|0-1022 knots, 1023=N/A
|60-60   | 1  |Position Accuracy       |accuracy       |b|1=high (<=10m)
|61-88   |28  |Longitude               |lon            |I4|Minutes/10000
|89-115  |27  |Latitude                |lat            |I4|Minutes/10000
|116-127 |12  |Course Over Ground      |course         |U1|0.1 degrees
|128-133 | 6  |Time Stamp              |second         |u|UTC seconds
|134-134 | 1  |Altitude Sensor         |altitudeSensor |u|0=GNSS, 1=barometric
|135-141 | 7  |Spare                   |               |x|Not used
|142-142 | 1  |DTE                     |dte            |b|Data terminal ready
|143-145 | 3  |Spare                   |               |x|Not used
|146-146 | 1  |Assigned Mode Flag      |assigned       |b|0=autonomous, 1=assigned
|147-147 | 1  |RAIM Flag               |raim           |b|RAIM in use
|148-148 | 1  |Comm State Selector     |commStateSelector|u|0=SOTDMA, 1=ITDMA
|149-167 |19  |Communication State     |commState      |u|SOTDMA/ITDMA state
|==============================================================================
Total: 168 bits
*/

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'altitude', 'altitudeStatus', 'sogStatus', 'sog', 'posAccuracy', 'longitude', 'latitude', 'cog', 'utcTsSec', 'utcTsStatus', 'altitudeSensor', 'dte', 'assignedMode', 'raim'];
var suppValuesValid = false;
var suppValues = {};
var Ais09Msg = exports["default"] = /*#__PURE__*/function (_AisMessage) {
  function Ais09Msg(aisType, bitField, channel) {
    var _this;
    _classCallCheck(this, Ais09Msg);
    _this = _callSuper(this, Ais09Msg, [aisType, bitField, channel]);
    if (bitField.bits >= 168) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 9 msg:' + bitField.bits;
    }
    return _this;
  }
  _inherits(Ais09Msg, _AisMessage);
  return _createClass(Ais09Msg, [{
    key: "supportedValues",
    get: function get() {
      if (!suppValuesValid) {
        SUPPORTED_FIELDS.forEach(function (field) {
          var unit = _AisMessage2["default"].getUnit(field);
          if (unit) {
            suppValues[field] = unit;
          } else {
            console.warn(MOD_NAME + ' field without unit encountered:' + field);
          }
        });
        suppValuesValid = true;
      }
      return suppValues;
    }
  }, {
    key: "class",
    get: function get() {
      return 'SAR';
    }

    // Altitude: 12 bits at position 38
    // 0-4094 = altitude in meters
    // 4095 = not available
  }, {
    key: "_getRawAltitude",
    value: function _getRawAltitude() {
      return this._bitField.getInt(38, 12, true);
    }
  }, {
    key: "altitudeStatus",
    get: function get() {
      var alt = this._getRawAltitude();
      if (alt === 4095) return 'NA';
      if (alt === 4094) return 'HIGH';
      return 'VALID';
    }
  }, {
    key: "altitude",
    get: function get() {
      var alt = this._getRawAltitude();
      if (alt >= 4094) return NaN;
      return alt;
    }

    // SOG: 10 bits at position 50
    // 0-1022 = speed in knots (no decimal)
    // 1023 = not available
  }, {
    key: "_getRawSog",
    value: function _getRawSog() {
      return this._bitField.getInt(50, 10, true);
    }
  }, {
    key: "sog",
    get: function get() {
      var sog = this._getRawSog();
      if (sog >= 1023) return NaN;
      return sog;
    }

    // Position Accuracy: 1 bit at position 60
  }, {
    key: "posAccuracy",
    get: function get() {
      return this._bitField.getInt(60, 1, true) === 1;
    }

    // Longitude: 28 bits at position 61
  }, {
    key: "_getRawLon",
    value: function _getRawLon() {
      return this._bitField.getInt(61, 28, false);
    }

    // Latitude: 27 bits at position 89
  }, {
    key: "_getRawLat",
    value: function _getRawLat() {
      return this._bitField.getInt(89, 27, false);
    }

    // COG: 12 bits at position 116
    // 0-3599 = 0.0-359.9 degrees
    // 3600 = not available
  }, {
    key: "_getRawCog",
    value: function _getRawCog() {
      return this._bitField.getInt(116, 12, true);
    }

    // UTC Timestamp: 6 bits at position 128
  }, {
    key: "_getUtcSec",
    value: function _getUtcSec() {
      return this._bitField.getInt(128, 6, true);
    }

    // Altitude Sensor: 1 bit at position 134
    // 0 = GNSS, 1 = barometric
  }, {
    key: "altitudeSensor",
    get: function get() {
      return this._bitField.getInt(134, 1, true);
    }

    // DTE: 1 bit at position 142
    // 0 = data terminal available, 1 = not available
  }, {
    key: "dte",
    get: function get() {
      return this._bitField.getInt(142, 1, true) === 0;
    }

    // Assigned Mode Flag: 1 bit at position 146
    // 0 = autonomous/continuous mode, 1 = assigned mode
  }, {
    key: "assignedMode",
    get: function get() {
      return this._bitField.getInt(146, 1, true) === 1;
    }

    // RAIM Flag: 1 bit at position 147
  }, {
    key: "raim",
    get: function get() {
      return this._bitField.getInt(147, 1, true) === 1;
    }

    // Communication State Selector: 1 bit at position 148
    // 0 = SOTDMA, 1 = ITDMA
  }, {
    key: "commStateSelector",
    get: function get() {
      return this._bitField.getInt(148, 1, true);
    }

    // Communication State: 19 bits at position 149
  }, {
    key: "commState",
    get: function get() {
      return this._bitField.getInt(149, 19, true);
    }
  }]);
}(_AisMessage2["default"]);
