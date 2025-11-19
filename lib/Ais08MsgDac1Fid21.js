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

var MOD_NAME = 'Ais8MsgDac1Fid21';

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'dac', 'fid', 'reportType', 'location', 'longitude', 'latitude', 'utcDay', 'utcHour', 'utcMinute', 'presentWeather', 'horizontalVisibility', 'relativeHumidity', 'avgWindSpeed', 'avgWindDirection', 'airPressure', 'airPressureTendency', 'airTemperature', 'waterTemperature', 'sigWaveHeight', 'waveDirection', 'swellHeight', 'swellPeriod', 'swellDirection'];

var suppValuesValid = false;
var suppValues = {};

/*
|==============================================================================
|Field |Len |Description |Member |T|Units
|0-5 | 6 |Message Type |type |u|Constant: 14
|6-7 | 2 |Repeat Indicator |repeat |u|Message repeat count
|8-37 | 30 |MMSI |mmsi |u|9 decimal digits
|38-39 | 2 |spare | |u|not used
|40-49 | 10 |Designated area code |dac |u|
|50-55 | 6 |Function identifier |fid |u|
|56 | 1 |Type of report |rep_type |u| 1=WMO weather report 0=ship report
|57-176 | 120 |Geographic Location |location |t|6 bit ascii 20 char
|177-201 | 25 |Longitude |lon |I4| Long in 1/1000 min, +-180 deg as per 2's complement (e => +, w => -, 181 not available)
|202-225 | 24 |Latitude |lat |I4| Lat in 1/1000 min, +-90 deg as per 2's complement (n => +, s => -, 91 not available)
|226-230 | 5 |Day (UTC) |day |u|1-31; 0 = N/A (default)
|231-235 | 5 |Hour (UTC) |hour |u|0-23; 24 = N/A (default)
|236-241 | 6 |Minute (UTC) |minute |u|0-59; 60 = N/A (default)
|242-245 | 4 |Present weather |present_weather |u|WMO Code 45501, 8 = N/A (default)
|246-253 | 8 |Horizontal Visibility |horiz_visibility |u |0–126 (0.1 NM steps, up to 12.6 NM); 127=N/A
|254-260 | 7 |Relative Humidity |rel_humidity |u |0–100%, 101=N/A, 102–127 reserved
|261-267 | 7 |Avg 10-min wind speed |avg_wind_speed |u|0-125 knots; 127 = N/A (default)
|268-276 | 9 |Avg 10-min wind direction|avg_wind_dir |u|0-359 degree; 360 = N/A (default)
|277-285 | 9 |Air Pressure |air_pressure |u |0=799 hPa/less, 1–401=800–1200 hPa, 402=1201+/N/A=511
|286-289 | 4 |Air Pressure Tendency |air_press_tend |u |WMO FM13
|290-300 | 11 |Air Temperature |air_temp |I4|Dry bulb temp, 0.1°C steps, -60.0 to +60.0°C (-1024=N/A, 601–1023 reserved)
|301-310 | 10 |Water Temperature |water_temp |I4|-10.0 to +50.0°C, 0.1°C steps, 501=N/A
|311-316 | 6 |Wave Period |wave_period |u |0–60 s, 61=N/A
|317-324 | 8 |Significant Wave Height |sig_wave_height |u |0–251 (0.1 m), 251=N/A
|325-333 | 9 |Wave Direction |wave_dir |u |0–359°, 360=N/A
|334-341 | 8 |Swell Height |swell_height |u |0–251 (0.1 m), 251=N/A
|342-350 | 9 |Swell Direction |swell_dir |u |0–359°, 360=N/A
|351-356 | 6 |Swell Period |swell_period |u |0–60 s, 61=N/A
|357-359 | 3 |Spare | |u |Not used, set to zero
|==============================================================================
*/

var Ais8MsgDac1Fid31 = function (_AisMessage) {
    _inherits(Ais8MsgDac1Fid31, _AisMessage);

    function Ais8MsgDac1Fid31(aisType, bitField, channel) {
        _classCallCheck(this, Ais8MsgDac1Fid31);

        var _this = _possibleConstructorReturn(this, (Ais8MsgDac1Fid31.__proto__ || Object.getPrototypeOf(Ais8MsgDac1Fid31)).call(this, aisType, bitField, channel));

        if (bitField.bits == 360) {
            _this._valid = 'VALID';
        } else if (bitField.getInt(56, 1, true) != 0) {
            _this._valid = 'UNSUPPORTED';
            _this._errMsg = 'invalid report type; WMO weather report are not supported';
        } else {
            _this._valid = 'INVALID';
            _this._errMsg = 'invalid bitcount for type 8 msg dac 1 fid 31:' + bitField.bits;
        }
        return _this;
    }

    _createClass(Ais8MsgDac1Fid31, [{
        key: '_getRawLon',


        // |177-201 | 25    |Longitude                |lon       |I4| Long in 1/1000 min, 2's complement
        value: function _getRawLon() {
            return this._bitField.getInt(177, 25, false) * 10;
        }

        // |202-225 | 24    |Latitude                 |lat       |I4| Lat in 1/1000 min, 2's complement

    }, {
        key: '_getRawLat',
        value: function _getRawLat() {
            return this._bitField.getInt(202, 24, false) * 10;
        }

        // |226-230 | 5     |Day (UTC)                |day       |u|1-31; 0 = N/A

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

        // |56      | 1     |Type of report           |rep_type  |u| 1=WMO weather report 0=ship report

    }, {
        key: 'repType',
        get: function get() {
            return this._bitField.getInt(56, 1, true);
        }

        // |57-176  | 120   |Geographic Location      |location  |t|6 bit ascii 20 char

    }, {
        key: 'location',
        get: function get() {
            return this._bitField.getString(57, 120);
        }
    }, {
        key: 'day',
        get: function get() {
            var v = this._bitField.getInt(226, 5, true);
            return v === 0 ? NaN : v;
        }

        // |231-235 | 5     |Hour (UTC)               |hour      |u|0-23; 24 = N/A

    }, {
        key: 'hour',
        get: function get() {
            var v = this._bitField.getInt(231, 5, true);
            return v >= 24 ? NaN : v;
        }

        // |236-241 | 6     |Minute (UTC)             |minute    |u|0-59; 60 = N/A

    }, {
        key: 'minute',
        get: function get() {
            var v = this._bitField.getInt(236, 6, true);
            return v >= 60 ? NaN : v;
        }

        // |242-245 | 4     |Present weather          |present_weather   |u|WMO Code 45501, 8 = N/A

    }, {
        key: 'presentWeather',
        get: function get() {
            var v = this._bitField.getInt(242, 4, true);
            return v === 8 ? NaN : v;
        }

        // |246-253 | 8     |Horizontal Visibility    |horiz_visibility |u|0–126 (0.1 NM), 127=N/A

    }, {
        key: 'horizVisibility',
        get: function get() {
            var v = this._bitField.getInt(246, 8, true);
            return v >= 127 ? NaN : v / 10.0;
        }

        // |254-260 | 7     |Relative Humidity        |rel_humidity |u|0–100%, 101=N/A

    }, {
        key: 'relHumidity',
        get: function get() {
            var v = this._bitField.getInt(254, 7, true);
            return v >= 101 ? NaN : v;
        }

        // |261-267 | 7     |Avg 10-min wind speed    |avg_wind_speed |u|0-125 kt; 127=N/A

    }, {
        key: 'avgWindSpeed',
        get: function get() {
            var v = this._bitField.getInt(261, 7, true);
            return v >= 127 ? NaN : v;
        }

        // |268-276 | 9     |Avg 10-min wind direction|avg_wind_dir |u|0-359°, 360=N/A

    }, {
        key: 'avgWindDir',
        get: function get() {
            var v = this._bitField.getInt(268, 9, true);
            return v >= 360 ? NaN : v;
        }

        // |277-285 | 9     |Air Pressure             |air_pressure |u|
        // 0=799 or less, 1–401=800–1200, 402=1201+, 403–511=N/A

    }, {
        key: 'airPressure',
        get: function get() {
            var v = this._bitField.getInt(277, 9, true);
            if (v === 0) return 799;
            if (v === 402) return 1201;
            if (v >= 403) return NaN;
            return 800 + v;
        }

        // |286-289 | 4     |Air Pressure Tendency    |air_press_tend |u|WMO FM13

    }, {
        key: 'airPressTendRaw',
        get: function get() {
            var v = this._bitField.getInt(286, 4, true);
            return v > 8 ? NaN : v;
        }

        // |290-300 | 11    |Air Temperature          |air_temp |I4|0.1°C, -60.0..+60.0, -1024=N/A

    }, {
        key: 'airTemp',
        get: function get() {
            var v = this._bitField.getInt(290, 11, false);
            if (v === -1024) return NaN;
            return v / 10.0;
        }

        // |301-310 | 10    |Water Temperature        |water_temp |I4|-10.0..+50.0, 0.1°C, 501=N/A

    }, {
        key: 'waterTemp',
        get: function get() {
            var v = this._bitField.getInt(301, 10, false);
            if (v >= 501) return NaN;
            return v / 10.0;
        }

        // |311-316 | 6     |Wave Period              |wave_period |u|0–60 s, 61=N/A

    }, {
        key: 'wavePeriod',
        get: function get() {
            var v = this._bitField.getInt(311, 6, true);
            return v >= 61 ? NaN : v;
        }

        // |317-324 | 8     |Significant Wave Height  |sig_wave_height |u|0–251 (0.1 m), 251=N/A

    }, {
        key: 'sigWaveHeight',
        get: function get() {
            var v = this._bitField.getInt(317, 8, true);
            return v >= 251 ? NaN : v / 10.0;
        }

        // |325-333 | 9     |Wave Direction           |wave_dir |u|0–359°, 360=N/A

    }, {
        key: 'waveDir',
        get: function get() {
            var v = this._bitField.getInt(325, 9, true);
            return v >= 360 ? NaN : v;
        }

        // |334-341 | 8     |Swell Height             |swell_height |u|0–251 (0.1 m), 251=N/A

    }, {
        key: 'swellHeight',
        get: function get() {
            var v = this._bitField.getInt(334, 8, true);
            return v >= 251 ? NaN : v / 10.0;
        }

        // |342-350 | 9     |Swell Direction          |swell_dir |u|0–359°, 360=N/A

    }, {
        key: 'swellDir',
        get: function get() {
            var v = this._bitField.getInt(342, 9, true);
            return v >= 360 ? NaN : v;
        }

        // |351-356 | 6     |Swell Period             |swell_period |u|0–60 s, 61=N/A

    }, {
        key: 'swellPeriod',
        get: function get() {
            var v = this._bitField.getInt(351, 6, true);
            return v >= 61 ? NaN : v;
        }
    }]);

    return Ais8MsgDac1Fid31;
}(_AisMessage3.default);

exports.default = Ais8MsgDac1Fid31;
