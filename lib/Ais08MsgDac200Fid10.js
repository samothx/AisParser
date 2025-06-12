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

var MOD_NAME = 'Ais8MsgDac200Fid10';

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'dac', 'fid', 'vin', 'length', 'beam', 'shipTypeERI', 'hazard', 'draught', 'load', 'speedQuality', 'courseQuality', 'headingQuality'];

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
|56-103  | 48    |European Vessel ID       |vin       |t|8 six-bit characters
|104-116 | 13    |Length of ship           |length    |f|
|117-126 | 10    |Beam of ship             |beam      |f|
|127-140 | 14    |ERI classification       |shipTypeERI|u|
|141-143 | 3     |Hazardous cargo          |hazard    |u|
|144-154 | 11    |Draught                  |draught   |f|
|155-156 | 2     |Loaded/unloaded          |load      |u|
|157     | 1     |Quality of speed info    |speedQuality|b|
|158     | 1     |Quality of course info   |courseQuality|b|
|159     | 1     |Quality of heading info  |headingQuality|b|
|160-167 | 8     |spare                    |          |u|not used
|==============================================================================
*/

var Ais8MsgDac200Fid10 = function (_AisMessage) {
    _inherits(Ais8MsgDac200Fid10, _AisMessage);

    function Ais8MsgDac200Fid10(aisType, bitField, channel) {
        _classCallCheck(this, Ais8MsgDac200Fid10);

        var _this = _possibleConstructorReturn(this, (Ais8MsgDac200Fid10.__proto__ || Object.getPrototypeOf(Ais8MsgDac200Fid10)).call(this, aisType, bitField, channel));

        if (bitField.bits == 168) {
            _this._valid = 'VALID';
        } else {
            _this._valid = 'INVALID';
            _this._errMsg = 'invalid bitcount for type 8 msg dac 200 fid 10:' + bitField.bits;
        }
        return _this;
    }

    _createClass(Ais8MsgDac200Fid10, [{
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

        // |56-103  | 48    |European Vessel ID       |vin       |t|8 six-bit characters

    }, {
        key: 'vin',
        get: function get() {
            return this._formatStr(this._bitField.getString(56, 48));
        }

        // |104-116 | 13    |Length of ship           |length    |f|

    }, {
        key: 'length',
        get: function get() {
            return this._bitField.getInt(104, 13, true) / 10.;
        }

        // |117-126 | 10    |Beam of ship             |beam      |f|

    }, {
        key: 'beam',
        get: function get() {
            return this._bitField.getInt(117, 10, true) / 10.;
        }

        // |127-140 | 14    |ERI classification       |shipTypeERI|u|

    }, {
        key: 'shipTypeERI',
        get: function get() {
            return this._bitField.getInt(127, 14, true);
        }

        // |141-143 | 3     |Hazardous cargo          |hazard    |u|

    }, {
        key: 'hazard',
        get: function get() {
            return this._bitField.getInt(141, 3, true);
        }

        // |144-154 | 11    |Draught                  |draught   |f|

    }, {
        key: 'draught',
        get: function get() {
            return this._bitField.getInt(144, 11, true) / 100.;
        }

        // |155-156 | 2     |Loaded/unloaded          |load      |u|

    }, {
        key: 'load',
        get: function get() {
            return this._bitField.getInt(155, 2, true);
        }

        // |157     | 1     |Quality of speed info    |speedQuality|b|

    }, {
        key: 'speedQuality',
        get: function get() {
            return this._bitField.getInt(157, 1, true) == 1;
        }

        // |158     | 1     |Quality of course info   |courseQuality|b|

    }, {
        key: 'courseQuality',
        get: function get() {
            return this._bitField.getInt(158, 1, true) == 1;
        }

        // |159     | 1     |Quality of heading info  |headingQuality|b|

    }, {
        key: 'headingQuality',
        get: function get() {
            return this._bitField.getInt(159, 1, true) == 1;
        }
    }]);

    return Ais8MsgDac200Fid10;
}(_AisMessage3.default);

exports.default = Ais8MsgDac200Fid10;
