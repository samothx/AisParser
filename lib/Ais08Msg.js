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

var MOD_NAME = 'Ais8Msg';

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'dac', 'fid', 'data'];

var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len    |Description              |Member    |T|Units
|0-5     | 6     |Message Type             |type      |u|Constant: 14
|6-7     | 2     |Repeat Indicator         |repeat    |u|Message repeat count
|8-37    | 30    |MMSI                     |mmsi      |u|9 decimal digits
|38-39   | 2     |spare                    |          |u|not used
|40-49   | 10    |Designated area code     |dac       |u|
|50-55   | 6     |Function identifier      |fid       |u|
|56-...  | <=952 |Application specific data|data      |t|binary data
|==============================================================================
*/

var Ais8Msg = function (_AisMessage) {
    _inherits(Ais8Msg, _AisMessage);

    function Ais8Msg(aisType, bitField, channel) {
        _classCallCheck(this, Ais8Msg);

        var _this = _possibleConstructorReturn(this, (Ais8Msg.__proto__ || Object.getPrototypeOf(Ais8Msg)).call(this, aisType, bitField, channel));

        if (bitField.bits >= 56 && bitField.bits <= 1008) {
            _this._valid = 'VALID';
        } else {
            _this._valid = 'INVALID';
            _this._errMsg = 'invalid bitcount for type 8 msg:' + bitField.bits;
        }
        return _this;
    }

    _createClass(Ais8Msg, [{
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

        // |40-49   | 10    |Designated area code     |dac       |u|

    }, {
        key: 'dac',
        get: function get() {
            return this._bitField.getInt(40, 10, true);
        }

        // |50-55   | 6     |Function identifier      |fid       |u|

    }, {
        key: 'fid',
        get: function get() {
            return this._bitField.getInt(50, 6, true);
        }

        // |56-...  | <=952 |Name                   |text     |s|max of 952 binary data

    }, {
        key: 'data',
        get: function get() {
            var dataStart = 56;
            var maxDataBits = Math.min(this._bitField.bits - dataStart, 952);
            return this._bitField.getBytes(dataStart, maxDataBits);
        }
    }]);

    return Ais8Msg;
}(_AisMessage3.default);

exports.default = Ais8Msg;
