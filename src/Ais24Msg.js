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
import type {SuppValues} from './AisMessage';

const MOD_NAME = 'Ais24Msg';

const SUPPORTED_FIELDS_A = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'midCountry',
  'midCountryIso',
  'mmsiType',
  'partNo',
  'name' ];

const SUPPORTED_FIELDS_B_NO_TENDER = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'midCountry',
  'midCountryIso',
  'mmsiType',
  'partNo',
  'shipType',
  'callSign',
  'vendorId',
  'dimToBow',
  'dimToBowStatus',
  'dimToStern',
  'dimToSternStatus',
  'dimToPort',
  'dimToPortStatus',
  'dimToStbrd',
  'dimToStbrdStatus'
 ];

const SUPPORTED_FIELDS_B_TENDER = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'midCountry',
  'midCountryIso',  
  'mmsiType',
  'partNo',
  'shipType',
  'callSign',
  'vendorId',
  'mothershipMmsi'];

  let suppValuesValidA = false;
  let suppValuesA : SuppValues = {};
  let suppValuesValidBNT = false;
  let suppValuesBT : SuppValues = {};
  let suppValuesValidBT = false;
  let suppValuesBNT : SuppValues = {};

/*
|==============================================================================
|Field   |Len |Description            | Member         |T|Units
|0-5     |  6 | Message Type          | type           |u|Constant: 24
|6-7     |  2 | Repeat Indicator      | repeat         |u|As in CNB
|8-37    | 30 | MMSI                  | mmsi           |u|9 digits
|38-39   |  2 | Part Number           | partno         |u|0-1
|40-159  |120 | Vessel Name           | shipname       |t|(Part A) 20 sixbit chars
|160-167 |  8 | Spare                 |                |x|(Part A) Not used
|40-47   |  8 | Ship Type             | shiptype       |e|(Part B) See "Ship Types"
|48-89   | 42 | Vendor ID             | vendorid       |t|(Part B) 7 six-bit chars
|90-131  | 42 | Call Sign             | callsign       |t|(Part B) As in Message Type 5
|132-140 |  9 | Dimension to Bow      | to_bow         |u|(Part B) Meters
|141-149 |  9 | Dimension to Stern    | to_stern       |u|(Part B) Meters
|150-155 |  6 | Dimension to Port     | to_port        |u|(Part B) Meters
|156-161 |  6 | Dimension to Starboard| to_starboard   |u|(Part B) Meters
|132-161 | 30 | Mothership MMSI       | mothership_mmsi|u|(Part B) See below
|162-167 |  6 | Spare                 |                |x|(Part B) Not used
|===============================================================================
*/

export type PartNo = 0 | 1;

export default class Ais24Msg extends AisMessage {
  _partNo : ?PartNo;
  _tender : ?boolean;

  constructor(aisType : number,bitField : AisBitField, channel : string) {
    super(aisType,bitField,channel);
    if(bitField.bits >= 39) {
      this._partNo = this._bitField.getInt(38,2,true) ? 1 : 0;

      if(((this._partNo === 0) && (bitField.bits >= 159)) || (bitField.bits >= 161)) {
        this._valid = 'VALID';
        return;
      }
    }
    this._valid = 'INVALID';
    this._errMsg = 'invalid bitcount for type 24 msg:' + bitField.bits;
  }

  get supportedValues() : SuppValues {
    if(this.partNo === 0) {
      if(!suppValuesValidA) {
        SUPPORTED_FIELDS_A.forEach((field)=>{
          let unit = AisMessage.getUnit(field);
          if(unit) {
            suppValuesA[field] = unit;
          } else {
            console.warn(MOD_NAME + 'field without unit encountered:' + field);
          }});
          suppValuesValidA = true;
        }
      return suppValuesA;
    } else {
      if(this._isTender()) {
        if(!suppValuesValidBT) {
          SUPPORTED_FIELDS_B_TENDER.forEach((field)=>{
            let unit = AisMessage.getUnit(field);
            if(unit) {
              suppValuesBT[field] = unit;
            } else {
              console.warn(MOD_NAME + 'field without unit encountered:' + field);
            }});
            suppValuesValidBT = true;
          }
        return suppValuesBT;
      } else {
        if(!suppValuesValidBNT) {
          SUPPORTED_FIELDS_B_NO_TENDER.forEach((field)=>{
            let unit = AisMessage.getUnit(field);
            if(unit) {
              suppValuesBNT[field] = unit;
            } else {
              console.warn(MOD_NAME + 'field without unit encountered:' + field);
            }});
            suppValuesValidBNT = true;
          }
        return suppValuesBNT;
      }
    }
  }


  get partNo() : number {
    if(typeof this._partNo === 'number') {
      return this._partNo;
    } else {
      return this._partNo = this._bitField.getInt(38,2,true) ? 1 : 0;
    }
  }

  get name() : string {
    if(this.partNo === 0) {
      return this._formatStr(this._bitField.getString(40,120));
    } else {
      return '';
    }
  }

  get shipType() : number {
    if(this.partNo === 1) {
      return this._bitField.getInt(40,8,true);
    } else {
      return NaN;
    }
  }

  get callSign() : string {
    if(this.partNo === 1) {
      return this._formatStr(this._bitField.getString(90,42));
    } else {
      return '';
    }
  }

  get vendorId() : string {
    if(this.partNo === 1) {
      return this._formatStr(this._bitField.getString(48,42));
    } else {
      return '';
    }
  }

  _isTender() : boolean {
    if(typeof this._tender !== 'boolean') {
      this._tender = String(this.mmsi).startsWith('98');
    }
    return this._tender;
  }

  _getDimToBow() : number {
    if((this.partNo === 1) && !this._isTender()) {
      return this._bitField.getInt(132,9,true);
    } else {
      return NaN;
    }
  }

  _getDimToStern() : number {
    if((this.partNo === 1) && !this._isTender()) {
      return this._bitField.getInt(141,9,true);
    } else {
      return NaN;
    }
  }

  _getDimToPort() : number {
    if((this.partNo === 1) && !this._isTender()) {
      return this._bitField.getInt(150,6,true);
    } else {
      return NaN;
    }
  }

  _getDimToStbrd() : number {
    if((this.partNo === 1) && !this._isTender()) {
      return this._bitField.getInt(156,6,true);
    } else {
      return NaN;
    }
  }

  get mothershipMmsi() : number {
    if((this.partNo === 1) && this._isTender()) {
      return this._bitField.getInt(132,30,true);
    } else {
      return NaN;
    }
  }
}
