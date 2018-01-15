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

import AisBitField from './AisBitField';
import AisMessage from './AisMessage';
import AisCNBMsg from './AisCNBMsg';
import Ais04Msg from './Ais04Msg';
import Ais05Msg from './Ais05Msg';
import Ais18Msg from './Ais18Msg';
import Ais19Msg from './Ais19Msg';
import Ais21Msg from './Ais21Msg';
import Ais24Msg from './Ais24Msg';

// TODO:  Parser currently rejects multipart messages, if the padbit is != 0 in
//        any but the last part. In an AisHub scan 2 messages where encountered
//        that where built like that but they were invalid in other ways too,
//        so I am hoping to get away like this.

export type ParseOptions = { checksum? : boolean; };

export type Context = { [id : string] : { idx : number, aisStr: string } };

const MOD_NAME = 'AisParser';
const DEBUG = false

class AisParser {
  _context : Context;
  _options : ParseOptions;

  constructor(options : ParseOptions = {}) {
    this._options = options;
    this._context = {};
  }

  static checksumValid(sentence : string) : boolean {
    if(!(sentence.startsWith('!AIVDO') || sentence.startsWith('!AIVDM'))) {
      return false;
    }

    let idx = sentence.indexOf('*');
    if((idx === -1) || (idx < 2)) {
      return false;
    }

    let len : number = idx - 1;
    let chkSum : number = 0;
    let i : number;
    if(DEBUG) console.log(MOD_NAME + '.checksumValid(' + sentence + ') on ' + sentence.substr(1,len));
    for(i = 1;i < idx;i++) {
    // if(DEBUG) console.log(MOD_NAME + '.checksumValid() index:' + i + ' value:' + strBuf.readUInt8(i));
      chkSum ^= sentence.charCodeAt(i) & 0xFF;
    }

    let chkSumStr : string = chkSum.toString(16).toUpperCase();
    if(chkSumStr.length < 2) {
      chkSumStr = '0' + chkSumStr;
    }
    if(DEBUG && (chkSumStr !== sentence.substr(idx + 1))) {
      console.warn(MOD_NAME + '.checksumValid(' + sentence + ') ' + chkSumStr+ '!==' + sentence.substr(idx + 1));
    }
    return chkSumStr === sentence.substr(idx + 1);
  }

  parse(sentence : string,options : ParseOptions = {}) : AisMessage {
    let checksum = (typeof options.checksum !== 'undefined') ? options.checksum : this._options.checksum;
    if(checksum && !AisParser.checksumValid(sentence)) {
      return AisMessage.fromError('INVALID','Invalid checksum in message: [' + sentence + ']');
    }
    return this.parseArray(sentence.split(','))
  }

  // !AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74
  parseArray(part : Array<string>) : AisMessage {
    let parts : number = part.length

    if(parts !== 7) {
      return AisMessage.fromError('INVALID','Invalid count (!=7) of comma separated elements in message: [' + String(part) + ']');
    } else {
      if((part[0] !== '!AIVDM') && (part[0] !== '!AIVDO')) {
        return AisMessage.fromError('UNSUPPORTED','not a supported AIS message:[' + String(part) + ']');
      }
    }

    let msgCount : number = Number(part[1]);
    let msgIdx : number = Number(part[2]);
    let msgId : string = part[3];
    let padBit : number = Number(part[6].substr(0,1));
    let aisStr : string = part[5];

    if(msgCount > 1) {
      if(msgIdx === msgCount) {
        let msgParts = this._context[msgId];
        if(!msgParts) {
          return AisMessage.fromError('INVALID','missing prior message(s) in partial message:[' + String(part) + ']');
        }
        if(msgIdx !== (msgParts.idx + 1)) {
          delete this._context[msgId];
          return AisMessage.fromError('INVALID','sequence violation (skipped or missing message) in partial message:[' + String(part) + ']');
        }
        aisStr = msgParts.aisStr + aisStr;
        delete this._context[msgId];
      } else {
        if(padBit !== 0) {
          return AisMessage.fromError('UNSUPPORTED','padbit!=0 not supported in partial message:[' + String(part) + ']');
        }
        let msgParts = this._context[msgId];
        if(msgIdx === 1) {
          if(typeof msgParts !== 'undefined') {
            delete this._context[msgId];
            return AisMessage.fromError('INVALID','a message with this sequence and index already exists in partial message:[' + String(part) + ']');
          }
          this._context[msgId] = { idx : msgIdx, aisStr: aisStr };
          return AisMessage.fromError('INCOMPLETE','');
        } else {
          if(!msgParts) {
            return AisMessage.fromError('INVALID','missing prior message in partial message:[' + String(part) + ']');
          }
          if(msgIdx !== (msgParts.idx + 1)) {
            delete this._context[msgId];
            return AisMessage.fromError('INVALID','sequence violation (skipped or missing message) in partial message:[' + String(part) + ']');
          }
          msgParts.idx = msgIdx;
          msgParts.aisStr += aisStr;
          return AisMessage.fromError('INCOMPLETE','');
        }
      }
    } else {
      if(msgIdx !== 1) {
        return AisMessage.fromError('INVALID','invalid message index !=1 in non partial message:[' + String(part) + ']');
      }
    }

    try {
      let bitField : AisBitField = new AisBitField(aisStr,padBit);
      let aisType : number = bitField.getInt(0,6,true);
      switch(aisType) {
        case 1:
        case 2:
        case 3:
          return new AisCNBMsg(aisType,bitField,part[4]);
        case 4:
          return new Ais04Msg(aisType,bitField,part[4]);
        case 5:
          return new Ais05Msg(aisType,bitField,part[4]);
        case 18:
          return new Ais18Msg(aisType,bitField,part[4]);
        case 19:
          return new Ais19Msg(aisType,bitField,part[4]);
        case 21:
          return new Ais21Msg(aisType,bitField,part[4]);
        case 24:
          return new Ais24Msg(aisType,bitField,part[4]);
        default:
          return AisMessage.fromError(
            'UNSUPPORTED',
            'Unsupported ais type ' + aisType + ' in message [' + String(part) + ']',
            aisType,
            part[4]);
      }
    } catch(error) {
      return AisMessage.fromError('INVALID','Failed to parse message, error:' + error);
    }
  }
}
module.exports = AisParser;
