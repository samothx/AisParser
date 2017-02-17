// @flow

import AisBitField from './AisBitField';
import AisMessage from './AisMessage';

const MOD_NAME = 'Ais24Msg';
const DEBUG = false;

const SUPPORTED_VALUES_A = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'partNo',
  'name' ];

const SUPPORTED_VALUES_B_NO_TENDER = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'partNo',
  'shipType',
  'callSign',
  'vendorId',
  'dimToBow',
  'dimToStern',
  'dimToPort',
  'dimToStbrd' ];

const SUPPORTED_VALUES_B_TENDER = [
  'aisType',
  'channel',
  'repeatInd',
  'mmsi',
  'partNo',
  'shipType',
  'callSign',
  'vendorId',
  'mothershipMmsi'];

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
    this._valid = 'VALID';
  }

  get supportedValues() : Array<string> {
    if(this.partNo === 0) {
      return SUPPORTED_VALUES_A;
    } else {
      if(this._isTender()) {
        return SUPPORTED_VALUES_B_TENDER;
      } else {
        return SUPPORTED_VALUES_B_NO_TENDER;
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

  get dimToBow() : number {
    if((this.partNo === 1) && !this._isTender()) {
      return this._bitField.getInt(132,9,true);
    } else {
      return NaN;
    }
  }

  get dimToStern() : number {
    if((this.partNo === 1) && !this._isTender()) {
      return this._bitField.getInt(141,9,true);
    } else {
      return NaN;
    }
  }

  get dimToPort() : number {
    if((this.partNo === 1) && !this._isTender()) {
      return this._bitField.getInt(150,6,true);
    } else {
      return NaN;
    }
  }

  get dimToStbrd() : number {
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
