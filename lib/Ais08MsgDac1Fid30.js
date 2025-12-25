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
 * Copyright (C) 2025 Davide Gessa <gessadavide@gmail.com>.
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

var MOD_NAME = 'Ais8MsgDac1Fid30';

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'sequence', 'destinationMMSI', 'retransmitted', 'dac', 'fid', 'msgLinkageId', 'text'];

var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field   |Len    |Description              |Member    |T|Units
|0-5     | 6     |Message Type             |type      |u|Constant: 14
|6-7     | 2     |Repeat Indicator         |repeat    |u|Message repeat count
|8-37    | 30    |MMSI                     |mmsi      |u|9 decimal digits
|38-39   | 2     |Seq number               |seq       |u|0 - 3; refer to § 5.3.1, Annex 2 of ITU-R M.1371-3.
|40-69   | 30    |Destination              |dest      |u|9 decimal digits
|70      | 1     |Retransmitted flag       |retransm  |b|0=no retransm / default, 1=retansmitted
|71      | 1     |spare                    |          
|72-81   | 10    |Designated area code     |dac       |u|
|81-86   | 6     |Function identifier      |fid       |u|
|87-96   | 10    |Message linkage id       |          |u|
|97-...  | <=161 |Free text                |text      |t|6 bit ascii
|==============================================================================
*/

var Ais8MsgDac1Fid30 = function (_AisMessage) {
    _inherits(Ais8MsgDac1Fid30, _AisMessage);

    function Ais8MsgDac1Fid30(aisType, bitField, channel) {
        _classCallCheck(this, Ais8MsgDac1Fid30);

        var _this = _possibleConstructorReturn(this, (Ais8MsgDac1Fid30.__proto__ || Object.getPrototypeOf(Ais8MsgDac1Fid30)).call(this, aisType, bitField, channel));

        if (bitField.bits >= 104 && bitField.bits <= 1028) {
            _this._valid = 'VALID';
        } else {
            _this._valid = 'INVALID';
            _this._errMsg = 'invalid bitcount for type 8 msg dac 1 fid 30:' + bitField.bits;
        }
        return _this;
    }

    _createClass(Ais8MsgDac1Fid30, [{
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

        // |38-39   | 2     |Seq number               |seq       |u|

    }, {
        key: 'sequence',
        get: function get() {
            return this._bitField.getInt(38, 2, true);
        }

        // |40-69   | 30    |Destination              |dest      |u|

    }, {
        key: 'destinationMMSI',
        get: function get() {
            return this._bitField.getInt(40, 30, true);
        }

        // |70      | 1     |Retransmitted flag          |retransm  |b|

    }, {
        key: 'retransmitted',
        get: function get() {
            return this._bitField.getInt(70, 1, true) === 1;
        }

        // |71      | 1     |spare                    |

    }, {
        key: 'spare',
        get: function get() {
            return this._bitField.getInt(71, 1, true);
        }

        // |72-81   | 10    |Designated area code     |dac       |u|

    }, {
        key: 'dac',
        get: function get() {
            return this._bitField.getInt(72, 10, true);
        }

        // |82-87   | 6     |Function identifier      |fid       |u|

    }, {
        key: 'fid',
        get: function get() {
            return this._bitField.getInt(82, 6, true);
        }

        // |88-97   | 10    |Message linkage id       |          |u|

    }, {
        key: 'msgLinkageId',
        get: function get() {
            return this._bitField.getInt(88, 10, true);
        }

        // |98-...  | <=161 |Free text                |text      |t|6 bit ascii

    }, {
        key: 'text',
        get: function get() {
            var textStart = 98;
            var maxTextBits = Math.min(this._bitField.bits - textStart, 161);
            var textLength = maxTextBits - maxTextBits % 6;
            if (textLength <= 0) {
                return '';
            }
            var raw = this._bitField.getString(textStart, textLength);
            // strip leading @ padding and apply existing formatting helper
            return this._formatStr(raw.replace(/^@+/, ''));
        }
    }]);

    return Ais8MsgDac1Fid30;
}(_AisMessage3.default);

exports.default = Ais8MsgDac1Fid30;
