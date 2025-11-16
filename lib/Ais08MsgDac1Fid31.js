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

var MOD_NAME = 'Ais8MsgDac1Fid31';

var SUPPORTED_FIELDS = ['aisType', 'channel', 'repeatInd', 'mmsi', 'dac', 'fid', 'longitude', 'latitude', 'posAccuracy', 'utcDay', 'utcHour', 'utcMinute', 'avgWindSpeed', 'avgGustSpeed', 'avgWindDirection', 'avgGustDirection', 'airTemperature', 'relativeHumidity', 'dewPoint', 'airPressure', 'airPressureTendency', 'horizontalVisibility', 'waterLevel', 'waterLevelTrend', 'curr1Speed', 'curr1Direction', 'curr2Speed', 'curr2Direction', 'curr2Level', 'curr3Speed', 'curr3Direction', 'curr3Level', 'sigWaveHeight', 'wavePeriod', 'waveDirection', 'swellHeight', 'swellPeriod', 'swellDirection', 'seaState', 'waterTemperature', 'precipitationType', 'salinity', 'ice'];

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
|56-80   | 25    |Longitude                |lon       |I4| Long in 1/1000 min, +-180 deg as per 2's complement (e => +, w => -, 181 not available)
|81-104  | 24    |Latitude                 |lat       |I4| Lat in 1/1000 min, +-90 deg as per 2's complement (n => +, s => -, 91 not available)
|105     | 1     |Position Accuracy        |accuracy  |u| 
|106-110 | 5     |Day (UTC)                |day       |u|1-31; 0 = N/A (default)
|111-115 | 5     |Hour (UTC)               |hour      |u|0-23; 24 = N/A (default)
|116-121 | 6     |Minute (UTC)             |minute    |u|0-59; 60 = N/A (default)
|122-128 | 7     |Avg 10-min wind speed|avg_wind_speed |u|0-125 knots; 127 = N/A (default)
|129-135 | 7     |Avg 10-min gust speed|avg_gust_speed |u|0-125 knots; 127 = N/A (default)
|136-144 | 9     |Avg 10-min wind direction|avg_wind_dir |u|0-359 degree; 360 = N/A (default)
|145-153 | 9     |Avg 10-min gust direction|avg_gust_dir |u|0-359 degree; 360 = N/A (default)
|154-164 | 11    |Air Temperature |air_temp |I4|Dry bulb temp, 0.1°C steps, -60.0 to +60.0°C (-1024=N/A, 601–1023 reserved)
|165-171 | 7     |Relative Humidity |rel_humidity |u |0–100%, 101=N/A, 102–127 reserved
|172-181 | 10    |Dew Point |dew_point |I4|-20.0 to +50.0°C, 0.1°C steps, -511–501 reserved, 501=N/A
|182-190 | 9     |Air Pressure |air_pressure |u |0=799 hPa/less, 1–401=800–1200 hPa, 402=1201+/N/A=511
|191-192 | 2     |Air Pressure Tendency |air_press_tend |u |0=steady, 1=decr, 2=incr, 3=N/A
|193-200 | 8     |Horizontal Visibility |horiz_visibility |u |0–126 (0.1 NM steps, up to 12.6 NM); 127=N/A
|201-212 | 12    |Water Level (incl. tide) |water_level |u |0–4000 (add -10.0); 4001=N/A; 4002–4095 reserved
|213-214 | 2     |Water Level Trend |wl_trend |u |0=steady, 1=decr, 2=incr, 3=N/A
|215-222 | 8     |Surface Current Speed |curr1_speed |u |0–251 (0.1kt steps, 25.1->/N/A)
|223-231 | 9     |Surface Current Direction |curr1_dir |u |0–359°, 360=N/A
|232-239 | 8     |Current Speed #2 |curr2_speed |u |Same as above
|240-248 | 9     |Current Direction #2 |curr2_dir |u |Same as curr1_dir
|249-253 | 5     |Current Measuring Lv. #2 |curr2_level |u |0–30 m, 31=N/A
|254-261 | 8     |Current Speed #3 |curr3_speed |u |Same as above
|262-270 | 9     |Current Direction #3 |curr3_dir |u |Same as curr1_dir
|271-275 | 5     |Current Measuring Lv. #3 |curr3_level |u |0–30 m, 31=N/A
|276-283 | 8     |Significant Wave Height |sig_wave_height |u |0–251 (0.1 m), 251=N/A
|284-289 | 6     |Wave Period |wave_period |u |0–60 s, 61=N/A
|290-298 | 9     |Wave Direction |wave_dir |u |0–359°, 360=N/A
|299-306 | 8     |Swell Height |swell_height |u |0–251 (0.1 m), 251=N/A
|307-312 | 6     |Swell Period |swell_period |u |0–60 s, 61=N/A
|313-321 | 9     |Swell Direction |swell_dir |u |0–359°, 360=N/A
|322-325 | 4     |Sea State |sea_state |u |Beaufort Code
|326-335 | 10    |Water Temperature |water_temp |I4|-10.0 to +50.0°C, 0.1°C steps, 501=N/A
|336-338 | 3     |Precipitation Type |precip_type |u |0=reserved, 1=rain, 2=thunderstorm, 3=freezing, 4=mixed/ice, 5=snow
|339-347 | 9     |Salinity |salinity |u |0–500 (0.1 ppt, 50+ reserved/N/A)
|348-349 | 2     |Ice |ice |u |0=no, 1=yes
|350-359 | 10    |Spare | |u |Not used, set to zero
|==============================================================================
*/

var Ais8MsgDac1Fid31 = function (_AisMessage) {
    _inherits(Ais8MsgDac1Fid31, _AisMessage);

    function Ais8MsgDac1Fid31(aisType, bitField, channel) {
        _classCallCheck(this, Ais8MsgDac1Fid31);

        var _this = _possibleConstructorReturn(this, (Ais8MsgDac1Fid31.__proto__ || Object.getPrototypeOf(Ais8MsgDac1Fid31)).call(this, aisType, bitField, channel));

        if (bitField.bits == 360) {
            _this._valid = 'VALID';
        } else {
            _this._valid = 'INVALID';
            _this._errMsg = 'invalid bitcount for type 8 msg dac 1 fid 31:' + bitField.bits;
        }
        return _this;
    }

    _createClass(Ais8MsgDac1Fid31, [{
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

        // |56-80   | 25    |Longitude                |longitude |I4| Longitude in 1/1000 min, ±180 deg by 2's complement; 181 = not available

    }, {
        key: 'longitude',
        get: function get() {
            return this._bitField.getSignedInt(56, 25, true);
        }

        // |81-104  | 24    |Latitude                 |latitude |I4| Latitude in 1/1000 min, ±90 deg by 2's complement; 91 = not available

    }, {
        key: 'latitude',
        get: function get() {
            return this._bitField.getSignedInt(81, 24, true);
        }

        // |105     | 1     |Position Accuracy        |posAccuracy |u| 1 = < 10m, 0 = > 10m

    }, {
        key: 'posAccuracy',
        get: function get() {
            return this._bitField.getInt(105, 1, true);
        }

        // |106-110 | 5     |Day (UTC)                |utcDay |u| 1-31; 0 = not available

    }, {
        key: 'utcDay',
        get: function get() {
            return this._bitField.getInt(106, 5, true);
        }

        // |111-115 | 5     |Hour (UTC)               |utcHour |u| 0-23; 24 = not available

    }, {
        key: 'utcHour',
        get: function get() {
            return this._bitField.getInt(111, 5, true);
        }

        // |116-121 | 6     |Minute (UTC)             |utcMinute |u| 0-59; 60 = not available

    }, {
        key: 'utcMinute',
        get: function get() {
            return this._bitField.getInt(116, 6, true);
        }

        // |122-128 | 7     |Average Wind Speed       |avgWindSpeed |u| 0-125 knots; 127 = not available

    }, {
        key: 'avgWindSpeed',
        get: function get() {
            return this._bitField.getInt(122, 7, true);
        }

        // |129-135 | 7     |Wind Gust                |avgGustSpeed |u| 0-125 knots; 127 = not available

    }, {
        key: 'avgGustSpeed',
        get: function get() {
            return this._bitField.getInt(129, 7, true);
        }

        // |136-144 | 9     |Wind Direction           |avgWindDirection |u| 0-359 deg; 360 = not available

    }, {
        key: 'avgWindDirection',
        get: function get() {
            return this._bitField.getInt(136, 9, true);
        }

        // |145-153 | 9     |Wind Gust Direction      |avgGustDirection |u| 0-359 deg; 360 = not available

    }, {
        key: 'avgGustDirection',
        get: function get() {
            return this._bitField.getInt(145, 9, true);
        }

        // |154-164 | 11    |Air Temperature          |airTemperature |I4| In 0.1 °C steps, -60.0 to +60.0°C; -1024 = not available

    }, {
        key: 'airTemperature',
        get: function get() {
            return this._bitField.getSignedInt(154, 11, true);
        }

        // |165-171 | 7     |Relative Humidity        |relativeHumidity |u| 0-100%; 101 = not available

    }, {
        key: 'relativeHumidity',
        get: function get() {
            return this._bitField.getInt(165, 7, true);
        }

        // |172-181 | 10    |Dew Point                |dewPoint |I4| -20.0 to +50.0 °C; 501 = not available

    }, {
        key: 'dewPoint',
        get: function get() {
            return this._bitField.getSignedInt(172, 10, true);
        }

        // |182-190 | 9     |Air Pressure             |airPressure |u| 800-1200 hPa; 511 = not available

    }, {
        key: 'airPressure',
        get: function get() {
            return this._bitField.getInt(182, 9, true);
        }

        // |191-192 | 2     |Air Pressure Tendency    |airPressureTendency |u| 0=steady, 1=decreasing, 2=increasing, 3=not available

    }, {
        key: 'airPressureTendency',
        get: function get() {
            return this._bitField.getInt(191, 2, true);
        }

        // |193-200 | 8     |Horizontal Visibility    |horizontalVisibility |u| 0-126 (0.1NM); 127 = not available

    }, {
        key: 'horizontalVisibility',
        get: function get() {
            return this._bitField.getInt(193, 8, true);
        }

        // |201-212 | 12    |Water Level (incl. tide) |waterLevel |u| 0-4000 (add -10.0); 4001 = not available

    }, {
        key: 'waterLevel',
        get: function get() {
            return this._bitField.getInt(201, 12, true);
        }

        // |213-214 | 2     |Water Level Trend        |waterLevelTrend |u| 0=steady, 1=decreasing, 2=increasing, 3=not available

    }, {
        key: 'waterLevelTrend',
        get: function get() {
            return this._bitField.getInt(213, 2, true);
        }

        // |215-222 | 8     |Surface Current Speed    |curr1Speed |u| 0-251 (0.1kt); 251+ = not available

    }, {
        key: 'curr1Speed',
        get: function get() {
            return this._bitField.getInt(215, 8, true);
        }

        // |223-231 | 9     |Surface Current Direction|curr1Direction |u| 0-359 deg; 360 = not available

    }, {
        key: 'curr1Direction',
        get: function get() {
            return this._bitField.getInt(223, 9, true);
        }

        // |232-239 | 8     |Current Speed #2         |curr2Speed |u| Same encoding as curr1Speed

    }, {
        key: 'curr2Speed',
        get: function get() {
            return this._bitField.getInt(232, 8, true);
        }

        // |240-248 | 9     |Current Direction #2     |curr2Direction |u| Same encoding as curr1Direction

    }, {
        key: 'curr2Direction',
        get: function get() {
            return this._bitField.getInt(240, 9, true);
        }

        // |249-253 | 5     |Current Measuring Lv #2  |curr2Level |u| 0-30 m, 31 = not available

    }, {
        key: 'curr2Level',
        get: function get() {
            return this._bitField.getInt(249, 5, true);
        }

        // |254-261 | 8     |Current Speed #3         |curr3Speed |u| Same encoding as curr1Speed

    }, {
        key: 'curr3Speed',
        get: function get() {
            return this._bitField.getInt(254, 8, true);
        }

        // |262-270 | 9     |Current Direction #3     |curr3Direction |u| Same encoding as curr1Direction

    }, {
        key: 'curr3Direction',
        get: function get() {
            return this._bitField.getInt(262, 9, true);
        }

        // |271-275 | 5     |Current Measuring Lv #3  |curr3Level |u| 0-30 m, 31 = not available

    }, {
        key: 'curr3Level',
        get: function get() {
            return this._bitField.getInt(271, 5, true);
        }

        // |276-283 | 8     |Significant Wave Height  |sigWaveHeight |u| 0-251 (0.1m); 251+ = not available

    }, {
        key: 'sigWaveHeight',
        get: function get() {
            return this._bitField.getInt(276, 8, true);
        }

        // |284-289 | 6     |Wave Period              |wavePeriod |u| 0-60 s; 61+ = not available

    }, {
        key: 'wavePeriod',
        get: function get() {
            return this._bitField.getInt(284, 6, true);
        }

        // |290-298 | 9     |Wave Direction           |waveDirection |u| 0-359 deg; 360+ = not available

    }, {
        key: 'waveDirection',
        get: function get() {
            return this._bitField.getInt(290, 9, true);
        }

        // |299-306 | 8     |Swell Height             |swellHeight |u| 0-251 (0.1m); 251+ = not available

    }, {
        key: 'swellHeight',
        get: function get() {
            return this._bitField.getInt(299, 8, true);
        }

        // |307-312 | 6     |Swell Period             |swellPeriod |u| 0-60 s; 61+ = not available

    }, {
        key: 'swellPeriod',
        get: function get() {
            return this._bitField.getInt(307, 6, true);
        }

        // |313-321 | 9     |Swell Direction          |swellDirection |u| 0-359 deg; 360+ = not available

    }, {
        key: 'swellDirection',
        get: function get() {
            return this._bitField.getInt(313, 9, true);
        }

        // |322-325 | 4     |Sea State                |seaState |u| Beaufort code

    }, {
        key: 'seaState',
        get: function get() {
            return this._bitField.getInt(322, 4, true);
        }

        // |326-335 | 10    |Water Temperature        |waterTemperature |I4| -10.0 to +50.0°C (0.1°C); 501 = not available

    }, {
        key: 'waterTemperature',
        get: function get() {
            return this._bitField.getSignedInt(326, 10, true);
        }

        // |336-338 | 3     |Precipitation Type       |precipitationType |u| 0=reserved, 1=rain, …, 5=snow

    }, {
        key: 'precipitationType',
        get: function get() {
            return this._bitField.getInt(336, 3, true);
        }

        // |339-347 | 9     |Salinity                 |salinity |u| 0-500 (0.1 ppt), 510 = not available

    }, {
        key: 'salinity',
        get: function get() {
            return this._bitField.getInt(339, 9, true);
        }

        // |348-349 | 2     |Ice                      |ice |u| 0=no, 1=yes, 2=reserved, 3=not available

    }, {
        key: 'ice',
        get: function get() {
            return this._bitField.getInt(348, 2, true);
        }
    }]);

    return Ais8MsgDac1Fid31;
}(_AisMessage3.default);

exports.default = Ais8MsgDac1Fid31;
