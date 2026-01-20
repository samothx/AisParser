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
var MOD_NAME = 'Ais8MsgDac1Fid30';
var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'sequence', 'destinationMMSI', 'retransmitted', 'dac', 'fid', 'msgLinkageId', 'text'];
var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len    |Description              |Member    |T|Units
|0-5     | 6     |Message Type             |type      |u|Constant: 14
|6-7     | 2     |Repeat Indicator         |repeat    |u|Message repeat count
|8-37    | 30    |MMSI                     |mmsi      |u|9 decimal digits
|38-39   | 2     |Seq number               |seq       |u|0 - 3; refer to § 5.3.1, Annex 2 of ITU-R M.1371-3.
|40-69   | 30    |Destination              |dest      |u|9 decimal digits
|70      | 1     |Retransmitted flag       |retransm  |b|0=no retransm / default, 1=retansmitted
|71      | 1     |spare                    |          
|72-81   | 10    |Designated area code     |dac       |u|
|81-86   | 6     |Function identifier      |fid       |u|
|87-96   | 10    |Message linkage id       |          |u|
|97-...  | <=161 |Free text                |text      |t|6 bit ascii
|==============================================================================
*/
var Ais8MsgDac1Fid30 = exports["default"] = /*#__PURE__*/function (_AisMessage) {
  function Ais8MsgDac1Fid30(aisType, bitField, channel) {
    var _this;
    _classCallCheck(this, Ais8MsgDac1Fid30);
    _this = _callSuper(this, Ais8MsgDac1Fid30, [aisType, bitField, channel]);
    if (bitField.bits >= 104 && bitField.bits <= 1028) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 8 msg dac 1 fid 30:' + bitField.bits;
    }
    return _this;
  }
  _inherits(Ais8MsgDac1Fid30, _AisMessage);
  return _createClass(Ais8MsgDac1Fid30, [{
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

    // |38-39   | 2     |Seq number               |seq       |u|
  }, {
    key: "sequence",
    get: function get() {
      return this._bitField.getInt(38, 2, true);
    }

    // |40-69   | 30    |Destination              |dest      |u|
  }, {
    key: "destinationMMSI",
    get: function get() {
      return this._bitField.getInt(40, 30, true);
    }

    // |70      | 1     |Retransmitted flag          |retransm  |b|
  }, {
    key: "retransmitted",
    get: function get() {
      return this._bitField.getInt(70, 1, true) === 1;
    }

    // |71      | 1     |spare                    |
  }, {
    key: "spare",
    get: function get() {
      return this._bitField.getInt(71, 1, true);
    }

    // |72-81   | 10    |Designated area code     |dac       |u|
  }, {
    key: "dac",
    get: function get() {
      return this._bitField.getInt(72, 10, true);
    }

    // |82-87   | 6     |Function identifier      |fid       |u|
  }, {
    key: "fid",
    get: function get() {
      return this._bitField.getInt(82, 6, true);
    }

    // |88-97   | 10    |Message linkage id       |          |u|
  }, {
    key: "msgLinkageId",
    get: function get() {
      return this._bitField.getInt(88, 10, true);
    }

    // |98-...  | <=161 |Free text                |text      |t|6 bit ascii
  }, {
    key: "text",
    get: function get() {
      var textStart = 98;
      var maxTextBits = Math.min(this._bitField.bits - textStart, 161);
      var textLength = maxTextBits - maxTextBits % 6;
      if (textLength <= 0) {
        return '';
      }
      var raw = this._bitField.getString(textStart, textLength);
      // strip leading @ padding and apply existing formatting helper
      return this._formatStr(raw.replace(/^@+/, ''));
    }
  }]);
}(_AisMessage2["default"]);
