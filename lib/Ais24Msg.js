'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _AisBitField = require('./AisBitField');

var _AisBitField2 = _interopRequireDefault(_AisBitField);

var _AisMessage2 = require('./AisMessage');

var _AisMessage3 = _interopRequireDefault(_AisMessage2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
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

var MOD_NAME = 'Ais24Msg';

var SUPPORTED_FIELDS_A = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'partNo', 'name'];

var SUPPORTED_FIELDS_B_NO_TENDER = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'partNo', 'shipType', 'callSign', 'vendorId', 'dimToBow', 'dimToBowStatus', 'dimToStern', 'dimToSternStatus', 'dimToPort', 'dimToPortStatus', 'dimToStbrd', 'dimToStbrdStatus'];

var SUPPORTED_FIELDS_B_TENDER = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'partNo', 'shipType', 'callSign', 'vendorId', 'mothershipMmsi'];

var suppValuesValidA = false;
var suppValuesA = {};
var suppValuesValidBNT = false;
var suppValuesBT = {};
var suppValuesValidBT = false;
var suppValuesBNT = {};

/*
|==============================================================================
|Field   |Len |Description            | Member         |T|Units
|0-5     |  6 | Message Type          | type           |u|Constant: 24
|6-7     |  2 | Repeat Indicator      | repeat         |u|As in CNB
|8-37    | 30 | MMSI                  | mmsi           |u|9 digits
|38-39   |  2 | Part Number           | partno         |u|0-1
|40-159  |120 | Vessel Name           | shipname       |t|(Part A) 20 sixbit chars
|160-167 |  8 | Spare                 |                |x|(Part A) Not used
|40-47   |  8 | Ship Type             | shiptype       |e|(Part B) See "Ship Types"
|48-89   | 42 | Vendor ID             | vendorid       |t|(Part B) 7 six-bit chars
|90-131  | 42 | Call Sign             | callsign       |t|(Part B) As in Message Type 5
|132-140 |  9 | Dimension to Bow      | to_bow         |u|(Part B) Meters
|141-149 |  9 | Dimension to Stern    | to_stern       |u|(Part B) Meters
|150-155 |  6 | Dimension to Port     | to_port        |u|(Part B) Meters
|156-161 |  6 | Dimension to Starboard| to_starboard   |u|(Part B) Meters
|132-161 | 30 | Mothership MMSI       | mothership_mmsi|u|(Part B) See below
|162-167 |  6 | Spare                 |                |x|(Part B) Not used
|===============================================================================
*/

var Ais24Msg = function (_AisMessage) {
  _inherits(Ais24Msg, _AisMessage);

  function Ais24Msg(aisType, bitField, channel) {
    _classCallCheck(this, Ais24Msg);

    var _this = _possibleConstructorReturn(this, (Ais24Msg.__proto__ || Object.getPrototypeOf(Ais24Msg)).call(this, aisType, bitField, channel));

    if (bitField.bits >= 39) {
      _this._partNo = _this._bitField.getInt(38, 2, true) ? 1 : 0;

      if (_this._partNo === 0 && bitField.bits >= 159 || bitField.bits >= 161) {
        _this._valid = 'VALID';
        return _possibleConstructorReturn(_this);
      }
    }
    _this._valid = 'INVALID';
    _this._errMsg = 'invalid bitcount for type 24 msg:' + bitField.bits;
    return _this;
  }

  _createClass(Ais24Msg, [{
    key: '_isTender',
    value: function _isTender() {
      if (typeof this._tender !== 'boolean') {
        this._tender = String(this.mmsi).startsWith('98');
      }
      return this._tender;
    }
  }, {
    key: '_getDimToBow',
    value: function _getDimToBow() {
      if (this.partNo === 1 && !this._isTender()) {
        return this._bitField.getInt(132, 9, true);
      } else {
        return NaN;
      }
    }
  }, {
    key: '_getDimToStern',
    value: function _getDimToStern() {
      if (this.partNo === 1 && !this._isTender()) {
        return this._bitField.getInt(141, 9, true);
      } else {
        return NaN;
      }
    }
  }, {
    key: '_getDimToPort',
    value: function _getDimToPort() {
      if (this.partNo === 1 && !this._isTender()) {
        return this._bitField.getInt(150, 6, true);
      } else {
        return NaN;
      }
    }
  }, {
    key: '_getDimToStbrd',
    value: function _getDimToStbrd() {
      if (this.partNo === 1 && !this._isTender()) {
        return this._bitField.getInt(156, 6, true);
      } else {
        return NaN;
      }
    }
  }, {
    key: 'supportedValues',
    get: function get() {
      if (this.partNo === 0) {
        if (!suppValuesValidA) {
          SUPPORTED_FIELDS_A.forEach(function (field) {
            var unit = _AisMessage3.default.getUnit(field);
            if (unit) {
              suppValuesA[field] = unit;
            } else {
              console.warn(MOD_NAME + 'field without unit encountered:' + field);
            }
          });
          suppValuesValidA = true;
        }
        return suppValuesA;
      } else {
        if (this._isTender()) {
          if (!suppValuesValidBT) {
            SUPPORTED_FIELDS_B_TENDER.forEach(function (field) {
              var unit = _AisMessage3.default.getUnit(field);
              if (unit) {
                suppValuesBT[field] = unit;
              } else {
                console.warn(MOD_NAME + 'field without unit encountered:' + field);
              }
            });
            suppValuesValidBT = true;
          }
          return suppValuesBT;
        } else {
          if (!suppValuesValidBNT) {
            SUPPORTED_FIELDS_B_NO_TENDER.forEach(function (field) {
              var unit = _AisMessage3.default.getUnit(field);
              if (unit) {
                suppValuesBNT[field] = unit;
              } else {
                console.warn(MOD_NAME + 'field without unit encountered:' + field);
              }
            });
            suppValuesValidBNT = true;
          }
          return suppValuesBNT;
        }
      }
    }
  }, {
    key: 'partNo',
    get: function get() {
      if (typeof this._partNo === 'number') {
        return this._partNo;
      } else {
        return this._partNo = this._bitField.getInt(38, 2, true) ? 1 : 0;
      }
    }
  }, {
    key: 'name',
    get: function get() {
      if (this.partNo === 0) {
        return this._formatStr(this._bitField.getString(40, 120));
      } else {
        return '';
      }
    }
  }, {
    key: 'shipType',
    get: function get() {
      if (this.partNo === 1) {
        return this._bitField.getInt(40, 8, true);
      } else {
        return NaN;
      }
    }
  }, {
    key: 'callSign',
    get: function get() {
      if (this.partNo === 1) {
        return this._formatStr(this._bitField.getString(90, 42));
      } else {
        return '';
      }
    }
  }, {
    key: 'vendorId',
    get: function get() {
      if (this.partNo === 1) {
        return this._formatStr(this._bitField.getString(48, 42));
      } else {
        return '';
      }
    }
  }, {
    key: 'mothershipMmsi',
    get: function get() {
      if (this.partNo === 1 && this._isTender()) {
        return this._bitField.getInt(132, 30, true);
      } else {
        return NaN;
      }
    }
  }]);

  return Ais24Msg;
}(_AisMessage3.default);

exports.default = Ais24Msg;
