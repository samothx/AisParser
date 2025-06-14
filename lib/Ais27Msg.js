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

var MOD_NAME = 'Ais27Msg';

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'midCountry', 'midCountryIso', 'mmsiType', 'class', 'navStatus', 'navStatusStr', 'sogStatus', 'sog', 'cog', 'latitude', 'longitude', 'posAccuracy'];

var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len |Description             |Member    |T|Units
|0-5     | 6  |Message Type            |type      |u|Constant: 27
|6-7     | 2  |Repeat Indicator        |repeat    |u|Message repeat count
|8-37    |30  |MMSI                    |mmsi      |u|9 decimal digits
|38-38   | 1  |Position Accuracy       |accuracy  |u|
|39-39   | 1  |RAIM flag               |raim      |u|
|40-43   | 4  |Navigation Status       |status    |e|See "Navigation Status"
|44-61   |18  |Longitude               |lon       |I4|minutes/10 East positive, West negative 181000 = N/A
|62-78   |17  |Latitude                |lat       |I4|minutes/10 North positive, South negative 91000 = N/A
|79-84   |6   |Speed Over Ground (SOG) |speed     |u|Knots (0-62); 63 = N/A
|85-93   |9   |Course Over Ground (COG)|course    |u|0 to 359 degrees, 511 = not available.
|94-94   |1   |GNSS Position status    |gnss      |u|0 = current GNSS position 1 = not GNSS position (default)
|95-95   |1   |spare                   |          |u|not used
|==============================================================================

*/

var Ais27Msg = function (_AisMessage) {
    _inherits(Ais27Msg, _AisMessage);

    function Ais27Msg(aisType, bitField, channel) {
        _classCallCheck(this, Ais27Msg);

        var _this = _possibleConstructorReturn(this, (Ais27Msg.__proto__ || Object.getPrototypeOf(Ais27Msg)).call(this, aisType, bitField, channel));

        if (bitField.bits >= 94) {
            _this._valid = 'VALID';
        } else {
            _this._valid = 'INVALID';
            _this._errMsg = 'invalid bitcount for type CNB msg:' + bitField.bits;
        }
        return _this;
    }

    _createClass(Ais27Msg, [{
        key: '_getRawSog',
        value: function _getRawSog() {
            return this._bitField.getInt(79, 6, true) * 10;
        }
    }, {
        key: '_getRawCog',
        value: function _getRawCog() {
            return this._bitField.getInt(85, 9, true) * 10;
        }
    }, {
        key: '_getRawLat',
        value: function _getRawLat() {
            return this._bitField.getInt(62, 17, false) * 1000;
        }
    }, {
        key: '_getRawLon',
        value: function _getRawLon() {
            return this._bitField.getInt(44, 18, false) * 1000;
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
            return this._bitField.getInt(40, 4, true);
        }
    }, {
        key: 'posAccuracy',
        get: function get() {
            return this._bitField.getInt(38, 1, true);
        }
    }]);

    return Ais27Msg;
}(_AisMessage3.default);

exports.default = Ais27Msg;
