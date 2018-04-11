'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var _AisBitField = require('./AisBitField');

var _AisBitField2 = _interopRequireDefault(_AisBitField);

var _AisMessage = require('./AisMessage');

var _AisMessage2 = _interopRequireDefault(_AisMessage);

var _AisCNBMsg = require('./AisCNBMsg');

var _AisCNBMsg2 = _interopRequireDefault(_AisCNBMsg);

var _Ais04Msg = require('./Ais04Msg');

var _Ais04Msg2 = _interopRequireDefault(_Ais04Msg);

var _Ais05Msg = require('./Ais05Msg');

var _Ais05Msg2 = _interopRequireDefault(_Ais05Msg);

var _Ais18Msg = require('./Ais18Msg');

var _Ais18Msg2 = _interopRequireDefault(_Ais18Msg);

var _Ais19Msg = require('./Ais19Msg');

var _Ais19Msg2 = _interopRequireDefault(_Ais19Msg);

var _Ais21Msg = require('./Ais21Msg');

var _Ais21Msg2 = _interopRequireDefault(_Ais21Msg);

var _Ais24Msg = require('./Ais24Msg');

var _Ais24Msg2 = _interopRequireDefault(_Ais24Msg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO:  Parser currently rejects multipart messages, if the padbit is != 0 in
//        any but the last part. In an AisHub scan 2 messages where encountered
//        that where built like that but they were invalid in other ways too,
//        so I am hoping to get away like this.

var MOD_NAME = 'AisParser';
var DEBUG = false;

var AisParser = function () {
  function AisParser() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AisParser);

    this._options = options;
    this._context = {};
  }

  _createClass(AisParser, [{
    key: 'parse',
    value: function parse(sentence) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var checksum = typeof options.checksum !== 'undefined' ? options.checksum : this._options.checksum;
      if (checksum && !AisParser.checksumValid(sentence)) {
        return _AisMessage2.default.fromError('INVALID', 'Invalid checksum in message: [' + sentence + ']');
      }
      return this.parseArray(sentence.split(','));
    }

    // !AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74

  }, {
    key: 'parseArray',
    value: function parseArray(part) {
      var parts = part.length;

      if (parts !== 7) {
        return _AisMessage2.default.fromError('INVALID', 'Invalid count (!=7) of comma separated elements in message: [' + String(part) + ']');
      } else {
        if (part[0] !== '!AIVDM' && part[0] !== '!AIVDO') {
          return _AisMessage2.default.fromError('UNSUPPORTED', 'not a supported AIS message:[' + String(part) + ']');
        }
      }

      var msgCount = Number(part[1]);
      var msgIdx = Number(part[2]);
      var msgId = part[3];
      var padBit = Number(part[6].substr(0, 1));
      var aisStr = part[5];

      if (msgCount > 1) {
        if (msgIdx === msgCount) {
          var msgParts = this._context[msgId];
          if (!msgParts) {
            return _AisMessage2.default.fromError('INVALID', 'missing prior message(s) in partial message:[' + String(part) + ']');
          }
          if (msgIdx !== msgParts.idx + 1) {
            delete this._context[msgId];
            return _AisMessage2.default.fromError('INVALID', 'sequence violation (skipped or missing message) in partial message:[' + String(part) + ']');
          }
          aisStr = msgParts.aisStr + aisStr;
          delete this._context[msgId];
        } else {
          if (padBit !== 0) {
            return _AisMessage2.default.fromError('UNSUPPORTED', 'padbit!=0 not supported in partial message:[' + String(part) + ']');
          }
          var _msgParts = this._context[msgId];
          if (msgIdx === 1) {
            if (typeof _msgParts !== 'undefined') {
              delete this._context[msgId];
              return _AisMessage2.default.fromError('INVALID', 'a message with this sequence and index already exists in partial message:[' + String(part) + ']');
            }
            this._context[msgId] = { idx: msgIdx, aisStr: aisStr };
            return _AisMessage2.default.fromError('INCOMPLETE', '');
          } else {
            if (!_msgParts) {
              return _AisMessage2.default.fromError('INVALID', 'missing prior message in partial message:[' + String(part) + ']');
            }
            if (msgIdx !== _msgParts.idx + 1) {
              delete this._context[msgId];
              return _AisMessage2.default.fromError('INVALID', 'sequence violation (skipped or missing message) in partial message:[' + String(part) + ']');
            }
            _msgParts.idx = msgIdx;
            _msgParts.aisStr += aisStr;
            return _AisMessage2.default.fromError('INCOMPLETE', '');
          }
        }
      } else {
        if (msgIdx !== 1) {
          return _AisMessage2.default.fromError('INVALID', 'invalid message index !=1 in non partial message:[' + String(part) + ']');
        }
      }

      try {
        var bitField = new _AisBitField2.default(aisStr, padBit);
        var aisType = bitField.getInt(0, 6, true);
        switch (aisType) {
          case 1:
          case 2:
          case 3:
            return new _AisCNBMsg2.default(aisType, bitField, part[4]);
          case 4:
            return new _Ais04Msg2.default(aisType, bitField, part[4]);
          case 5:
            return new _Ais05Msg2.default(aisType, bitField, part[4]);
          case 18:
            return new _Ais18Msg2.default(aisType, bitField, part[4]);
          case 19:
            return new _Ais19Msg2.default(aisType, bitField, part[4]);
          case 21:
            return new _Ais21Msg2.default(aisType, bitField, part[4]);
          case 24:
            return new _Ais24Msg2.default(aisType, bitField, part[4]);
          default:
            return _AisMessage2.default.fromError('UNSUPPORTED', 'Unsupported ais type ' + aisType + ' in message [' + String(part) + ']', aisType, part[4]);
        }
      } catch (error) {
        return _AisMessage2.default.fromError('INVALID', 'Failed to parse message, error:' + error);
      }
    }
  }], [{
    key: 'checksumValid',
    value: function checksumValid(sentence) {
      if (!(sentence.startsWith('!AIVDO') || sentence.startsWith('!AIVDM'))) {
        return false;
      }

      var idx = sentence.indexOf('*');
      if (idx === -1 || idx < 2) {
        return false;
      }

      var len = idx - 1;
      var chkSum = 0;
      var i = void 0;
      if (DEBUG) console.log(MOD_NAME + '.checksumValid(' + sentence + ') on ' + sentence.substr(1, len));
      for (i = 1; i < idx; i++) {
        // if(DEBUG) console.log(MOD_NAME + '.checksumValid() index:' + i + ' value:' + strBuf.readUInt8(i));
        chkSum ^= sentence.charCodeAt(i) & 0xFF;
      }

      var chkSumStr = chkSum.toString(16).toUpperCase();
      if (chkSumStr.length < 2) {
        chkSumStr = '0' + chkSumStr;
      }
      if (DEBUG && chkSumStr !== sentence.substr(idx + 1)) {
        console.warn(MOD_NAME + '.checksumValid(' + sentence + ') ' + chkSumStr + '!==' + sentence.substr(idx + 1));
      }
      return chkSumStr === sentence.substr(idx + 1);
    }
  }]);

  return AisParser;
}();

module.exports = AisParser;
