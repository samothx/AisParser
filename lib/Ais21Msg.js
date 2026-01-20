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
|Field    |Len |Description            |Member      |T|Units
|0-5      | 6  |Message Type           |type        |u|Constant: 21
|6-7      | 2  |Repeat Indicator       |repeat      |u|As in CNB
|8-37     |30  |MMSI                   |mmsi        |u|9 digits
|38-42    | 5  |Aid type               |aid_type    |e|See "Navaid Types"
|43-162  1|120 |Name                   |name        |t|Name in sixbit chars
|163-163  | 1  |Position Accuracy      |accuracy    |b|As in CNB
|164-191  |28  |Longitude              |lon         |I4|Minutes/10000 (as in CNB)
|192-218  |27  |Latitude               |lat         |I4|Minutes/10000 (as in CNB)
|219-227  | 9  |Dimension to Bow       |to_bow      |u|Meters
|228-236  | 9  |Dimension to Stern     |to_stern    |u|Meters
|237-242  | 6  |Dimension to Port      |to_port     |u|Meters
|243-248  | 6  |Dimension to Starboard |to_starboard|u|Meters
|249-252  | 4  |Type of EPFD           |epfd        |e|As in Message Type 4
|253-258  | 6  |UTC Second             |second      |u|As in Message Type 5
|259-259  | 1  |Off-Position Indicator |off_position|b|See Below
|260-267  | 8  |Regional reserved      |regional    |u|Uninterpreted
|268-268  | 1  |RAIM flag              |raim        |b|As in CNB
|269-269  | 1  |Virtual-aid flag       |virtual_aid |b|See Below
|270-270  | 1  |Assigned-mode flag     |assigned    |b|See <<IALA>> for details
|271-271  | 1  |Spare                  |            |x|Not used
|272-360  |88  |Name Extension         |            |t|See Below
|==============================================================================
*/

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'name', 'latitude', 'longitude', 'posAccuracy', 'dimToBow', 'dimToBowStatus', 'dimToStern', 'dimToSternStatus', 'dimToPort', 'dimToPortStatus', 'dimToStbrd', 'dimToStbrdStatus', 'length', 'width', 'epfd', 'epfdStr', 'utcTsSec', 'utcTsStatus', 'offPosInd', 'aidType', 'aidTypeStr', 'nameExt'];
var suppValuesValid = false;
var suppValues = {};
var Ais21Msg = exports["default"] = /*#__PURE__*/function (_AisMessage) {
  function Ais21Msg(aisType, bitField, channel) {
    var _this;
    _classCallCheck(this, Ais21Msg);
    _this = _callSuper(this, Ais21Msg, [aisType, bitField, channel]);
    if (bitField.bits >= 271) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 21 msg:' + bitField.bits;
    }
    return _this;
  }
  _inherits(Ais21Msg, _AisMessage);
  return _createClass(Ais21Msg, [{
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

    // |38-42    | 5  |Aid type               |aid_type    |e|See "Navaid Types"
  }, {
    key: "aidType",
    get: function get() {
      return this._bitField.getInt(38, 5, true);
    }

    //  |43-162  1|120 |Name                   |name        |t|Name in sixbit chars
  }, {
    key: "name",
    get: function get() {
      return this._formatStr(this._bitField.getString(43, 162));
    }

    // |163-163  | 1  |Position Accuracy      |accuracy    |b|As in CNB
  }, {
    key: "posAccuracy",
    get: function get() {
      return this._bitField.getInt(163, 1, true) === 1;
    }

    // |164-191  |28  |Longitude              |lon         |I4|Minutes/10000 (as in CNB)
  }, {
    key: "_getRawLon",
    value: function _getRawLon() {
      return this._bitField.getInt(164, 28, false);
    }

    //|192-218  |27  |Latitude               |lat         |I4|Minutes/10000 (as in CNB)
  }, {
    key: "_getRawLat",
    value: function _getRawLat() {
      return this._bitField.getInt(192, 27, false);
    }

    // |219-227  | 9  |Dimension to Bow       |to_bow      |u|Meters
  }, {
    key: "_getDimToBow",
    value: function _getDimToBow() {
      return this._bitField.getInt(219, 9, true);
    }

    // |228-236  | 9  |Dimension to Stern     |to_stern    |u|Meters
  }, {
    key: "_getDimToStern",
    value: function _getDimToStern() {
      return this._bitField.getInt(228, 9, true);
    }

    // |237-242  | 6  |Dimension to Port      |to_port     |u|Meters
  }, {
    key: "_getDimToPort",
    value: function _getDimToPort() {
      return this._bitField.getInt(237, 6, true);
    }

    // |243-248  | 6  |Dimension to Starboard |to_starboard|u|Meters
  }, {
    key: "_getDimToStbrd",
    value: function _getDimToStbrd() {
      return this._bitField.getInt(243, 6, true);
    }

    // |249-252  | 4  |Type of EPFD           |epfd        |e|As in Message Type 4
  }, {
    key: "epfd",
    get: function get() {
      return this._bitField.getInt(249, 4, true);
    }

    // |253-258  | 6  |UTC Second             |second      |u|As in Message Type 5
  }, {
    key: "_getUtcSec",
    value: function _getUtcSec() {
      return this._bitField.getInt(253, 6, true);
    }

    // |259-259  | 1  |Off-Position Indicator |off_position|b|See Below
  }, {
    key: "offPosInd",
    get: function get() {
      if (this._getUtcSec() < 60) {
        return this._bitField.getInt(163, 1, true) === 0 ? 'IN_POS' : 'OFF_POS';
      } else {
        return 'NA';
      }
    }

    // |272-360  |88  |Name Extension         |            |t|See Below
  }, {
    key: "nameExt",
    get: function get() {
      if (this._bitField.bits > 272) {
        var chars = Math.floor((this._bitField.bits - 272) / 6);
        if (chars > 0) {
          return this._formatStr(this._bitField.getString(272, chars * 6));
        }
      }
      return '';
    }
  }]);
}(_AisMessage2["default"]);
