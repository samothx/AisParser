'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var DEBUG = false;
var MOD_NAME = 'AisBitField';
var AIS_CHR_TBL = ['@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_', ' ', '!', '\'', '#', '$', '%', '&', '"', '(', ')', '*', '+', ',', '-', '.', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?'];

var padStart = function padStart(str, tgtLen) {
  var padStr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0';

  var fillLen = tgtLen - str.length;
  if (fillLen <= 0) {
    return str;
  }

  var filler = padStr;
  var fLen = filler.length;
  while (fLen < fillLen) {
    var rem = fillLen - fLen;
    filler += fLen > rem ? filler.slice(0, rem) : filler;
    fLen = filler.length;
  }
  if (fLen > fillLen) {
    filler = filler.slice(0, fillLen);
  }
  return filler + str;
};

var printByte = function printByte(byte) {
  var bits = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;

  return Number(byte & (1 << bits) - 1).toString(2).padStart(bits, '0');
};

var AisBitField = function () {
  function AisBitField(str, padBits) {
    _classCallCheck(this, AisBitField);

    if (DEBUG) console.log(MOD_NAME + '.constructor(' + str + ',' + padBits + ')');
    if (str) {
      this._aisStr = str;
      var strLen = this._strLen = str.length;
      this._bits = strLen * 6;
      var len = Math.floor(this._bits / 8) + (this._bits % 8 == 0 ? 0 : 1);
      this._bytes = new Array(len);
      if (DEBUG) console.log(MOD_NAME + '.constructor() array size:' + this._bytes.length);
      if (this._bits > padBits) {
        this._bits -= padBits;
      } else {
        throw MOD_NAME + ".parse() invalid bitcount encountered:" + (this._bits - padBits);
      }
    } else {
      this._bits = 0;
    }
  }

  _createClass(AisBitField, [{
    key: '_getByte',


    // return 6-bit
    value: function _getByte(idx) {
      var byte = this._bytes[idx];
      if (typeof byte === 'number') {
        return byte;
      } else {
        var char = this._aisStr.charCodeAt(idx);
        if (char > 47) {
          if (char < 88) {
            return this._bytes[idx] = char - 48;
          } else {
            if (char < 96) {
              throw MOD_NAME + '.parse() invalid character encountered:' + char + ' at index ' + idx;
            } else {
              if (char < 120) {
                return this._bytes[idx] = char - 56;
              } else {
                throw MOD_NAME + '.parse() invalid character encountered:' + char + ' at index ' + idx;
              }
            }
          }
        } else {
          throw MOD_NAME + '.parse() invalid character encountered:' + char + ' at index ' + idx;
        }
      }
    }
  }, {
    key: 'getInt',
    value: function getInt(start, len, unsigned) {
      if (DEBUG) console.log(MOD_NAME + '.getInt(' + start + ',' + len + ',' + unsigned.toString() + ')');

      if (len <= 0) {
        return 0;
      }

      if (len > 31 || start + len > this._bits) {
        throw MOD_NAME + '.getInt() invalid invalid indexes encountered:' + start + ' ' + len;
      }

      //let byteCount : number = Math.floor(len / 6);
      var bitIdx = start % 6;
      var byteIdx = Math.floor(start / 6);
      var retVal = 0;

      if (DEBUG) console.log(MOD_NAME + '.getInt() bitIdx:' + bitIdx + ' byteIdx:' + byteIdx);

      var i = void 0;
      var bits = 0;
      if (bitIdx > 0) {
        var rShift = 6 - bitIdx;
        retVal = this._getByte(byteIdx++) & 0x3F >> bitIdx;
        bits = rShift;
      }

      var max = Math.min(len, 25);
      while (bits < max) {
        retVal = retVal << 6 | this._getByte(byteIdx++);
        bits += 6;
      }

      if (bits > len) {
        retVal >>= bits - len;
      } else {
        if (bits < len) {
          var rest = len - bits;
          retVal = retVal << rest | this._getByte(byteIdx) >> 6 - rest;
        }
      }

      if (!unsigned && len < 32) {
        var compl = 1 << len - 1;
        if ((retVal & compl) != 0) {
          // shit, its negative
          retVal = (retVal & ~compl) - compl;
        }
      }
      return retVal;
    }
  }, {
    key: 'getString',
    value: function getString(start, len) {
      if (len % 6 != 0 || start + len >= this._bits || start < 0) {
        throw MOD_NAME + '.getString() invalid indexes encountered: start:' + start + ' len:' + len + ' bits:' + this._bits;
      }

      if (len === 0) {
        return '';
      }

      var bitIdx = start % 6;
      var byteIdx = Math.floor(start / 6);
      var result = '';
      //SysLog.logWarning(this.getClass().getName() + "::getString(" + start + "," + len + ") bitIdx:" + bitIdx + " byteIdx:" + byteIdx);

      if (bitIdx === 0) {
        var endIdx = byteIdx + len / 6;
        while (byteIdx < endIdx) {
          result += AIS_CHR_TBL[this._getByte(byteIdx++)];
        }
      } else {
        var hiMask = (0x1 << bitIdx) - 1 << 6 - bitIdx;
        var loMask = (0x1 << 6 - bitIdx) - 1;
        var _endIdx = byteIdx + len / 6 + 1;
        var chrIdx = (this._getByte(byteIdx++) & loMask) << bitIdx;
        while (byteIdx < _endIdx) {
          var byte = this._getByte(byteIdx++);
          result += AIS_CHR_TBL[chrIdx | (byte & hiMask) >> 6 - bitIdx];
          chrIdx = (byte & loMask) << bitIdx;
        }
      }
      return result;
    }
  }, {
    key: 'bits',
    get: function get() {
      return this._bits;
    }
  }]);

  return AisBitField;
}();

exports.default = AisBitField;
