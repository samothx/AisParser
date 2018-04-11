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

var AisCNBMsg = function (_AisMessage) {
  _inherits(AisCNBMsg, _AisMessage);

  function AisCNBMsg(aisType, bitField, channel) {
    _classCallCheck(this, AisCNBMsg);

    var _this = _possibleConstructorReturn(this, (AisCNBMsg.__proto__ || Object.getPrototypeOf(AisCNBMsg)).call(this, aisType, bitField, channel));

    if (bitField.bits >= 144) {
      _this._valid = 'VALID';
    } else {
      _this._valid = 'INVALID';
      _this._errMsg = 'invalid bitcount for type CNB msg:' + bitField.bits;
    }
    return _this;
  }

  _createClass(AisCNBMsg, [{
    key: '_getRawRot',
    value: function _getRawRot() {
      return this._bitField.getInt(42, 8, false);
    }
  }, {
    key: '_getRawHeading',
    value: function _getRawHeading() {
      return this._bitField.getInt(128, 9, true);
    }
  }, {
    key: '_getRawSog',
    value: function _getRawSog() {
      return this._bitField.getInt(50, 10, true);
    }
  }, {
    key: '_getRawCog',
    value: function _getRawCog() {
      return this._bitField.getInt(116, 12, true);
    }
  }, {
    key: '_getUtcSec',
    value: function _getUtcSec() {
      return this._bitField.getInt(137, 6, true);
    }
  }, {
    key: '_getRawLat',
    value: function _getRawLat() {
      return this._bitField.getInt(89, 27, false);
    }
  }, {
    key: '_getRawLon',
    value: function _getRawLon() {
      return this._bitField.getInt(61, 28, false);
    }
  }, {
    key: 'class',
    get: function get() {
      return 'A';
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
    key: 'navStatus',
    get: function get() {
      return this._bitField.getInt(38, 4, true);
    }
  }, {
    key: 'posAccuracy',
    get: function get() {
      return this._bitField.getInt(60, 1, true) === 1;
    }
  }]);

  return AisCNBMsg;
}(_AisMessage3.default);

exports.default = AisCNBMsg;
