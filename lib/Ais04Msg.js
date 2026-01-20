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
 * Copyright (C) 2017 Thomas Runte <coding@etnur.net>.
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
var MOD_NAME = 'Ais04Msg';
var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'latitude', 'longitude', 'posAccuracy', 'utcYear', 'utcMonth', 'utcDay', 'utcHour', 'utcMinute', 'utcSecond', 'epfd'];
var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len  |Description      |Member   |T|Units
|0-5     |  6  |Message Type     |type     |u|Constant: 4
|6-7     |  2  |Repeat Indicator |repeat   |u|As in Common Navigation Block
|8-37    | 30  |MMSI             |mmsi     |u|9 decimal digits
|38-51   | 14  |Year (UTC)       |year     |u|UTC, 1-999, 0 = N/A (default)
|52-55   |  4  |Month (UTC)      |month    |u|1-12; 0 = N/A (default)
|56-60   |  5  |Day (UTC)        |day      |u|1-31; 0 = N/A (default)
|61-65   |  5  |Hour (UTC)       |hour     |u|0-23; 24 = N/A (default)
|66-71   |  6  |Minute (UTC)     |minute   |u|0-59; 60 = N/A (default)
|72-77   |  6  |Second (UTC)     |second   |u|0-59; 60 = N/A (default)
|78-78   |  1  |Fix quality      |accuracy |b|As in Common Navigation Block
|79-106  | 28  |Longitude        |lon      |I4|As in Common Navigation Block
|107-133 | 27  |Latitude         |lat      |I4|As in Common Navigation Block
|134-137 |  4  |Type of EPFD     |epfd     |e|See "EPFD Fix Types"
|138-147 | 10  |Spare            |         |x|Not used
// TODO
|148-148 |  1  |RAIM flag        |raim     |b|As for common navigation block
|149-167 | 19  |SOTDMA state     |radio    |u|As in same bits for Type 1
|==============================================================================
*/
var Ais04Msg = exports["default"] = /*#__PURE__*/function (_AisMessage) {
  function Ais04Msg(aisType, bitField, channel) {
    var _this;
    _classCallCheck(this, Ais04Msg);
    _this = _callSuper(this, Ais04Msg, [aisType, bitField, channel]);
    // TODO: check bitcount
    if (bitField.bits >= 167) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 04 msg:' + bitField.bits;
    }
    return _this;
  }
  _inherits(Ais04Msg, _AisMessage);
  return _createClass(Ais04Msg, [{
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
  }, {
    key: "utcYear",
    get: function get() {
      return this._bitField.getInt(38, 14, true);
    }
  }, {
    key: "utcMonth",
    get: function get() {
      return this._bitField.getInt(52, 4, true);
    }
  }, {
    key: "utcDay",
    get: function get() {
      return this._bitField.getInt(56, 5, true);
    }
  }, {
    key: "utcHour",
    get: function get() {
      return this._bitField.getInt(61, 5, true);
    }
  }, {
    key: "utcMinute",
    get: function get() {
      return this._bitField.getInt(66, 6, true);
    }
  }, {
    key: "utcSecond",
    get: function get() {
      return this._bitField.getInt(72, 6, true);
    }
  }, {
    key: "posAccuracy",
    get: function get() {
      return this._bitField.getInt(78, 1, true) === 1;
    }
  }, {
    key: "_getRawLat",
    value: function _getRawLat() {
      return this._bitField.getInt(107, 27, false);
    }
  }, {
    key: "_getRawLon",
    value: function _getRawLon() {
      return this._bitField.getInt(79, 28, false);
    }
  }, {
    key: "epfd",
    get: function get() {
      return this._bitField.getInt(134, 4, true);
    }
  }]);
}(_AisMessage2["default"]);
