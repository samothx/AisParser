// @flow

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

const DEBUG = false
const MOD_NAME = 'AisBitField';
const AIS_CHR_TBL : Array<string> = [
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
    ' ', '!', '\'', '#', '$', '%', '&', '"', '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?' ];


let padStart = function(str : string,tgtLen : number,padStr : string = '0') : string {
  let fillLen = tgtLen - str.length;
  if(fillLen <= 0) {
    return str;
  }

  let filler = padStr;
  let fLen = filler.length;
  while(fLen < fillLen) {
    let rem = fillLen - fLen;
    filler += fLen > rem ? filler.slice(0, rem) : filler;
    fLen = filler.length;
  }
  if(fLen > fillLen) {
    filler = filler.slice(0,fillLen);
  }
  return filler + str;
}

var printByte = function(byte : number,bits : number = 8) : string {
  return Number(byte & ((1 << bits) - 1)).toString(2).padStart(bits,'0');
}

export default class AisBitField {
  _aisStr : string;
  _strLen : number;
  _bytes : Array<number>;
  _bits : number;

  constructor(str : string, padBits : number) {
    if(DEBUG) console.log(MOD_NAME + '.constructor(' + str + ',' + padBits + ')');
    if(str) {
      this._aisStr = str;
      let strLen = this._strLen = str.length;
      this._bits = strLen * 6;
      let len : number = Math.floor(this._bits / 8) + (((this._bits % 8) == 0) ? 0 : 1);
      this._bytes = new Array(len);
      if(DEBUG) console.log(MOD_NAME + '.constructor() array size:' + this._bytes.length);
      if (this._bits > padBits) {
          this._bits -= padBits;
      } else {
          throw(MOD_NAME + ".parse() invalid bitcount encountered:" + (this._bits - padBits));
      }
    } else {
      this._bits = 0;
    }
  }

  get bits() : number {
    return this._bits;
  }

  // return 6-bit
  _getByte(idx : number) : number {
    let byte : ?number = this._bytes[idx];
    if(typeof byte === 'number') {
      return byte;
    } else {
      let char : number = this._aisStr.charCodeAt(idx);
      if(char > 47) {
        if(char < 88) {
          return this._bytes[idx] = char - 48;
        } else {
          if(char < 96) {
            throw(MOD_NAME + '.parse() invalid character encountered:' + char + ' at index ' + idx);
          } else {
            if(char < 120) {
              return this._bytes[idx] = char - 56;
            } else {
              throw(MOD_NAME + '.parse() invalid character encountered:' + char + ' at index ' + idx);
            }
          }
        }
      } else {
        throw(MOD_NAME + '.parse() invalid character encountered:' + char + ' at index ' + idx);
      }
    }
  }

  getInt(start : number,len : number,unsigned : boolean) : number {
    if(DEBUG) console.log(MOD_NAME + '.getInt(' + start + ',' + len + ',' + unsigned.toString() + ')');

    if(len <= 0) {
      return 0;
    }

    if((len > 31) || ((start + len) > this._bits)) {
      throw(MOD_NAME + '.getInt() invalid invalid indexes encountered:' + start + ' ' + len);
    }

    //let byteCount : number = Math.floor(len / 6);
    let bitIdx : number = start % 6;
    let byteIdx : number = Math.floor(start / 6);
    let retVal = 0;

    if(DEBUG) console.log(MOD_NAME + '.getInt() bitIdx:' + bitIdx + ' byteIdx:' + byteIdx);

    let i : number;
    let bits = 0;
    if(bitIdx > 0) {
      let rShift : number = 6 - bitIdx;
      retVal = this._getByte(byteIdx++) & (0x3F  >> bitIdx);
      bits = rShift;
    }

    let max = Math.min(len,25);
    while(bits < max) {
      retVal = (retVal << 6) | this._getByte(byteIdx++);
      bits += 6;
    }

    if(bits > len) {
      retVal >>= (bits -len);
    } else {
      if(bits < len) {
        let rest : number = len - bits;
        retVal = (retVal << rest) | (this._getByte(byteIdx) >> (6 - rest));
      }
    }

    if(!unsigned && (len < 32)) {
      let compl : number = (1 << (len - 1));
      if((retVal & compl) != 0) {
        // shit, its negative
        retVal = (retVal & ~compl) - compl;
      }
    }
    return retVal;
  }

  getString(start : number,len : number) : string {
    if(len <= 0) {
      return '';
    }

    if(((len % 6) != 0) || ((start + len) > this._bits) || (start < 0)) {
      throw(MOD_NAME + '.getString() invalid invalid indexes encountered:' + start + ' ' + len);
    }

    let bitIdx : number = start % 6;
    let byteIdx : number = Math.floor(start / 6);
    let result : string = '';
    //SysLog.logWarning(this.getClass().getName() + "::getString(" + start + "," + len + ") bitIdx:" + bitIdx + " byteIdx:" + byteIdx);

    if(bitIdx === 0) {
      let endIdx : number = byteIdx + len / 6;
      while(byteIdx < endIdx) {
        result += AIS_CHR_TBL[this._getByte(byteIdx ++)];
      }
    } else {
      let hiMask : number = ((0x1 << bitIdx) - 1) << (6 - bitIdx);
      let loMask : number = ((0x1 << (6 - bitIdx)) - 1);
      let endIdx : number = byteIdx + len / 6 + 1;
      let chrIdx : number = (this._getByte(byteIdx++) & loMask) << bitIdx;
      while(byteIdx < endIdx) {
        let byte : number = this._getByte(byteIdx++);
        result += AIS_CHR_TBL[chrIdx | (byte & hiMask) >> (6 - bitIdx)];
        chrIdx = (byte & loMask) << bitIdx;
      }
    }
    return result;
  }
}
