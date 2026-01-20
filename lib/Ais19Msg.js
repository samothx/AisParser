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
var MOD_NAME = 'Ais21Msg';
/*
|==============================================================================
|Field    |Len |Description            |Member       |T|Units
|0-5      |  6 |Message Type           |type         |u|Constant: 19
|6-7      |  2 |Repeat Indicator       |repeat       |u|As in CNN
|8-37     | 30 |MMSI                   |mmsi         |u|9 digits
|38-45    |  8 |Regional Reserved      |reserved     |u|
|46-55    | 10 |Speed Over Ground      |speed        |u|As in CNB.
|56-56    |  1 |Position Accuracy      |accuracy     |b|As in CNB.
|57-84    | 28 |Longitude              |lon          |I4|Minutes/10000 (as in CNB)
|85-111   | 27 |Latitude               |lat          |I4|Minutes/10000 (as in CNB)
|112-123  | 12 |Course Over Ground     |course       |U1|Relative to true north,
                                                        units of 0.1 degrees
|124-132  |  9 |True Heading           |heading      |u|0 to 359 degrees,
                                                        511 = N/A
|133-138  |  6 |Time Stamp             |second       |u|Second of UTC timestamp.
|139-142  |  4 |Regional reserved      |regional     |u|Uninterpreted
|143-262  |120 |Name                   |shipname     |s|20 6-bit characters
|263-270  |  8 |Type of ship and cargo |shiptype     |u|As in Message 5
|271-279  |  9 |Dimension to Bow       |to_bow       |u|Meters
|280-288  |  9 |Dimension to Stern     |to_stern     |u|Meters
|289-294  |  6 |Dimension to Port      |to_port      |u|Meters
|295-300  |  6 |Dimension to Starboard |to_starboard |u|Meters
|301-304  |  4 |Position Fix Type      |epfd         |e|See "EPFD Fix Types"
|305-305  |  1 |RAIM flag              |raim         |b|As in CNB.
|306-306  |  1 |DTE                    |dte          |b|0=Data terminal ready,
                                                       1=Not ready (default).
|307-307  |  1 |Assigned mode flag     |assigned     |u|See <<IALA>> for details
|308-311  |  4 |Spare                  |             |x|Unused, should be zero
|==============================================================================
*/
var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'class', 'heading', 'sogStatus', 'sog', 'cog', 'latitude', 'longitude', 'posAccuracy', 'utcTsSec', 'utcTsStatus', 'name', 'shipType', 'shipTypeStr', 'dimToBow', 'dimToBowStatus', 'dimToStern', 'dimToSternStatus', 'dimToPort', 'dimToPortStatus', 'dimToStbrd', 'dimToStbrdStatus', 'epfd', 'epfdStr'];
var suppValuesValid = false;
var suppValues = {};
var Ais19Msg = exports["default"] = /*#__PURE__*/function (_AisMessage) {
  function Ais19Msg(aisType, bitField, channel) {
    var _this;
    _classCallCheck(this, Ais19Msg);
    _this = _callSuper(this, Ais19Msg, [aisType, bitField, channel]);
    if (bitField.bits >= 311) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 19 msg:' + bitField.bits;
    }
    return _this;
  }
  _inherits(Ais19Msg, _AisMessage);
  return _createClass(Ais19Msg, [{
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
    key: "class",
    get: function get() {
      return 'B';
    }

    // |124-132  |  9 |True Heading           |heading      |u|0 to 359 degrees,
  }, {
    key: "_getRawHeading",
    value: function _getRawHeading() {
      return this._bitField.getInt(124, 9, true);
    }

    //|46-55    | 10 |Speed Over Ground      |speed        |u|As in CNB.
  }, {
    key: "_getRawSog",
    value: function _getRawSog() {
      return this._bitField.getInt(46, 10, true);
    }

    // |112-123  | 12 |Course Over Ground     |course       |U1|Relative to true north,
  }, {
    key: "_getRawCog",
    value: function _getRawCog() {
      return this._bitField.getInt(112, 12, true);
    }

    // |56-56    |  1 |Position Accuracy      |accuracy     |b|As in CNB.
  }, {
    key: "posAccuracy",
    get: function get() {
      return this._bitField.getInt(56, 1, true) === 1;
    }

    // |133-138  |  6 |Time Stamp             |second       |u|Second of UTC timestamp.
  }, {
    key: "_getUtcSec",
    value: function _getUtcSec() {
      return this._bitField.getInt(133, 6, true);
    }

    // |85-111   | 27 |Latitude               |lat          |I4|Minutes/10000 (as in CNB)
  }, {
    key: "_getRawLat",
    value: function _getRawLat() {
      return this._bitField.getInt(85, 27, false);
    }

    // |57-84    | 28 |Longitude              |lon          |I4|Minutes/10000 (as in CNB)
  }, {
    key: "_getRawLon",
    value: function _getRawLon() {
      return this._bitField.getInt(57, 28, false);
    }

    // |143-262  |120 |Name                   |shipname     |s|20 6-bit characters
  }, {
    key: "name",
    get: function get() {
      return this._formatStr(this._bitField.getString(143, 120));
    }

    // |263-270  |  8 |Type of ship and cargo |shiptype     |u|As in Message 5
  }, {
    key: "shipType",
    get: function get() {
      return this._bitField.getInt(263, 8, true);
    }

    // |271-279  |  9 |Dimension to Bow       |to_bow       |u|Meters
  }, {
    key: "_getDimToBow",
    value: function _getDimToBow() {
      return this._bitField.getInt(271, 9, true);
    }

    // |280-288  |  9 |Dimension to Stern     |to_stern     |u|Meters
  }, {
    key: "_getDimToStern",
    value: function _getDimToStern() {
      return this._bitField.getInt(280, 9, true);
    }

    // |289-294  |  6 |Dimension to Port      |to_port      |u|Meters
  }, {
    key: "_getDimToPort",
    value: function _getDimToPort() {
      return this._bitField.getInt(289, 6, true);
    }

    // |295-300  |  6 |Dimension to Starboard |to_starboard |u|Meters
  }, {
    key: "_getDimToStbrd",
    value: function _getDimToStbrd() {
      return this._bitField.getInt(295, 6, true);
    }

    // |301-304  |  4 |Position Fix Type      |epfd         |e|See "EPFD Fix Types"
  }, {
    key: "epfd",
    get: function get() {
      return this._bitField.getInt(301, 4, true);
    }
  }]);
}(_AisMessage2["default"]);
