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

var MOD_NAME = 'Ais14Msg';

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'text'];

var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len    |Description             |Member    |T|Units
|0-5     | 6     |Message Type            |type      |u|Constant: 14
|6-7     | 2     |Repeat Indicator        |repeat    |u|Message repeat count
|8-37    | 30    |MMSI                    |mmsi      |u|9 decimal digits
|38-39   | 2     |spare                   |          |u|not used
|40-...  | <=968 |Safety related text     |text      |t|6 bit ascii
|==============================================================================

*/

var Ais14Msg = function (_AisMessage) {
    _inherits(Ais14Msg, _AisMessage);

    function Ais14Msg(aisType, bitField, channel) {
        _classCallCheck(this, Ais14Msg);

        var _this = _possibleConstructorReturn(this, (Ais14Msg.__proto__ || Object.getPrototypeOf(Ais14Msg)).call(this, aisType, bitField, channel));

        if (bitField.bits >= 40 && bitField.bits <= 1008) {
            _this._valid = 'VALID';
        } else {
            _this._valid = 'INVALID';
            _this._errMsg = 'invalid bitcount for type 14 msg:' + bitField.bits;
        }
        return _this;
    }

    _createClass(Ais14Msg, [{
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

        // |40-...  | <=968 |Name                   |text     |s|max of 968 6-bit characters

    }, {
        key: 'text',
        get: function get() {
            var textStart = 40;
            var maxTextBits = Math.min(this._bitField.bits - textStart, 968);
            var textLength = maxTextBits - maxTextBits % 6;
            return this._formatStr(this._bitField.getString(textStart, textLength).replace(/^@+/, ''));
        }
    }]);

    return Ais14Msg;
}(_AisMessage3.default);

exports.default = Ais14Msg;
