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

var Ais09Msg = function (_AisMessage) {
  _inherits(Ais09Msg, _AisMessage);

  function Ais09Msg(aisType, bitField, channel) {
    _classCallCheck(this, Ais09Msg);

    var _this = _possibleConstructorReturn(this, (Ais09Msg.__proto__ || Object.getPrototypeOf(Ais09Msg)).call(this, aisType, bitField, channel));

    if (bitField.bits >= 168) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 9 msg:' + bitField.bits;
    }
    return _this;
  }

  _createClass(Ais09Msg, [{
    key: '_getRawAltitude',


    // Altitude: 12 bits at position 38
    // 0-4094 = altitude in meters
    // 4095 = not available
    value: function _getRawAltitude() {
      return this._bitField.getInt(38, 12, true);
    }
  }, {
    key: '_getRawSog',


    // SOG: 10 bits at position 50
    // 0-1022 = speed in knots (no decimal)
    // 1023 = not available
    value: function _getRawSog() {
      return this._bitField.getInt(50, 10, true);
    }
  }, {
    key: '_getRawLon',


    // Longitude: 28 bits at position 61
    value: function _getRawLon() {
      return this._bitField.getInt(61, 28, false);
    }

    // Latitude: 27 bits at position 89

  }, {
    key: '_getRawLat',
    value: function _getRawLat() {
      return this._bitField.getInt(89, 27, false);
    }

    // COG: 12 bits at position 116
    // 0-3599 = 0.0-359.9 degrees
    // 3600 = not available

  }, {
    key: '_getRawCog',
    value: function _getRawCog() {
      return this._bitField.getInt(116, 12, true);
    }

    // UTC Timestamp: 6 bits at position 128

  }, {
    key: '_getUtcSec',
    value: function _getUtcSec() {
      return this._bitField.getInt(128, 6, true);
    }

    // Altitude Sensor: 1 bit at position 134
    // 0 = GNSS, 1 = barometric

  }, {
    key: 'supportedValues',
    get: function get() {
      if (!suppValuesValid) {
        SUPPORTED_FIELDS.forEach(function (field) {
          var unit = _AisMessage3.default.getUnit(field);
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
    key: 'class',
    get: function get() {
      return 'SAR';
    }
  }, {
    key: 'altitudeStatus',
    get: function get() {
      var alt = this._getRawAltitude();
      if (alt === 4095) return 'NA';
      if (alt === 4094) return 'HIGH';
      return 'VALID';
    }
  }, {
    key: 'altitude',
    get: function get() {
      var alt = this._getRawAltitude();
      if (alt >= 4094) return NaN;
      return alt;
    }
  }, {
    key: 'sog',
    get: function get() {
      var sog = this._getRawSog();
      if (sog >= 1023) return NaN;
      return sog;
    }

    // Position Accuracy: 1 bit at position 60

  }, {
    key: 'posAccuracy',
    get: function get() {
      return this._bitField.getInt(60, 1, true) === 1;
    }
  }, {
    key: 'altitudeSensor',
    get: function get() {
      return this._bitField.getInt(134, 1, true);
    }

    // DTE: 1 bit at position 142
    // 0 = data terminal available, 1 = not available

  }, {
    key: 'dte',
    get: function get() {
      return this._bitField.getInt(142, 1, true) === 0;
    }

    // Assigned Mode Flag: 1 bit at position 146
    // 0 = autonomous/continuous mode, 1 = assigned mode

  }, {
    key: 'assignedMode',
    get: function get() {
      return this._bitField.getInt(146, 1, true) === 1;
    }

    // RAIM Flag: 1 bit at position 147

  }, {
    key: 'raim',
    get: function get() {
      return this._bitField.getInt(147, 1, true) === 1;
    }

    // Communication State Selector: 1 bit at position 148
    // 0 = SOTDMA, 1 = ITDMA

  }, {
    key: 'commStateSelector',
    get: function get() {
      return this._bitField.getInt(148, 1, true);
    }

    // Communication State: 19 bits at position 149

  }, {
    key: 'commState',
    get: function get() {
      return this._bitField.getInt(149, 19, true);
    }
  }]);

  return Ais09Msg;
}(_AisMessage3.default);

exports.default = Ais09Msg;
