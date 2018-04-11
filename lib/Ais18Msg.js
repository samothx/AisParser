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

var MOD_NAME = 'Ais18Msg';

/*
|==============================================================================
|Field   |Len |Description        |Member   |T|Units
|0-5     | 6  |Message Type       |type     |u|Constant: 18
|6-7     | 2  |Repeat Indicator   |repeat   |u|As in Common Navigation Block
|8-37    |30  |MMSI               |mmsi     |u|9 decimal digits
|38-45   | 8  |Regional Reserved  |reserved |x|Not used
|46-55   |10  |Speed Over Ground  |speed    |u|As in common navigation block
|56-56   | 1  |Position Accuracy  |accuracy |b|See below
|57-84   |28  |Longitude          |lon      |I4|Minutes/10000 (as in CNB)
|85-111  |27  |Latitude           |lat      |I4|Minutes/10000 (as in CNB)
|112-123 |12  |Course Over Ground |course   |U1|0.1 degrees from true north
|124-132 | 9  |True Heading       |heading  |u|0 to 359 degrees, 511 = N/A
|133-138 | 6  |Time Stamp         |second   |u|Second of UTC timestamp.
TODO:
|139-140 | 2  |Regional reserved  |regional |u|Uninterpreted
|141-141 | 1  |CS Unit            |cs       |b|0=Class B SOTDMA unit
                                               1=Class B CS (Carrier Sense) unit
|142-142 | 1  |Display flag       |display  |b|0=No visual display,
                                               1=Has display,
                                               (Probably not reliable).
|143-143 | 1  |DSC Flag           |dsc      |b|If 1, unit is attached to a VHF
                                               voice radio with DSC capability.
|144-144 | 1  |Band flag          |band     |b|Base stations can command units
                                               to switch frequency. If this flag
                                               is 1, the unit can use any part
                                               of the marine channel.
|145-145 | 1  |Message 22 flag    |msg22    |b|If 1, unit can accept a channel
                                               assignment via Message Type 22.
|146-146 | 1  |Assigned           |assigned |b|Assigned-mode flag:
                                               0 = autonomous mode (default),
                                               1 = assigned mode.
|147-147 | 1  |RAIM flag          |raim     |b|As for common navigation block
|148-167 |20  |Radio status       |radio    |u|See <<IALA>> for details.
|==============================================================================
*/

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'heading', 'sogStatus', 'sog', 'cog', 'latitude', 'longitude', 'posAccuracy', 'utcTsSec', 'utcTsStatus'];
var suppValuesValid = false;
var suppValues = {};

var Ais18Msg = function (_AisMessage) {
  _inherits(Ais18Msg, _AisMessage);

  function Ais18Msg(aisType, bitField, channel) {
    _classCallCheck(this, Ais18Msg);

    var _this = _possibleConstructorReturn(this, (Ais18Msg.__proto__ || Object.getPrototypeOf(Ais18Msg)).call(this, aisType, bitField, channel));

    if (bitField.bits >= 167) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type 18 msg:' + bitField.bits;
    }
    return _this;
  }

  _createClass(Ais18Msg, [{
    key: '_getRawHeading',
    value: function _getRawHeading() {
      return this._bitField.getInt(124, 9, true);
    }
  }, {
    key: '_getRawSog',
    value: function _getRawSog() {
      return this._bitField.getInt(46, 10, true);
    }
  }, {
    key: '_getRawCog',
    value: function _getRawCog() {
      return this._bitField.getInt(112, 12, true);
    }
  }, {
    key: '_getUtcSec',
    value: function _getUtcSec() {
      return this._bitField.getInt(133, 6, true);
    }
  }, {
    key: '_getRawLat',
    value: function _getRawLat() {
      return this._bitField.getInt(85, 27, false);
    }
  }, {
    key: '_getRawLon',
    value: function _getRawLon() {
      return this._bitField.getInt(57, 28, false);
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
    key: 'class',
    get: function get() {
      return 'B';
    }
  }, {
    key: 'posAccuracy',
    get: function get() {
      return this._bitField.getInt(56, 1, true) === 1;
    }
  }]);

  return Ais18Msg;
}(_AisMessage3.default);

exports.default = Ais18Msg;
