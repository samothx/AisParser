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

var Ais19Msg = function (_AisMessage) {
  _inherits(Ais19Msg, _AisMessage);

  function Ais19Msg(aisType, bitField, channel) {
    _classCallCheck(this, Ais19Msg);

    var _this = _possibleConstructorReturn(this, (Ais19Msg.__proto__ || Object.getPrototypeOf(Ais19Msg)).call(this, aisType, bitField, channel));

    if (bitField.bits >= 311) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 19 msg:' + bitField.bits;
    }
    return _this;
  }

  _createClass(Ais19Msg, [{
    key: '_getRawHeading',


    // |124-132  |  9 |True Heading           |heading      |u|0 to 359 degrees,
    value: function _getRawHeading() {
      return this._bitField.getInt(124, 9, true);
    }

    //|46-55    | 10 |Speed Over Ground      |speed        |u|As in CNB.

  }, {
    key: '_getRawSog',
    value: function _getRawSog() {
      return this._bitField.getInt(46, 10, true);
    }

    // |112-123  | 12 |Course Over Ground     |course       |U1|Relative to true north,

  }, {
    key: '_getRawCog',
    value: function _getRawCog() {
      return this._bitField.getInt(112, 12, true);
    }

    // |56-56    |  1 |Position Accuracy      |accuracy     |b|As in CNB.

  }, {
    key: '_getUtcSec',


    // |133-138  |  6 |Time Stamp             |second       |u|Second of UTC timestamp.
    value: function _getUtcSec() {
      return this._bitField.getInt(133, 6, true);
    }

    // |85-111   | 27 |Latitude               |lat          |I4|Minutes/10000 (as in CNB)

  }, {
    key: '_getRawLat',
    value: function _getRawLat() {
      return this._bitField.getInt(85, 27, false);
    }

    // |57-84    | 28 |Longitude              |lon          |I4|Minutes/10000 (as in CNB)

  }, {
    key: '_getRawLon',
    value: function _getRawLon() {
      return this._bitField.getInt(57, 28, false);
    }

    // |143-262  |120 |Name                   |shipname     |s|20 6-bit characters

  }, {
    key: '_getDimToBow',


    // |271-279  |  9 |Dimension to Bow       |to_bow       |u|Meters
    value: function _getDimToBow() {
      return this._bitField.getInt(271, 9, true);
    }

    // |280-288  |  9 |Dimension to Stern     |to_stern     |u|Meters

  }, {
    key: '_getDimToStern',
    value: function _getDimToStern() {
      return this._bitField.getInt(280, 9, true);
    }

    // |289-294  |  6 |Dimension to Port      |to_port      |u|Meters

  }, {
    key: '_getDimToPort',
    value: function _getDimToPort() {
      return this._bitField.getInt(289, 6, true);
    }

    // |295-300  |  6 |Dimension to Starboard |to_starboard |u|Meters

  }, {
    key: '_getDimToStbrd',
    value: function _getDimToStbrd() {
      return this._bitField.getInt(295, 6, true);
    }

    // |301-304  |  4 |Position Fix Type      |epfd         |e|See "EPFD Fix Types"

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
    key: 'class',
    get: function get() {
      return 'B';
    }
  }, {
    key: 'posAccuracy',
    get: function get() {
      return this._bitField.getInt(56, 1, true) === 1;
    }
  }, {
    key: 'name',
    get: function get() {
      return this._formatStr(this._bitField.getString(143, 120));
    }

    // |263-270  |  8 |Type of ship and cargo |shiptype     |u|As in Message 5

  }, {
    key: 'shipType',
    get: function get() {
      return this._bitField.getInt(263, 8, true);
    }
  }, {
    key: 'epfd',
    get: function get() {
      return this._bitField.getInt(301, 4, true);
    }
  }]);

  return Ais19Msg;
}(_AisMessage3.default);

exports.default = Ais19Msg;
