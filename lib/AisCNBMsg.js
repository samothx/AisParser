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
var MOD_NAME = 'AisCNBMsg';
var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'class', 'navStatus', 'navStatusStr', 'rotStatus', 'rot', 'heading', 'sogStatus', 'sog', 'cog', 'latitude', 'longitude', 'posAccuracy', 'utcTsSec', 'utcTsStatus'];
var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len |Description             |Member    |T|Units
|0-5     | 6  |Message Type            |type      |u|Constant: 1-3
|6-7     | 2  |Repeat Indicator        |repeat    |u|Message repeat count
|8-37    |30  |MMSI                    |mmsi      |u|9 decimal digits
|38-41   | 4  |Navigation Status       |status    |e|See "Navigation Status"
|42-49   | 8  |Rate of Turn (ROT)      |turn      |I3|See below
|50-59   |10  |Speed Over Ground (SOG) |speed     |U1|See below
|60-60   | 1  |Position Accuracy       |accuracy  |b|See below
|61-88   |28  |Longitude               |lon       |I4|Minutes/10000 (see below)
|89-115  |27  |Latitude                |lat       |I4|Minutes/10000 (see below)
|116-127 |12  |Course Over Ground (COG)|course    |U1|Relative to true north,
                                                     to 0.1 degree precision
|128-136 | 9  |True Heading (HDG)      |heading   |u|0 to 359 degrees,
                                                      511 = not available.
|137-142 | 6  |Time Stamp              |second    |u|Second of UTC timestamp
TODO:
|143-144 | 2  |Maneuver Indicator      |maneuver  |e|See "Maneuver Indicator"
|145-147 | 3  |Spare                   |          |x|Not used
|148-148 | 1  |RAIM flag               |raim      |b|See below
|149-167 |19  |Radio status            |radio     |u|See below
|==============================================================================

*/
var AisCNBMsg = exports["default"] = /*#__PURE__*/function (_AisMessage) {
  function AisCNBMsg(aisType, bitField, channel) {
    var _this;
    _classCallCheck(this, AisCNBMsg);
    _this = _callSuper(this, AisCNBMsg, [aisType, bitField, channel]);
    if (bitField.bits >= 144) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type CNB msg:' + bitField.bits;
    }
    return _this;
  }
  _inherits(AisCNBMsg, _AisMessage);
  return _createClass(AisCNBMsg, [{
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
  }, {
    key: "navStatus",
    get: function get() {
      return this._bitField.getInt(38, 4, true);
    }
  }, {
    key: "_getRawRot",
    value: function _getRawRot() {
      return this._bitField.getInt(42, 8, false);
    }
  }, {
    key: "_getRawHeading",
    value: function _getRawHeading() {
      return this._bitField.getInt(128, 9, true);
    }
  }, {
    key: "_getRawSog",
    value: function _getRawSog() {
      return this._bitField.getInt(50, 10, true);
    }
  }, {
    key: "_getRawCog",
    value: function _getRawCog() {
      return this._bitField.getInt(116, 12, true);
    }
  }, {
    key: "posAccuracy",
    get: function get() {
      return this._bitField.getInt(60, 1, true) === 1;
    }
  }, {
    key: "_getUtcSec",
    value: function _getUtcSec() {
      return this._bitField.getInt(137, 6, true);
    }
  }, {
    key: "_getRawLat",
    value: function _getRawLat() {
      return this._bitField.getInt(89, 27, false);
    }
  }, {
    key: "_getRawLon",
    value: function _getRawLon() {
      return this._bitField.getInt(61, 28, false);
    }
  }]);
}(_AisMessage2["default"]);
