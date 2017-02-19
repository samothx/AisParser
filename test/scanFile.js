#!/usr/bin/node
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

import fs from 'fs';
import {Transform} from 'stream';

import AisMessage from '../src/AisMessage';
import type {SuppValues} from '../src/AisMessage';
import AisParser from '../src/AisParser';

const TMP_FILE_NAME = 'tmp.out';
const MOD_NAME = 'scanFile';
const DEBUG = false;

class Parser extends Transform {
  _fields: { [name : string] : number };
  _fieldCount : number;
  _fieldNames : Array<string>;
  _template : Array<string>;
  _aisContext: Object;
  _lineCount : number;
  _aisCount : number;
  _failCount : number;
  _oStream : Object;
  _iStream : Object;
  _failStream : Object;
  _lineCache : { [id : string] : Array<string> };
  _typeSigk : boolean;
  _ggDuration : number;
  _parseDuration : number;
  _readDuration : number;
  _remaining : string;
  _aisParser : AisParser;

  constructor(failStream : Object,sigkType : boolean) {
    super();
    this._aisParser = new AisParser({checksum : true});
    this._fields = { 'lineNo': 0 };
    this._fieldCount = 1;
    this._fieldNames = ['lineNo'];
    this._template = [];
    this._aisContext = {};
    this._lineCount = 0;
    this._aisCount = 0;
    this._failCount = 0;
    this._lineCache = {};
    this._parseDuration = 0;
    this._readDuration = 0;
    this._remaining = '';
    this._failStream = failStream;
    this._typeSigk = sigkType;
  }

  _transform(chunk, encoding, callback) {
    if(DEBUG) console.log(MOD_NAME + '._transform()');
    this._remaining += chunk.toString();
    let line : Array<string> = this._remaining.split(/\r?\n/);
    let lines : number = line.length;
    if(lines > 0) {
      this._remaining = line.pop();
      line.forEach((curr)=>{
        let output = this.processNMEALine(curr,++this._lineCount);
        if(output) this.push(output);
      });
    }
    callback();
  }

  format(input : string,last : boolean = false) : string {
    let term : string = (last ? '\n' : ',');
    if(typeof input === 'number') {
      if(isNaN(input)) {
        return '"N/A"' + term
      } else {
        return (Number.isInteger(input) ? input : input.toFixed(2)) + term;
      }
    } else {
      if(typeof input !== 'undefined') {
        return '"' + String(input) + '"' + term;
      } else {
        return term;
      }
    }
  }

  arrayToCsv(output : Array<any>) : string {
    let outputStr : string = '';
    let i : number;
    let curr : any;
    for(i = 0;i < (output.length - 1);i ++) {
      outputStr += this.format(output[i]);
    }
    return outputStr + this.format(output[output.length - 1],true);
  }

  processNMEALine(rawLine: string,lineNo : number) : ?string {
    let line : string;
    if(this._typeSigk) {
      let idx = rawLine.indexOf(';');
      if(idx === -1) {
        console.warn('invalid sigk line:' + lineNo + ' line:' + rawLine);
        return;
      }

      idx = rawLine.indexOf(';',idx + 1);
      if(idx === -1) {
        console.warn('invalid sigk line:' + lineNo + ' line:' + rawLine);
        return;
      }

      line = rawLine.substr(idx + 1);
    } else {
      line = rawLine;
    }

    if(line && line.startsWith('!AI')) {
      if(line.length < 10) {
        console.warn('line too short:' + lineNo + ' line:' + rawLine);
        return;
      }

      this._aisCount ++;

      let part : Array<string> = line.split(',');
      let msgCount : number = Number(part[1]);
      let msgIdx : number = Number(part[2]);
      let msgId : string = part[3];
      if(msgCount > 1) {
        if(msgIdx === 1) {
          this._lineCache[msgId] = [line];
        } else {
          this._lineCache[msgId].push(line);
        }
      }

      let msg : AisMessage;
      let keysPrinted : boolean = false;
      try {
        let startTime = process.hrtime();
        msg = this._aisParser.parse(line);
        let dur = process.hrtime(startTime);
        this._parseDuration += dur[0] * 1e9 + dur[1];
        if(msg.valid === 'VALID') {
          let output : Array<any> = new Array(this._fieldCount);
          let values : SuppValues = msg.supportedValues;
          output[0] = lineNo;
          startTime = process.hrtime();
          let field: string;
          for(field in values) {
            let fieldIdx : ?number = this._fields[field];
            if(typeof fieldIdx !== 'number') {
              fieldIdx = this._fieldCount++;
              this._fields[field] = fieldIdx;
              this._fieldNames.push(field);
              output.push(msg[field]);
            } else {
              output[fieldIdx] = msg[field];
            }
          };
          let dur = process.hrtime(startTime);
          this._readDuration += dur[0] * 1e9 + dur[1];
          return this.arrayToCsv(output);
        } else {
          if(msg.valid !== 'INCOMPLETE') {
            console.log('valid:' + msg.valid + ' msg:' + (msg.errMsg || '-'));
            this._failCount ++;
            this._failStream.write(line + '\n');
          }
        }
      } catch(error) {
        console.error('exception from AisDecode in line:' + lineNo + ' error:' + error);
        console.error('line content:' + rawLine);
        this._failCount ++;
        this._failStream.write(line + '\n');
      }
    }
    return;
  }

  getHeaders() : string {
    let output : string = this.arrayToCsv(this._fieldNames);
    let units : Array<string> = [];
    this._fieldNames.forEach((field)=>{
      units.push(AisMessage.getUnit(field) || '');
    });
    output += this.arrayToCsv(units);
    return output;
  }

  getResults() : string {
    return 'success, read ' + this._lineCount + ' lines, ' + this._aisCount + ' ais lines of which ' + this._failCount + ' failed\n' +
           'Durations: ' + (this._parseDuration / this._aisCount).toFixed(3) + ' ns per message for parsing, ' +
           (this._readDuration / (this._aisCount - this._failCount)).toFixed(3) + ' ns per message for reading';
  }
}


if(process.argv.length < 5) {
  console.log('USAGE: <input file> <output file> <failed file> [sigk]');
} else {
  if(fs.existsSync(process.argv[2])) {
    let iStream = fs.createReadStream(process.argv[2]);
    let oStream = fs.createWriteStream(TMP_FILE_NAME);
    let fStream = fs.createWriteStream(process.argv[4]);
    let parser : Parser = new Parser(fStream,process.argv[5] === 'sigk');
    oStream.on('finish',()=>{
        iStream.close();
        fStream.close();
        oStream.close();
        iStream = fs.createReadStream(TMP_FILE_NAME);
        oStream = fs.createWriteStream(process.argv[3]);
        oStream.on('finish',()=>{
          iStream.close();
          fs.unlink(TMP_FILE_NAME);
          oStream.close();
          console.log(parser.getResults());
        });
        oStream.write(parser.getHeaders());
        iStream.pipe(oStream);
    })
    parser.pipe(oStream);
    iStream.pipe(parser);
  }
}
