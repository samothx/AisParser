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

var MOD_NAME = 'Ais05Msg';
var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'callSign', 'name', 'aisVer', 'imo', 'shipType', 'shipTypeStr', 'dimToBow', 'dimToBowStatus', 'dimToStern', 'dimToSternStatus', 'dimToPort', 'dimToPortStatus', 'dimToStbrd', 'dimToStbrdStatus', 'epfd', 'epfdStr', 'etaMonth', 'etaDay', 'etaHour', 'etaMinute', 'draught', 'destination'];

var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len |Description            |Member/Type  |T|Encoding
|0-5     |  6 |Message Type           |type         |u|Constant: 5
|6-7     |  2 |Repeat Indicator       |repeat       |u|Message repeat count
|8-37    | 30 |MMSI                   |mmsi         |u|9 digits
|38-39   |  2 |AIS Version            |ais_version  |u|0=<<ITU1371>>,
                                                       1-3 = future editions
|40-69   | 30 |IMO Number             |imo          |u|IMO ship ID number
|70-111  | 42 |Call Sign              |callsign     |t|7 six-bit characters
|112-231 |120 |Vessel Name            |shipname     |t|20 six-bit characters
|232-239 |  8 |Ship Type              |shiptype     |e|See "Codes for Ship Type"
|240-248 |  9 |Dimension to Bow       |to_bow       |u|Meters
|249-257 |  9 |Dimension to Stern     |to_stern     |u|Meters
|258-263 |  6 |Dimension to Port      |to_port      |u|Meters
|264-269 |  6 |Dimension to Starboard |to_starboard |u|Meters
|270-273 |  4 |Position Fix Type      |epfd         |e|See "EPFD Fix Types"
|274-277 |  4 |ETA month (UTC)        |month        |u|1-12, 0=N/A (default)
|278-282 |  5 |ETA day (UTC)          |day          |u|1-31, 0=N/A (default)
|283-287 |  5 |ETA hour (UTC)         |hour         |u|0-23, 24=N/A (default)
|288-293 |  6 |ETA minute (UTC)       |minute       |u|0-59, 60=N/A (default)
|294-301 |  8 |Draught                |draught      |U1|Meters/10
|302-421 |120 |Destination            |destination  |t|20 6-bit characters
TODO:
|422-422 |  1 |DTE                    |dte          |b|0=Data terminal ready,
                                                       1=Not ready (default).
|423-423 |  1 |Spare                  |             |x|Not used
|==============================================================================
*/

var Ais05Msg = function (_AisMessage) {
  _inherits(Ais05Msg, _AisMessage);

  function Ais05Msg(aisType, bitField, channel) {
    _classCallCheck(this, Ais05Msg);

    var _this = _possibleConstructorReturn(this, (Ais05Msg.__proto__ || Object.getPrototypeOf(Ais05Msg)).call(this, aisType, bitField, channel));

    if (bitField.bits >= 423) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 05 msg:' + bitField.bits;
    }
    return _this;
  }

  _createClass(Ais05Msg, [{
    key: '_getDimToBow',
    value: function _getDimToBow() {
      return this._bitField.getInt(240, 9, true);
    }
  }, {
    key: '_getDimToStern',
    value: function _getDimToStern() {
      return this._bitField.getInt(249, 9, true);
    }
  }, {
    key: '_getDimToPort',
    value: function _getDimToPort() {
      return this._bitField.getInt(258, 6, true);
    }
  }, {
    key: '_getDimToStbrd',
    value: function _getDimToStbrd() {
      return this._bitField.getInt(264, 6, true);
    }
  }, {
    key: 'supportedValues',
    get: function get() {
      if (!suppValuesValid) {
        SUPPORTED_FIELDS.forEach(function (field) {
          var unit = _AisMessage3.default.getUnit(field);
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
    key: 'callSign',
    get: function get() {
      return this._formatStr(this._bitField.getString(70, 42));
    }
  }, {
    key: 'name',
    get: function get() {
      return this._formatStr(this._bitField.getString(112, 120));
    }
  }, {
    key: 'aisVer',
    get: function get() {
      return this._bitField.getInt(38, 2, true);
    }
  }, {
    key: 'imo',
    get: function get() {
      return this._bitField.getInt(40, 30, true);
    }
  }, {
    key: 'shipType',
    get: function get() {
      return this._bitField.getInt(232, 8, true);
    }
  }, {
    key: 'epfd',
    get: function get() {
      return this._bitField.getInt(270, 4, true);
    }
  }, {
    key: 'etaMonth',
    get: function get() {
      return this._bitField.getInt(274, 4, true) || NaN;
    }
  }, {
    key: 'etaDay',
    get: function get() {
      return this._bitField.getInt(278, 5, true) || NaN;
    }
  }, {
    key: 'etaHour',
    get: function get() {
      return this._bitField.getInt(283, 5, true) || NaN;
    }
  }, {
    key: 'etaMinute',
    get: function get() {
      return this._bitField.getInt(288, 6, true) || NaN;
    }
  }, {
    key: 'draught',
    get: function get() {
      return this._bitField.getInt(294, 8, true) / 10;
    }
  }, {
    key: 'destination',
    get: function get() {
      return this._formatStr(this._bitField.getString(302, 120));
    }
  }]);

  return Ais05Msg;
}(_AisMessage3.default);

exports.default = Ais05Msg;
