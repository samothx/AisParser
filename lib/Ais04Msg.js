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

var Ais04Msg = function (_AisMessage) {
  _inherits(Ais04Msg, _AisMessage);

  function Ais04Msg(aisType, bitField, channel) {
    _classCallCheck(this, Ais04Msg);

    // TODO: check bitcount
    var _this = _possibleConstructorReturn(this, (Ais04Msg.__proto__ || Object.getPrototypeOf(Ais04Msg)).call(this, aisType, bitField, channel));

    if (bitField.bits >= 167) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 04 msg:' + bitField.bits;
    }
    return _this;
  }

  _createClass(Ais04Msg, [{
    key: '_getRawLat',
    value: function _getRawLat() {
      return this._bitField.getInt(107, 27, false);
    }
  }, {
    key: '_getRawLon',
    value: function _getRawLon() {
      return this._bitField.getInt(79, 28, false);
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
    key: 'utcYear',
    get: function get() {
      return this._bitField.getInt(38, 14, true);
    }
  }, {
    key: 'utcMonth',
    get: function get() {
      return this._bitField.getInt(52, 4, true);
    }
  }, {
    key: 'utcDay',
    get: function get() {
      return this._bitField.getInt(56, 5, true);
    }
  }, {
    key: 'utcHour',
    get: function get() {
      return this._bitField.getInt(61, 5, true);
    }
  }, {
    key: 'utcMinute',
    get: function get() {
      return this._bitField.getInt(66, 6, true);
    }
  }, {
    key: 'utcSecond',
    get: function get() {
      return this._bitField.getInt(72, 6, true);
    }
  }, {
    key: 'posAccuracy',
    get: function get() {
      return this._bitField.getInt(78, 1, true) === 1;
    }
  }, {
    key: 'epfd',
    get: function get() {
      return this._bitField.getInt(134, 4, true);
    }
  }]);

  return Ais04Msg;
}(_AisMessage3.default);

exports.default = Ais04Msg;
