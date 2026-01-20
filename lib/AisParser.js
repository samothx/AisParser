"use strict";

var _AisBitField = _interopRequireDefault(require("./AisBitField"));
var _AisMessage = _interopRequireDefault(require("./AisMessage"));
var _AisCNBMsg = _interopRequireDefault(require("./AisCNBMsg"));
var _Ais04Msg = _interopRequireDefault(require("./Ais04Msg"));
var _Ais05Msg = _interopRequireDefault(require("./Ais05Msg"));
var _Ais09Msg = _interopRequireDefault(require("./Ais09Msg"));
var _Ais08Msg = _interopRequireDefault(require("./Ais08Msg"));
var _Ais08MsgDac367Fid = _interopRequireDefault(require("./Ais08MsgDac367Fid23"));
var _Ais08MsgDac367Fid2 = _interopRequireDefault(require("./Ais08MsgDac367Fid24"));
var _Ais08MsgDac200Fid = _interopRequireDefault(require("./Ais08MsgDac200Fid10"));
var _Ais08MsgDac1Fid = _interopRequireDefault(require("./Ais08MsgDac1Fid21"));
var _Ais08MsgDac1Fid2 = _interopRequireDefault(require("./Ais08MsgDac1Fid29"));
var _Ais08MsgDac1Fid3 = _interopRequireDefault(require("./Ais08MsgDac1Fid30"));
var _Ais08MsgDac1Fid4 = _interopRequireDefault(require("./Ais08MsgDac1Fid31"));
var _Ais14Msg = _interopRequireDefault(require("./Ais14Msg"));
var _Ais18Msg = _interopRequireDefault(require("./Ais18Msg"));
var _Ais19Msg = _interopRequireDefault(require("./Ais19Msg"));
var _Ais21Msg = _interopRequireDefault(require("./Ais21Msg"));
var _Ais24Msg = _interopRequireDefault(require("./Ais24Msg"));
var _Ais27Msg = _interopRequireDefault(require("./Ais27Msg"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /*
 * AisParser: A parser for NMEA0183 AIS messages.
 * Copyright (C) 2017-2024 Thomas Runte <coding@etnur.net>.
 * Copyright (C) 2025-2026 Davide Gessa  <gessadavide@gmail.com>.
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
// TODO:  Parser currently rejects multipart messages, if the padbit is != 0 in
//        any but the last part. In an AisHub scan 2 messages where encountered
//        that where built like that but they were invalid in other ways too,
//        so I am hoping to get away like this.

var MOD_NAME = 'AisParser';
var DEBUG = false;
var VALID_STARTS = ['!AIVDO', '!AIVDM', '!ANVDM', '!ABVDM', '!ANVDO', '!BSVDM', '!B2VDM', '!B1VDM', '!BSVDO'];
var AisParser = /*#__PURE__*/function () {
  function AisParser() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, AisParser);
    this._options = options;
    this._context = {};
  }
  return _createClass(AisParser, [{
    key: "parse",
    value: function parse(sentence) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var checksum = typeof options.checksum !== 'undefined' ? options.checksum : this._options.checksum;
      if (checksum && !AisParser.checksumValid(sentence)) {
        return _AisMessage["default"].fromError('INVALID', 'Invalid checksum in message: [' + sentence + ']');
      }
      return this.parseArray(sentence.split(','));
    }

    // !AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74
  }, {
    key: "parseArray",
    value: function parseArray(part) {
      var parts = part.length;
      if (parts !== 7) {
        return _AisMessage["default"].fromError('INVALID', 'Invalid count (!=7) of comma separated elements in message: [' + String(part) + ']');
      } else {
        if (!VALID_STARTS.includes(part[0])) {
          return _AisMessage["default"].fromError('UNSUPPORTED', 'not a supported AIS message:[' + String(part) + ']');
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
            return _AisMessage["default"].fromError('INVALID', 'missing prior message(s) in partial message:[' + String(part) + ']');
          }
          if (msgIdx !== msgParts.idx + 1) {
            delete this._context[msgId];
            return _AisMessage["default"].fromError('INVALID', 'sequence violation (skipped or missing message) in partial message:[' + String(part) + ']');
          }
          aisStr = msgParts.aisStr + aisStr;
          delete this._context[msgId];
        } else {
          if (padBit !== 0) {
            return _AisMessage["default"].fromError('UNSUPPORTED', 'padbit!=0 not supported in partial message:[' + String(part) + ']');
          }
          var _msgParts = this._context[msgId];
          if (msgIdx === 1) {
            if (typeof _msgParts !== 'undefined') {
              delete this._context[msgId];
              return _AisMessage["default"].fromError('INVALID', 'a message with this sequence and index already exists in partial message:[' + String(part) + ']');
            }
            this._context[msgId] = {
              idx: msgIdx,
              aisStr: aisStr
            };
            return _AisMessage["default"].fromError('INCOMPLETE', '');
          } else {
            if (!_msgParts) {
              return _AisMessage["default"].fromError('INVALID', 'missing prior message in partial message:[' + String(part) + ']');
            }
            if (msgIdx !== _msgParts.idx + 1) {
              delete this._context[msgId];
              return _AisMessage["default"].fromError('INVALID', 'sequence violation (skipped or missing message) in partial message:[' + String(part) + ']');
            }
            _msgParts.idx = msgIdx;
            _msgParts.aisStr += aisStr;
            return _AisMessage["default"].fromError('INCOMPLETE', '');
          }
        }
      } else {
        if (msgIdx !== 1) {
          return _AisMessage["default"].fromError('INVALID', 'invalid message index !=1 in non partial message:[' + String(part) + ']');
        }
      }
      try {
        var bitField = new _AisBitField["default"](aisStr, padBit);
        var aisType = bitField.getInt(0, 6, true);
        switch (aisType) {
          case 1:
          case 2:
          case 3:
            return new _AisCNBMsg["default"](aisType, bitField, part[4]);
          case 4:
            return new _Ais04Msg["default"](aisType, bitField, part[4]);
          case 5:
            return new _Ais05Msg["default"](aisType, bitField, part[4]);
          case 9:
            return new _Ais09Msg["default"](aisType, bitField, part[4]);
          case 8:
            var sentence = new _Ais08Msg["default"](aisType, bitField, part[4]);

            // This Msg has dac and fid in another position
            var d1f30 = new _Ais08MsgDac1Fid3["default"](aisType, bitField, part[4]);
            if (d1f30._valid === 'VALID' && d1f30.dac == 1 && d1f30.fid == 30) {
              return d1f30;
            }
            if (sentence.dac == 200 && sentence.fid == 10) {
              return new _Ais08MsgDac200Fid["default"](aisType, bitField, part[4]);
            } else if (sentence.dac == 367 && sentence.fid == 23) {
              return new _Ais08MsgDac367Fid["default"](aisType, bitField, part[4]);
            } else if (sentence.dac == 367 && sentence.fid == 24) {
              return new _Ais08MsgDac367Fid2["default"](aisType, bitField, part[4]);
            } else if (sentence.dac == 1 && sentence.fid == 21) {
              return new _Ais08MsgDac1Fid["default"](aisType, bitField, part[4]);
            } else if (sentence.dac == 1 && sentence.fid == 29) {
              return new _Ais08MsgDac1Fid2["default"](aisType, bitField, part[4]);
            } else if (sentence.dac == 1 && sentence.fid == 31) {
              return new _Ais08MsgDac1Fid4["default"](aisType, bitField, part[4]);
            } else {
              return sentence;
            }
          case 14:
            return new _Ais14Msg["default"](aisType, bitField, part[4]);
          case 18:
            return new _Ais18Msg["default"](aisType, bitField, part[4]);
          case 19:
            return new _Ais19Msg["default"](aisType, bitField, part[4]);
          case 21:
            return new _Ais21Msg["default"](aisType, bitField, part[4]);
          case 24:
            return new _Ais24Msg["default"](aisType, bitField, part[4]);
          case 27:
            return new _Ais27Msg["default"](aisType, bitField, part[4]);
          default:
            return _AisMessage["default"].fromError('UNSUPPORTED', 'Unsupported ais type ' + aisType + ' in message [' + String(part) + ']', aisType, part[4]);
        }
      } catch (error) {
        return _AisMessage["default"].fromError('INVALID', 'Failed to parse message, error:' + error);
      }
    }
  }], [{
    key: "checksumValid",
    value: function checksumValid(sentence) {
      if (!VALID_STARTS.some(function (prefix) {
        return sentence.startsWith(prefix);
      })) {
        return false;
      }
      var idx = sentence.indexOf('*');
      if (idx === -1 || idx < 2) {
        return false;
      }
      var len = idx - 1;
      var chkSum = 0;
      var i;
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
}();
module.exports = AisParser;
