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

export type UtcTsStatus = 'VALID' | 'INVALID' | 'NA' | 'MANUAL' | 'ESTIMATED' | 'INOPERATIVE';
export type RotStatus = 'NONE' | 'RIGHT' | 'LEFT' | 'NA';
export type SogStatus = 'HIGH' | 'VALID' | 'INVALID' | 'NA';
export type SuppValues = { [key : string] : string };

export type Validity = 'VALID' | 'INCOMPLETE' | 'INVALID' | 'UNSUPPORTED';

export type ROT = {
  type : 'RIGHT' | 'LEFT' | 'NONE' | 'INVALID';
  speed : number;
}

const DEBUG = false;
const MOD_NAME = 'AisMessage';
const INVALID_LON = 0x6791AC0;
const INVALID_LAT = 0x3412140;

const SUPPORTED_FIELDS = [
  'valid',
  'errMsg',
  'aisType' ];

const NAV_STATUS = {
  '0' : 'Under way using engine',
  '1' : 'At anchor',
  '2' : 'Not under command',
  '3' : 'Restricted manoeuverability',
  '4' : 'Constrained by her draught',
  '5' : 'Moored',
  '6' : 'Aground',
  '7' : 'Engaged in Fishing',
  '8' : 'Under way sailing',
  '9' : 'Reserved for future amendment of Navigational Status for HSC',
  '10' : 'Reserved for future amendment of Navigational Status for WIG',
  '11' : 'Reserved for future use',
  '12' : 'Reserved for future use',
  '13' : 'Reserved for future use',
  '14' : 'Reserved for future use',
  '15' : 'Not defined (default)',
}

const SHIP_TYPE = {
  '0'  : 'Not available',
  '1'  : 'Reserved for future use',
  '2'  : 'Reserved for future use',
  '3'  : 'Reserved for future use',
  '4'  : 'Reserved for future use',
  '5'  : 'Reserved for future use',
  '6'  : 'Reserved for future use',
  '7'  : 'Reserved for future use',
  '8'  : 'Reserved for future use',
  '9'  : 'Reserved for future use',
  '10' : 'Reserved for future use',
  '11' : 'Reserved for future use',
  '12' : 'Reserved for future use',
  '13' : 'Reserved for future use',
  '14' : 'Reserved for future use',
  '15' : 'Reserved for future use',
  '16' : 'Reserved for future use',
  '17' : 'Reserved for future use',
  '18' : 'Reserved for future use',
  '19' : 'Reserved for future use',
  '20' : '|Wing in ground (WIG), all ships of this type',
  '21' : 'Wing in ground (WIG), Hazardous category A',
  '22' : 'Wing in ground (WIG), Hazardous category B',
  '23' : 'Wing in ground (WIG), Hazardous category C',
  '24' : 'Wing in ground (WIG), Hazardous category D',
  '25' : 'Wing in ground (WIG), Reserved for future use',
  '26' : 'Wing in ground (WIG), Reserved for future use',
  '27' : 'Wing in ground (WIG), Reserved for future use',
  '28' : 'Wing in ground (WIG), Reserved for future use',
  '29' : 'Wing in ground (WIG), Reserved for future use',
  '30' : 'Fishing',
  '31' : 'Towing',
  '32' : 'Towing: length exceeds 200m or breadth exceeds 25m',
  '33' : 'Dredging or underwater ops',
  '34' : 'Diving ops',
  '35' : 'Military ops',
  '36' : 'Sailing',
  '37' : 'Pleasure Craft',
  '38' : 'Reserved',
  '39' : 'Reserved',
  '40' : 'High speed craft (HSC), all ships of this type',
  '41' : 'High speed craft (HSC), Hazardous category A',
  '42' : 'High speed craft (HSC), Hazardous category B',
  '43' : 'High speed craft (HSC), Hazardous category C',
  '44' : 'High speed craft (HSC), Hazardous category D',
  '45' : 'High speed craft (HSC), Reserved for future use',
  '46' : 'High speed craft (HSC), Reserved for future use',
  '47' : 'High speed craft (HSC), Reserved for future use',
  '48' : 'High speed craft (HSC), Reserved for future use',
  '49' : 'High speed craft (HSC), No additional information',
  '50' : 'Pilot Vessel',
  '51' : 'Search and Rescue vessel',
  '52' : 'Tug',
  '53' : 'Port Tender',
  '54' : 'Anti-pollution equipment',
  '55' : 'Law Enforcement',
  '56' : 'Spare - Local Vessel',
  '57' : 'Spare - Local Vessel',
  '58' : 'Medical Transport',
  '59' : 'Noncombatant ship according to RR Resolution No. 18',
  '60' : 'Passenger, all ships of this type',
  '61' : 'Passenger, Hazardous category A',
  '62' : 'Passenger, Hazardous category B',
  '63' : 'Passenger, Hazardous category C',
  '64' : 'Passenger, Hazardous category D',
  '65' : 'Passenger, Reserved for future use',
  '66' : 'Passenger, Reserved for future use',
  '67' : 'Passenger, Reserved for future use',
  '68' : 'Passenger, Reserved for future use',
  '69' : 'Passenger, No additional information',
  '70' : 'Cargo, all ships of this type',
  '71' : 'Cargo, Hazardous category A',
  '72' : 'Cargo, Hazardous category B',
  '73' : 'Cargo, Hazardous category C',
  '74' : 'Cargo, Hazardous category D',
  '75' : 'Cargo, Reserved for future use',
  '76' : 'Cargo, Reserved for future use',
  '77' : 'Cargo, Reserved for future use',
  '78' : 'Cargo, Reserved for future use',
  '79' : 'Cargo, No additional information',
  '80' : 'Tanker, all ships of this type',
  '81' : 'Tanker, Hazardous category A',
  '82' : 'Tanker, Hazardous category B',
  '83' : 'Tanker, Hazardous category C',
  '84' : 'Tanker, Hazardous category D',
  '85' : 'Tanker, Reserved for future use',
  '86' : 'Tanker, Reserved for future use',
  '87' : 'Tanker, Reserved for future use',
  '88' : 'Tanker, Reserved for future use',
  '89' : 'Tanker, No additional information',
  '90' : 'Other Type, all ships of this type',
  '91' : 'Other Type, Hazardous category A',
  '92' : 'Other Type, Hazardous category B',
  '93' : 'Other Type, Hazardous category C',
  '94' : 'Other Type, Hazardous category D',
  '95' : 'Other Type, Reserved for future use',
  '96' : 'Other Type, Reserved for future use',
  '97' : 'Other Type, Reserved for future use',
  '98' : 'Other Type, Reserved for future use',
  '99' : 'Other Type, no additional information',
}

const MID_TO_COUNTRY = {
  '201','Albania (Republic of)',
  '202','Andorra (Principality of)',
  '203','Austria',
  '204','Azores - Portugal',
  '205','Belgium',
  '206','Belarus (Republic of)',
  '207','Bulgaria (Republic of)',
  '208','Vatican City State',
  '209','Cyprus (Republic of)',
  '210','Cyprus (Republic of)',
  '211','Germany (Federal Republic of)',
  '212','Cyprus (Republic of)',
  '213','Georgia',
  '214','Moldova (Republic of)',
  '215','Malta',
  '216','Armenia (Republic of)',
  '218','Germany (Federal Republic of)',
  '219','Denmark',
  '220','Denmark',
  '224','Spain',
  '225','Spain',
  '226','France',
  '227','France',
  '228','France',
  '229','Malta',
  '230','Finland',
  '231','Faroe Islands - Denmark',
  '232, "United Kingdom of Great Britain and Northern Ireland',
  '233','United Kingdom of Great Britain and Northern Ireland',
  '234','United Kingdom of Great Britain and Northern Ireland',
  '235','United Kingdom of Great Britain and Northern Ireland',
  '236','Gibraltar - United Kingdom of Great Britain and Northern Ireland',
  '237','Greece',
  '238','Croatia (Republic of)',
  '239','Greece',
  '240','Greece',
  '241','Greece',
  '242','Morocco (Kingdom of)',
  '243','Hungary',
  '244','Netherlands (Kingdom of the)',
  '245','Netherlands (Kingdom of the)',
  '246','Netherlands (Kingdom of the)',
  '247','Italy',
  '248','Malta',
  '249','Malta',
  '250','Ireland',
  '251','Iceland',
  '252','Liechtenstein (Principality of)',
  '253','Luxembourg',
  '254','Monaco (Principality of)',
  '255','Madeira - Portugal',
  '256','Malta',
  '257','Norway',
  '258','Norway',
  '259','Norway',
  '261','Poland (Republic of)',
  '262','Montenegro',
  '263','Portugal',
  '264','Romania',
  '265','Sweden',
  '266','Sweden',
  '267','Slovak Republic',
  '268','San Marino (Republic of)',
  '269','Switzerland (Confederation of)',
  '270','Czech Republic',
  '271','Turkey',
  '272','Ukraine',
  '273','Russian Federation',
  '274','The Former Yugoslav Republic of Macedonia',
  '275','Latvia (Republic of)',
  '276','Estonia (Republic of)',
  '277','Lithuania (Republic of)',
  '278','Slovenia (Republic of)',
  '279','Serbia (Republic of)',
  '301','Anguilla - United Kingdom of Great Britain and Northern Ireland',
  '303','Alaska (State of) - United States of America',
  '304','Antigua and Barbuda',
  '305','Antigua and Barbuda',
  '306','Curacao, Sint Maarten, Bonaire, Sint Eustatcius and Saba - Netherlands (Kingdom of the)',
  //	306	Sint Maarten (Dutch part) - Netherlands (Kingdom of the)',
  //	306	Bonaire, Sint Eustatius and Saba - Netherlands (Kingdom of the)',
  '307','Aruba - Netherlands (Kingdom of the)',
  '308','Bahamas (Commonwealth of the)',
  '309','Bahamas (Commonwealth of the)',
  '310','Bermuda - United Kingdom of Great Britain and Northern Ireland',
  '311','Bahamas (Commonwealth of the)',
  '312','Belize',
  '314','Barbados',
  '316','Canada',
  '319','Cayman Islands - United Kingdom of Great Britain and Northern Ireland',
  '321','Costa Rica',
  '323','Cuba',
  '325','Dominica (Commonwealth of)',
  '327','Dominican Republic',
  '329','Guadeloupe (French Department of) - France',
  '330','Grenada',
  '331','Greenland - Denmark',
  '332','Guatemala (Republic of)',
  '334','Honduras (Republic of)',
  '336','Haiti (Republic of)',
  '338','United States of America',
  '339','Jamaica',
  '341','Saint Kitts and Nevis (Federation of)',
  '343','Saint Lucia',
  '345','Mexico',
  '347','Martinique (French Department of) - France',
  '348','Montserrat - United Kingdom of Great Britain and Northern Ireland',
  '350','Nicaragua',
  '351','Panama (Republic of)',
  '352','Panama (Republic of)',
  '353','Panama (Republic of)',
  '354','Panama (Republic of)',
  '355','Puerto Rico - United States of America',
  '356','Puerto Rico - United States of America',
  '357','Puerto Rico - United States of America',
  '358','Puerto Rico - United States of America',
  '359','El Salvador (Republic of)',
  '361','Saint Pierre and Miquelon (Territorial Collectivity of) - France',
  '362','Trinidad and Tobago',
  '364','Turks and Caicos Islands - United Kingdom of Great Britain and Northern Ireland',
  '366','United States of America',
  '367','United States of America',
  '368','United States of America',
  '369','United States of America',
  '370','Panama (Republic of)',
  '371','Panama (Republic of)',
  '372','Panama (Republic of)',
  '373','Panama (Republic of)',
  '375','Saint Vincent and the Grenadines',
  '376','Saint Vincent and the Grenadines',
  '377','Saint Vincent and the Grenadines',
  '378','British Virgin Islands - United Kingdom of Great Britain and Northern Ireland',
  '379','United States Virgin Islands - United States of America',
  '401','Afghanistan',
  '403','Saudi Arabia (Kingdom of)',
  '405','Bangladesh (People\'s Republic of)',
  '408','Bahrain (Kingdom of)',
  '410','Bhutan (Kingdom of)',
  '412','China (People\'s Republic of)',
  '413','China (People\'s Republic of)',
  '414','China (People\'s Republic of)',
  '416','Taiwan (Province of China) - China (People\'s Republic of)',
  '417','Sri Lanka (Democratic Socialist Republic of)',
  '419','India (Republic of)',
  '422','Iran (Islamic Republic of)',
  '423','Azerbaijan (Republic of)',
  '425','Iraq (Republic of)',
  '428','Israel (State of)',
  '431','Japan',
  '432','Japan',
  '434','Turkmenistan',
  '436','Kazakhstan (Republic of)',
  '437','Uzbekistan (Republic of)',
  '438','Jordan (Hashemite Kingdom of)',
  '440','Korea (Republic of)',
  '441','Korea (Republic of)',
  '443','State of Palestine (In accordance with Resolution 99 Rev. Guadalajara, 2010)',
  '445','Democratic People\'s Republic of Korea',
  '447','Kuwait (State of)',
  '450','Lebanon',
  '451','Kyrgyz Republic',
  '453','Macao (Special Administrative Region of China) - China (People\'s Republic of)',
  '455','Maldives (Republic of)',
  '457','Mongolia',
  '459','Nepal (Federal Democratic Republic of)',
  '461','Oman (Sultanate of)',
  '463','Pakistan (Islamic Republic of)',
  '466','Qatar (State of)',
  '468','Syrian Arab Republic',
  '470','United Arab Emirates',
  '472','Tajikistan (Republic of)',
  '473','Yemen (Republic of)',
  '475','Yemen (Republic of)',
  '477','Hong Kong (Special Administrative Region of China) - China (People\'s Republic of)',
  '478','Bosnia and Herzegovina',
  '501','Adelie Land - France',
  '503','Australia',
  '506','Myanmar (Union of)',
  '508','Brunei Darussalam',
  '510','Micronesia (Federated States of)',
  '511','Palau (Republic of)',
  '512','New Zealand',
  '514','Cambodia (Kingdom of)',
  '515','Cambodia (Kingdom of)',
  '516','Christmas Island (Indian Ocean) - Australia',
  '518','Cook Islands - New Zealand',
  '520','Fiji (Republic of)',
  '523','Cocos (Keeling) Islands - Australia',
  '525','Indonesia (Republic of)',
  '529','Kiribati (Republic of)',
  '531','Lao People\'s Democratic Republic',
  '533','Malaysia',
  '536','Northern Mariana Islands (Commonwealth of the) - United States of America',
  '538','Marshall Islands (Republic of the)',
  '540','New Caledonia - France',
  '542','Niue - New Zealand',
  '544','Nauru (Republic of)',
  '546','French Polynesia - France',
  '548','Philippines (Republic of the)',
  '553','Papua New Guinea',
  '555','Pitcairn Island - United Kingdom of Great Britain and Northern Ireland',
  '557','Solomon Islands',
  '559','American Samoa - United States of America',
  '561','Samoa (Independent State of)',
  '563','Singapore (Republic of)',
  '564','Singapore (Republic of)',
  '565','Singapore (Republic of)',
  '566','Singapore (Republic of)',
  '567','Thailand',
  '570','Tonga (Kingdom of)',
  '572','Tuvalu',
  '574','Viet Nam (Socialist Republic of)',
  '576','Vanuatu (Republic of)',
  '577','Vanuatu (Republic of)',
  '578','Wallis and Futuna Islands - France',
  '601','South Africa (Republic of)',
  '603','Angola (Republic of)',
  '605','Algeria (People\'s Democratic Republic of)',
  '607','Saint Paul and Amsterdam Islands - France',
  '608','Ascension Island - United Kingdom of Great Britain and Northern Ireland',
  '609','Burundi (Republic of)',
  '610','Benin (Republic of)',
  '611','Botswana (Republic of)',
  '612','Central African Republic',
  '613','Cameroon (Republic of)',
  '615','Congo (Republic of the)',
  '616','Comoros (Union of the)',
  '617','Cabo Verde (Republic of)',
  '618','Crozet Archipelago - France',
  '619','Côte d\'Ivoire (Republic of)',
  '620','Comoros (Union of the)',
  '621','Djibouti (Republic of)',
  '622','Egypt (Arab Republic of)',
  '624','Ethiopia (Federal Democratic Republic of)',
  '625','Eritrea',
  '626','Gabonese Republic',
  '627','Ghana',
  '629','Gambia (Republic of the)',
  '630','Guinea-Bissau (Republic of)',
  '631','Equatorial Guinea (Republic of)',
  '632','Guinea (Republic of)',
  '633','Burkina Faso',
  '634','Kenya (Republic of)',
  '635','Kerguelen Islands - France',
  '636','Liberia (Republic of)',
  '637','Liberia (Republic of)',
  '638','South Sudan (Republic of)',
  '642','Libya',
  '644','Lesotho (Kingdom of)',
  '645','Mauritius (Republic of)',
  '647','Madagascar (Republic of)',
  '649','Mali (Republic of)',
  '650','Mozambique (Republic of)',
  '654','Mauritania (Islamic Republic of)',
  '655','Malawi',
  '656','Niger (Republic of the)',
  '657','Nigeria (Federal Republic of)',
  '659','Namibia (Republic of)',
  '660','Reunion (French Department of) - France',
  '661','Rwanda (Republic of)',
  '662','Sudan (Republic of the)',
  '663','Senegal (Republic of)',
  '664','Seychelles (Republic of)',
  '665','Saint Helena - United Kingdom of Great Britain and Northern Ireland',
  '666','Somalia (Federal Republic of)',
  '667','Sierra Leone',
  '668','Sao Tome and Principe (Democratic Republic of)',
  '669','Swaziland (Kingdom of)',
  '670','Chad (Republic of)',
  '671','Togolese Republic',
  '672','Tunisia',
  '674','Tanzania (United Republic of)',
  '675','Uganda (Republic of)',
  '676','Democratic Republic of the Congo',
  '677','Tanzania (United Republic of)',
  '678','Zambia (Republic of)',
  '679','Zimbabwe (Republic of)',
  '701','Argentine Republic',
  '710','Brazil (Federative Republic of)',
  '720','Bolivia (Plurinational State of)',
  '725','Chile',
  '730','Colombia (Republic of)',
  '735','Ecuador',
  '740','Falkland Islands (Malvinas) - United Kingdom of Great Britain and Northern Ireland',
  '745','Guiana (French Department of) - France',
  '750','Guyana',
  '755','Paraguay (Republic of)',
  '760','Peru',
  '765','Suriname (Republic of)',
  '770','Uruguay (Eastern Republic of)',
  '775','Venezuela (Bolivarian Republic of)'
}

const AID_TO_NAV = {
  '0' : 'Default, Type of Aid to Navigation not specified',
  '1' : 'Reference point',
  '2' : 'RACON (radar transponder marking a navigation hazard)',
  '3' : 'Fixed structure off shore, such as oil platforms, wind farms,rigs. (Note: This code should identify an obstruction that is fitted with an Aid-to-Navigation AIS station.)',
  '4' : 'Spare, Reserved for future use.',
  '5' : 'Light, without sectors',
  '6' : 'Light, with sectors',
  '7' : 'Leading Light Front',
  '8' : 'Leading Light Rear',
  '9' : 'Beacon, Cardinal N',
  '10 ' : 'Beacon, Cardinal E',
  '11' : 'Beacon, Cardinal S',
  '12' : 'Beacon, Cardinal W',
  '13' : 'Beacon, Port hand',
  '14' : 'Beacon, Starboard hand',
  '15' : 'Beacon, Preferred Channel port hand',
  '16' : 'Beacon, Preferred Channel starboard hand',
  '17' : 'Beacon, Isolated danger',
  '18' : 'Beacon, Safe water',
  '19' : 'Beacon, Special mark',
  '20' : 'Cardinal Mark N',
  '21' : 'Cardinal Mark E',
  '22' : 'Cardinal Mark S',
  '23' : 'Cardinal Mark W',
  '24' : 'Port hand Mark',
  '25' : 'Starboard hand Mark',
  '26' : 'Preferred Channel Port hand',
  '27' : 'Preferred Channel Starboard hand',
  '28' : 'Isolated danger',
  '29' : 'Safe Water',
  '30' : 'Special Mark',
  '31' : 'Light Vessel / LANBY / Rigs' };

const EPFD = {
  '0' : 'Undefined',
  '1' : 'GPS',
  '2' : 'GLONASS',
  '3' : 'Combined GPS/GLONASS',
  '4' : 'Loran-C',
  '5' : 'Chayka',
  '6' : 'Integrated navigation system',
  '7' : 'Surveyed',
  '8' : 'Galileo'
}

const UNITS = {
  'aisType'           : 'number',
  'channel'           : 'string',
  'repeatInd'         : 'number',
  'mmsi'              : 'number',
  'class'             : 'string',
  'latitude'          : 'deg',
  'longitude'         : 'deg',
  'posAccuracy'       : 'boolean',
  'navStatus'         : 'index',
  'navStatusStr'      : 'string',
  'utcYear'           : 'year',
  'utcMonth'          : 'month',
  'utcDay'            : 'day',
  'utcHour'           : 'hour',
  'utcMinute'         : 'min',
  'utcSecond'         : 's',
  'epfd'              : 'index',
  'epfdStr'           : 'string',
  'callSign'          : 'string',
  'name'              : 'string',
  'aisVer'            : 'number',
  'imo'               : 'number',
  'shipType'          : 'index',
  'shipTypeStr'       : 'string',
  'dimToBow'          : 'm',
  'dimToStern'        : 'm',
  'dimToPort'         : 'm',
  'dimToStbrd'        : 'm',
  'etaMonth'          : 'month',
  'etaDay'            : 'day',
  'etaHour'           : 'h',
  'etaMinute'         : 'min',
  'draught'           : 'm',
  'destination'       : 'string',
  'heading'           : 'deg',
  'sogStatus'         : 'string',
  'sog'               : 'kn',
  'cog'               : 'deg',
  'latitude'          : 'deg',
  'longitude'         : 'deg',
  'utcTsSec'          : 's',
  'utcTsStatus'       : 'string',
  'partNo'            : 'number',
  'vendorId'          : 'string',
  'mothershipMmsi'    : 'string',
  'rotStatus'         : 'string',
  'rot'               : 'deg/min',
  'offPosInd'         : 'string',
  'aidType'           : 'index',
  'aidTypeStr'        : 'string',
  'nameExt'           : 'string',
  'midCountry'        : 'string',
  'mmsiType'          : 'string'
 }

let suppValuesValid = false;
let suppValues : SuppValues = {};

export default class AisMessage {
  _valid : Validity;
  _errMsg : string;
  _bitField : AisBitField;
  _aisType : number;
  _mmsi : ?number;
  _channel : string;
  _utcSec : ?number;
  _rot : ?number;
  _sog : ?number;
  _cog : ?number;
  _lat : ?number;
  _lon : ?number;
  _hdg : ?number;

  static fromError(valid : Validity,errMsg : string,aisType : number = 0,channel : string = '') : AisMessage {
    let msg = new AisMessage(aisType,new AisBitField('',0),channel);
    msg.setResult(valid, errMsg);
    return msg;
  }

  static getUnit(field : string) : ?string {
    return UNITS[field];
  }

  getUnit(field : string) : ?string {
    return UNITS[field];
  }

  constructor(aisType : number,bitField : AisBitField, channel : string) {
    this._aisType = aisType;
    this._bitField = bitField;
    this._channel = channel;
    this._valid = 'INVALID';
    this._errMsg = ''
  }

  get supportedValues() : SuppValues {
    if(!suppValuesValid) {
      SUPPORTED_FIELDS.forEach((field)=>{
        let unit = AisMessage.getUnit(field);
        if(unit) {
          suppValues[field] = unit;
        } else {
          console.warn(MOD_NAME + 'field without unit encountered:' + field);
        }});
        suppValuesValid = true;
      }
    return suppValues;
  }

  setResult(valid : Validity,errMsg : string) : void {
    this._valid = valid;
    this._errMsg = errMsg;
  }

  _formatStr(str : string) : string {
    let end = str.indexOf('@');
    if(end > -1) {
      return str.substr(0,end);
    } else {
      return str;
    }
  }

  get valid() : Validity {
    return this._valid;
  }

  get errMsg() : string {
    return this._errMsg;
  }

  get aisType() : number {
    return this._aisType;
  }

  get channel() : string {
    return this._channel;
  }

  get class() : string {
    return '';
  }

  get midCountry() : string {
    let midStr = String(this.mmsi);
    if((this.mmsi > 200000000) && (this.mmsi < 800000000)) {
      return MID_TO_COUNTRY[midStr.substr(0,3)] || ''
    } else {
      switch(midStr.substr(0,2)) {
        case '98':
        case '99':
          return MID_TO_COUNTRY[midStr.substr(2,3)] || ''
      }
      return '';
    }
  }

  get mmsiType() : string {
    let midStr = String(this.mmsi);
    if((midStr.length > 9) || (midStr.length < 6)) {
      return '';
    }

    let firstDigit = 0;
    if(midStr.length === 9) {
      firstDigit = midStr.substr(0,1);
    }
    switch(firstDigit) {
      case '0' : return 'Ship group, coast station, or group of coast stations';
      case '1' : return 'For use by SAR aircraft'
      case '2' :
      case '3' :
      case '4' :
      case '5' :
      case '6' :
      case '7' : return 'Vessel';
      case '8' : return 'Handheld VHF transceiver with DSC and GNSS';
      case '9' :
        switch(midStr.substr(0,2)) {
          case '97':
            switch(midStr.substr(2,1)) {
              case '0': return 'Search and Rescue Transponder'
              case '1': return 'Man overboard DSC and/or AIS Device'
              case '4': return '406 MHz EPIRBs fitted with an AIS Transmitter'
              default: return '';
            }
          case '98': return 'Craft associated with a Parent Ship'
          case '99': return 'Aid to Navigation'
          default: return '';
        }
      default : return '';
    }
  }

  get repeatInd() : number {
    if(this._bitField && (this._bitField.bits >= 8)) {
      return this._bitField.getInt(6,2,true);
    } else {
      return NaN;
    }
  }

  _getMmsi() : number {
    if(this._bitField && (this._bitField.bits >= 38)) {
      return this._bitField.getInt(8,30,true);
    } else {
      return NaN;
    }
  }

  get mmsi() : number {
    if(typeof this._mmsi !== 'number') {
      this._mmsi = this._getMmsi();
    }
    return this._mmsi;
  }

  get aisVer() : number {
    return NaN;
  }

  get imo() : number {
    return NaN;
  }

  get navStatus() : number {
    return NaN;
  }

  get navStatusStr() : string {
    return NAV_STATUS[String(this.navStatus)] || '';
  }

  _getRawRot() : number  {
    return 128;
  }

  get rotStatus() : RotStatus {
    if(typeof this._rot !== 'number') {
      this._rot = this._getRawRot();
    }
    let rot : number = this._rot;
    if(rot === 128) {
      return 'NA';
    }

    if(rot === 0) {
      return 'NONE';
    }

    return (rot > 0) ? 'RIGHT' : 'LEFT';
  }

  get rot() : number {
    if(typeof this._rot !== 'number') {
      this._rot = this._getRawRot();
    }
    let rot : number = this._rot;
    if(Math.abs(rot) < 127) {
      return Math.pow(rot / 4.733,2) * Math.sign(rot) ;
    } else {
      return NaN;
    }
  }

  _getRawHeading() : number {
    return 511;
  }

  get heading() : number {
    if(typeof this._hdg !== 'number') {
      this._hdg = this._getRawHeading();
    }
    return (this._hdg === 511) ? NaN : this._hdg;
  }

  _getRawSog() : number {
    return 1023;
  }

  get sogStatus() : SogStatus {
    if(typeof this._sog !== 'number') {
      this._sog = this._getRawSog();
    }
    let sog : number = this._sog;
    if(sog < 1022) return 'VALID';
    if(sog === 1022) return 'HIGH';
    if(sog === 1023) return 'NA';
    return 'INVALID';
  }

  get sog() : number {
    if(typeof this._sog !== 'number') {
      this._sog = this._getRawSog();
    }
    let sog : number = this._sog;
    if(sog > 1021) {
      return NaN
    } else {
      return (sog / 10);
    }
  }

  _getRawCog() : number {
    return 3600;
  }

  get cog() : number {
    if(typeof this._cog !== 'number') {
      this._cog = this._getRawCog();
    }

  return (this._cog !== 3600) ? (this._cog /  10) : NaN;
  }

  _getRawLat() : number {
    return INVALID_LAT;
  }

  get latitude() : number {
    if(typeof this._lat !== 'number') {
      this._lat = this._getRawLat();
    }
    let lat : number = this._lat;
    return (lat === INVALID_LAT) ? NaN : lat / 600000;
  }

  _getRawLon() : number {
    return INVALID_LON;
  }

  get longitude() : number {
    if(typeof this._lon !== 'number') {
      this._lon = this._getRawLon();
    }
    let lon : number = this._lon;
    return (lon === INVALID_LON) ? NaN : lon / 600000;
  }

  get posAccuracy() : boolean {
    return false;
  }

  get callSign() : string {
    return '';
  }

  get name() : string {
    return '';
  }

  _getUtcSec() : number {
    return 60;
  }

  get utcTsSec() : number {
    if(!(typeof this._utcSec === 'number')) {
      this._utcSec = this._getUtcSec();
    }
    return (this._utcSec < 60) ? this._utcSec : NaN;
  }

  get utcTsStatus() : UtcTsStatus {
    if(!(typeof this._utcSec === 'number')) {
      this._utcSec = this._getUtcSec();
    }
    if(this._utcSec < 60) {
      return 'VALID';
    } else {
      /* 60 if time stamp is not available (default)
       * 61 if positioning system is in manual input mode
       * 62 if Electronic Position Fixing System operates in estimated (dead
            reckoning) mode,
       * 63 if the positioning system is inoperative.
       */
      switch(this._utcSec) {
        case 60:
          return 'NA';
        case 61:
          return 'MANUAL';
        case 62:
          return 'ESTIMATED';
        case 63:
          return 'INOPERATIVE';
        default:
          return 'INVALID';
      }
    }
  }

  get shipType() : number {
    return 0;
  }

  get shipTypeStr() : string {
    return SHIP_TYPE[this.shipType] || '';
  }

  get dimToBow() : number {
    return NaN;
  }

  get dimToStern() : number {
    return NaN;
  }

  get dimToPort() : number {
    return NaN;
  }

  get dimToStbrd() : number {
    return NaN;
  }

  get epfd() : number {
    return 0;
  }

  get epfdStr() : string {
    return EPFD[this.epfd.toString()] || '';
  }

  get etaMonth() : number {
    return NaN;
  }

  get etaDay() : number {
    return NaN;
  }

  get etaHour() : number {
    return NaN;
  }

  get etaMinute() : number {
    return NaN;
  }

  get draught() : number {
    return NaN;
  }

  get destination() : string {
    return '';
  }

  get partNo() : number {
    return NaN;
  }

  get vendorId() : string {
    return '';
  }

  // Type 4 Message
  get utcYear() : number {
    return NaN;
  }

  get utcMonth() : number {
    return NaN;
  }

  get utcDay() : number {
    return NaN;
  }

  get utcHour() : number {
    return NaN;
  }

  get utcMinute() : number {
    return NaN;
  }

  get utcSecond() : number {
    return NaN;
  }

  get aidType() : number {
    return NaN;
  }

  get aidTypeStr() : string {
    return AID_TO_NAV[this.aidType.toString()] || '';
  }

  get nameExt() : string {
    return '';
  }

  get offPosInd() : 'IN_POS' | 'OFF_POS' | 'NA' {
    return 'NA';
  }


}
