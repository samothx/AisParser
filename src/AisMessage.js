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
export type DimStatus = 'VALID' | 'NA' | 'HUGE';

export type ROT = {
  type : 'RIGHT' | 'LEFT' | 'NONE' | 'INVALID';
  speed : number;
}

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
  "201" : ["Albania (Republic of)","AL"],
  "202" : ["Andorra (Principality of)","AD"],
  "203" : ["Austria","AT"],
  "204" : ["Azores - Portugal","PT"],
  "205" : ["Belgium","BE"],
  "206" : ["Belarus (Republic of)","BY"],
  "207" : ["Bulgaria (Republic of)","BG"],
  "208" : ["Vatican City State","VA"],
  "209" : ["Cyprus (Republic of)","CY"],
  "210" : ["Cyprus (Republic of)","CY"],
  "211" : ["Germany (Federal Republic of)","DE"],
  "212" : ["Cyprus (Republic of)","CY"],
  "213" : ["Georgia","GE"],
  "214" : ["Moldova (Republic of)","MD"],
  "215" : ["Malta","MT"],
  "216" : ["Armenia (Republic of)","AM"],
  "218" : ["Germany (Federal Republic of)","DE"],
  "219" : ["Denmark","DK"],
  "220" : ["Denmark","DK"],
  "224" : ["Spain","ES"],
  "225" : ["Spain","ES"],
  "226" : ["France","FR"],
  "227" : ["France","FR"],
  "228" : ["France","FR"],
  "229" : ["Malta","MT"],
  "230" : ["Finland","FI"],
  "231" : ["Faroe Islands - Denmark","FO"],
  "232" : ["United Kingdom of Great Britain and Northern Ireland","GB"],
  "233" : ["United Kingdom of Great Britain and Northern Ireland","GB"],
  "234" : ["United Kingdom of Great Britain and Northern Ireland","GB"],
  "235" : ["United Kingdom of Great Britain and Northern Ireland","GB"],
  "236" : ["Gibraltar - United Kingdom of Great Britain and Northern Ireland","GI"],
  "237" : ["Greece","GR"],
  "238" : ["Croatia (Republic of)","HR"],
  "239" : ["Greece","GR"],
  "240" : ["Greece","GR"],
  "241" : ["Greece","GR"],
  "242" : ["Morocco (Kingdom of)","MA"],
  "243" : ["Hungary","HU"],
  "244" : ["Netherlands (Kingdom of the)","599"],
  "245" : ["Netherlands (Kingdom of the)","599"],
  "246" : ["Netherlands (Kingdom of the)","599"],
  "247" : ["Italy","IT"],
  "248" : ["Malta","MT"],
  "249" : ["Malta","MT"],
  "250" : ["Ireland","IE"],
  "251" : ["Iceland","IS"],
  "252" : ["Liechtenstein (Principality of)","LI"],
  "253" : ["Luxembourg","LU"],
  "254" : ["Monaco (Principality of)","MC"],
  "255" : ["Madeira - Portugal","PT"],
  "256" : ["Malta","MT"],
  "257" : ["Norway","NO"],
  "258" : ["Norway","NO"],
  "259" : ["Norway","NO"],
  "261" : ["Poland (Republic of)","PL"],
  "262" : ["Montenegro","ME"],
  "263" : ["Portugal","PT"],
  "264" : ["Romania","RO"],
  "265" : ["Sweden","SE"],
  "266" : ["Sweden","SE"],
  "267" : ["Slovak Republic","SK"],
  "268" : ["San Marino (Republic of)","SM"],
  "269" : ["Switzerland (Confederation of)","CH"],
  "270" : ["Czech Republic","CZ"],
  "271" : ["Turkey","TR"],
  "272" : ["Ukraine","UA"],
  "273" : ["Russian Federation","RU"],
  "274" : ["The Former Yugoslav Republic of Macedonia","MK"],
  "275" : ["Latvia (Republic of)","LV"],
  "276" : ["Estonia (Republic of)","EE"],
  "277" : ["Lithuania (Republic of)","LT"],
  "278" : ["Slovenia (Republic of)","SI"],
  "279" : ["Serbia (Republic of)","RS"],
  "301" : ["Anguilla - United Kingdom of Great Britain and Northern Ireland","AI"],
  "303" : ["Alaska (State of) - United States of America","US"],
  "304" : ["Antigua and Barbuda","AG"],
  "305" : ["Antigua and Barbuda","AG"],
  "306" : ["Curacao, Sint Maarten, Bonaire, Sint Eustatcius and Saba - Netherlands (Kingdom of the)","NL"],
  "307" : ["Aruba - Netherlands (Kingdom of the)","AW"],
  "308" : ["Bahamas (Commonwealth of the)","BS"],
  "309" : ["Bahamas (Commonwealth of the)","BS"],
  "310" : ["Bermuda - United Kingdom of Great Britain and Northern Ireland","BM"],
  "311" : ["Bahamas (Commonwealth of the)","BS"],
  "312" : ["Belize","BZ"],
  "314" : ["Barbados","BB"],
  "316" : ["Canada","CA"],
  "319" : ["Cayman Islands - United Kingdom of Great Britain and Northern Ireland","KY"],
  "321" : ["Costa Rica","CR"],
  "323" : ["Cuba","CU"],
  "325" : ["Dominica (Commonwealth of)","DM"],
  "327" : ["Dominican Republic","DO"],
  "329" : ["Guadeloupe (French Department of) - France","FR"],
  "330" : ["Grenada","GD"],
  "331" : ["Greenland - Denmark","GL"],
  "332" : ["Guatemala (Republic of)","GT"],
  "334" : ["Honduras (Republic of)","HN"],
  "336" : ["Haiti (Republic of)","HT"],
  "338" : ["United States of America","US"],
  "339" : ["Jamaica","JM"],
  "341" : ["Saint Kitts and Nevis (Federation of)","KN"],
  "343" : ["Saint Lucia","LC"],
  "345" : ["Mexico","MX"],
  "347" : ["Martinique (French Department of) - France","FR"],
  "348" : ["Montserrat - United Kingdom of Great Britain and Northern Ireland","MS"],
  "350" : ["Nicaragua","NI"],
  "351" : ["Panama (Republic of)","PA"],
  "352" : ["Panama (Republic of)","PA"],
  "353" : ["Panama (Republic of)","PA"],
  "354" : ["Panama (Republic of)","PA"],
  "355" : ["Puerto Rico - United States of America","PR"],
  "356" : ["Puerto Rico - United States of America","PR"],
  "357" : ["Puerto Rico - United States of America","PR"],
  "358" : ["Puerto Rico - United States of America","PR"],
  "359" : ["El Salvador (Republic of)","SV"],
  "361" : ["Saint Pierre and Miquelon (Territorial Collectivity of) - France","PM"],
  "362" : ["Trinidad and Tobago","TT"],
  "364" : ["Turks and Caicos Islands - United Kingdom of Great Britain and Northern Ireland","TC"],
  "366" : ["United States of America","US"],
  "367" : ["United States of America","US"],
  "368" : ["United States of America","US"],
  "369" : ["United States of America","US"],
  "370" : ["Panama (Republic of)","PA"],
  "371" : ["Panama (Republic of)","PA"],
  "372" : ["Panama (Republic of)","PA"],
  "373" : ["Panama (Republic of)","PA"],
  "375" : ["Saint Vincent and the Grenadines","VC"],
  "376" : ["Saint Vincent and the Grenadines","VC"],
  "377" : ["Saint Vincent and the Grenadines","VC"],
  "378" : ["British Virgin Islands - United Kingdom of Great Britain and Northern Ireland","VG"],
  "379" : ["United States Virgin Islands - United States of America","VI"],
  "401" : ["Afghanistan","AF"],
  "403" : ["Saudi Arabia (Kingdom of)","SA"],
  "405" : ["Bangladesh (People's Republic of)","BD"],
  "408" : ["Bahrain (Kingdom of)","BH"],
  "410" : ["Bhutan (Kingdom of)","BT"],
  "412" : ["China (People's Republic of)","CN"],
  "413" : ["China (People's Republic of)","CN"],
  "414" : ["China (People's Republic of)","CN"],
  "416" : ["Taiwan (Province of China) - China (People's Republic of)","TW"],
  "417" : ["Sri Lanka (Democratic Socialist Republic of)","LK"],
  "419" : ["India (Republic of)","Territory"],
  "422" : ["Iran (Islamic Republic of)","IR"],
  "423" : ["Azerbaijan (Republic of)","AZ"],
  "425" : ["Iraq (Republic of)","IQ"],
  "428" : ["Israel (State of)","IL"],
  "431" : ["Japan","JP"],
  "432" : ["Japan","JP"],
  "434" : ["Turkmenistan","TM"],
  "436" : ["Kazakhstan (Republic of)","KZ"],
  "437" : ["Uzbekistan (Republic of)","UZ"],
  "438" : ["Jordan (Hashemite Kingdom of)","JO"],
  "440" : ["Korea (Republic of)","KR"],
  "441" : ["Korea (Republic of)","KR"],
  "443" : ["State of Palestine (In accordance with Resolution 99 Rev. Guadalajara, 2010)","PS"],
  "445" : ["Democratic People's Republic of Korea","KP"],
  "447" : ["Kuwait (State of)","KW"],
  "450" : ["Lebanon","LB"],
  "451" : ["Kyrgyz Republic","KG"],
  "453" : ["Macao (Special Administrative Region of China) - China (People's Republic of)","MO"],
  "455" : ["Maldives (Republic of)","MV"],
  "457" : ["Mongolia","MN"],
  "459" : ["Nepal (Federal Democratic Republic of)","NP"],
  "461" : ["Oman (Sultanate of)","OM"],
  "463" : ["Pakistan (Islamic Republic of)","PK"],
  "466" : ["Qatar (State of)","QA"],
  "468" : ["Syrian Arab Republic","SY"],
  "470" : ["United Arab Emirates","AE"],
  "472" : ["Tajikistan (Republic of)","TJ"],
  "473" : ["Yemen (Republic of)","YE"],
  "475" : ["Yemen (Republic of)","YE"],
  "477" : ["Hong Kong (Special Administrative Region of China) - China (People's Republic of)","HK"],
  "478" : ["Bosnia and Herzegovina","BA"],
  "501" : ["Adelie Land - France","FR"],
  "503" : ["Australia","AU"],
  "506" : ["Myanmar (Union of)","MM"],
  "508" : ["Brunei Darussalam","BN"],
  "510" : ["Micronesia (Federated States of)","FM"],
  "511" : ["Palau (Republic of)","PW"],
  "512" : ["New Zealand","NZ"],
  "514" : ["Cambodia (Kingdom of)","KH"],
  "515" : ["Cambodia (Kingdom of)","KH"],
  "516" : ["Christmas Island (Indian Ocean) - Australia","CX"],
  "518" : ["Cook Islands - New Zealand","CK"],
  "520" : ["Fiji (Republic of)","FJ"],
  "523" : ["Cocos (Keeling) Islands - Australia","61"],
  "525" : ["Indonesia (Republic of)","ID"],
  "529" : ["Kiribati (Republic of)","KI"],
  "531" : ["Lao People's Democratic Republic","LA"],
  "533" : ["Malaysia","MY"],
  "536" : ["Northern Mariana Islands (Commonwealth of the) - United States of America","MP"],
  "538" : ["Marshall Islands (Republic of the)","MH"],
  "540" : ["New Caledonia - France","NC"],
  "542" : ["Niue - New Zealand","NU"],
  "544" : ["Nauru (Republic of)","NR"],
  "546" : ["French Polynesia - France","PF"],
  "548" : ["Philippines (Republic of the)","PH"],
  "553" : ["Papua New Guinea","PG"],
  "555" : ["Pitcairn Island - United Kingdom of Great Britain and Northern Ireland","PN"],
  "557" : ["Solomon Islands","SB"],
  "559" : ["American Samoa - United States of America","AS"],
  "561" : ["Samoa (Independent State of)","AS"],
  "563" : ["Singapore (Republic of)","SG"],
  "564" : ["Singapore (Republic of)","SG"],
  "565" : ["Singapore (Republic of)","SG"],
  "566" : ["Singapore (Republic of)","SG"],
  "567" : ["Thailand","TH"],
  "570" : ["Tonga (Kingdom of)","TO"],
  "572" : ["Tuvalu","TV"],
  "574" : ["Viet Nam (Socialist Republic of)","VN"],
  "576" : ["Vanuatu (Republic of)","VU"],
  "577" : ["Vanuatu (Republic of)","VU"],
  "578" : ["Wallis and Futuna Islands - France","WF"],
  "601" : ["South Africa (Republic of)","ZA"],
  "603" : ["Angola (Republic of)","AO"],
  "605" : ["Algeria (People's Democratic Republic of)","DZ"],
  "607" : ["Saint Paul and Amsterdam Islands - France","FR"],
  "608" : ["Ascension Island - United Kingdom of Great Britain and Northern Ireland","GB"],
  "609" : ["Burundi (Republic of)","BI"],
  "610" : ["Benin (Republic of)","BJ"],
  "611" : ["Botswana (Republic of)","BW"],
  "612" : ["Central African Republic","CF"],
  "613" : ["Cameroon (Republic of)","CM"],
  "615" : ["Congo (Republic of the)","CD"],
  "616" : ["Comoros (Union of the)","KM"],
  "617" : ["Cabo Verde (Republic of)","CV"],
  "618" : ["Crozet Archipelago - France","FR"],
  "619" : ["Côte d'Ivoire (Republic of)","CI"],
  "620" : ["Comoros (Union of the)","KM"],
  "621" : ["Djibouti (Republic of)","DJ"],
  "622" : ["Egypt (Arab Republic of)","EG"],
  "624" : ["Ethiopia (Federal Democratic Republic of)","ET"],
  "625" : ["Eritrea","ER"],
  "626" : ["Gabonese Republic","GA"],
  "627" : ["Ghana","GH"],
  "629" : ["Gambia (Republic of the)","GM"],
  "630" : ["Guinea-Bissau (Republic of)","GQ"],
  "631" : ["Equatorial Guinea (Republic of)","GQ"],
  "632" : ["Guinea (Republic of)","GQ"],
  "633" : ["Burkina Faso","BF"],
  "634" : ["Kenya (Republic of)","KE"],
  "635" : ["Kerguelen Islands - France","FR"],
  "636" : ["Liberia (Republic of)","LR"],
  "637" : ["Liberia (Republic of)","LR"],
  "638" : ["South Sudan (Republic of)","SS"],
  "642" : ["Libya","LY"],
  "644" : ["Lesotho (Kingdom of)","LS"],
  "645" : ["Mauritius (Republic of)","MU"],
  "647" : ["Madagascar (Republic of)","MG"],
  "649" : ["Mali (Republic of)","ML"],
  "650" : ["Mozambique (Republic of)","MZ"],
  "654" : ["Mauritania (Islamic Republic of)","MR"],
  "655" : ["Malawi","MW"],
  "656" : ["Niger (Republic of the)","NE"],
  "657" : ["Nigeria (Federal Republic of)","NG"],
  "659" : ["Namibia (Republic of)","NA"],
  "660" : ["Reunion (French Department of) - France","RE"],
  "661" : ["Rwanda (Republic of)","RW"],
  "662" : ["Sudan (Republic of the)","SS"],
  "663" : ["Senegal (Republic of)","SN"],
  "664" : ["Seychelles (Republic of)","SC"],
  "665" : ["Saint Helena - United Kingdom of Great Britain and Northern Ireland","SH"],
  "666" : ["Somalia (Federal Republic of)","SO"],
  "667" : ["Sierra Leone","SL"],
  "668" : ["Sao Tome and Principe (Democratic Republic of)","ST"],
  "669" : ["Swaziland (Kingdom of)","SZ"],
  "670" : ["Chad (Republic of)","TD"],
  "671" : ["Togolese Republic","TG"],
  "672" : ["Tunisia","TN"],
  "674" : ["Tanzania (United Republic of)","TZ"],
  "675" : ["Uganda (Republic of)","UG"],
  "676" : ["Democratic Republic of the Congo","CD"],
  "677" : ["Tanzania (United Republic of)","TZ"],
  "678" : ["Zambia (Republic of)","ZM"],
  "679" : ["Zimbabwe (Republic of)","ZW"],
  "701" : ["Argentine Republic","AR"],
  "710" : ["Brazil (Federative Republic of)","BR"],
  "720" : ["Bolivia (Plurinational State of)","BO"],
  "725" : ["Chile","CL"],
  "730" : ["Colombia (Republic of)","CO"],
  "735" : ["Ecuador","EC"],
  "740" : ["Falkland Islands (Malvinas) - United Kingdom of Great Britain and Northern Ireland","FK"],
  "745" : ["Guiana (French Department of) - France","GY"],
  "750" : ["Guyana","GY"],
  "755" : ["Paraguay (Republic of)","PY"],
  "760" : ["Peru","PE"],
  "765" : ["Suriname (Republic of)","SR"],
  "770" : ["Uruguay (Eastern Republic of)","UY"],
  "775" : ["Venezuela (Bolivarian Republic of)","VE"]
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
  'dimToBowStatus'    : 'string',
  'dimToStern'        : 'm',
  'dimToSternStatus'  : 'string',
  'dimToPort'         : 'm',
  'dimToPortStatus'   : 'string',
  'dimToStbrd'        : 'm',
  'dimToStbrdStatus'  : 'string',
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
  'midCountryIso'     : 'string',
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
  _dimToBow : ?number;
  _dimToStern : ?number;
  _dimToPort : ?number;
  _dimToStbrd : ?number;

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

  getMidCountry(short : boolean = false) : string {
    let midStr = String(this.mmsi);
    let country : Array<string>;
    if((this.mmsi > 200000000) && (this.mmsi < 800000000)) {
      country = MID_TO_COUNTRY[midStr.substr(0,3)];
    } else {
      switch(midStr.substr(0,2)) {
        case '98':
        case '99':
          country = MID_TO_COUNTRY[midStr.substr(2,3)];
      }
    }
    if(country) {
      return short ? country[1] : country[0];
    } else {
      return '';
    }
  }

  get midCountry() : string {
    return this.getMidCountry(false);
  }

  get midCountryIso() : string {
    return this.getMidCountry(true);
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
      case '1' : return 'SAR aircraft'
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

  _getDimToBow() : number {
    return NaN;
  }

  get dimToBowStatus() : DimStatus {
    if(!this._dimToBow) {
      this._dimToBow = this._getDimToBow() || NaN;
    }
    switch(this._dimToBow) {
      case 0: return 'NA'
      case 511: return 'HUGE'
      default: return 'VALID'
    }
  }

  get dimToBow() : number {
    if(!this._dimToBow) {
      this._dimToBow = this._getDimToBow() || NaN;
    }
    if((this._dimToBow === NaN) || (this._dimToBow === 511)) {
      return NaN;
    } else {
      return this._dimToBow;
    }
  }

  _getDimToStern() : number {
    return NaN;
  }

  get dimToSternStatus() : DimStatus {
    if(!this._dimToStern) {
      this._dimToStern = this._getDimToStern() || NaN;
    }
    switch(this._dimToStern) {
      case 0: return 'NA'
      case 511: return 'HUGE'
      default: return 'VALID'
    }
  }

  get dimToStern() : number {
    if(!this._dimToStern) {
      this._dimToStern = this._getDimToStern() || NaN;
    }
    if((this._dimToStern === NaN) || (this._dimToStern === 511)) {
      return NaN;
    } else {
      return this._dimToStern;
    }
  }

  _getDimToPort() : number {
    return NaN;
  }

  get dimToPortStatus() : DimStatus {
    if(!this._dimToPort) {
      this._dimToPort = this._getDimToPort() || NaN;
    }
    switch(this._dimToPort) {
      case 0: return 'NA'
      case 63: return 'HUGE'
      default: return 'VALID'
    }
  }

  get dimToPort() : number {
    if(!this._dimToPort) {
      this._dimToPort = this._getDimToPort() || NaN;
    }
    if((this._dimToPort === NaN) || (this._dimToPort === 63)) {
      return NaN;
    } else {
      return this._dimToPort;
    }
  }

  _getDimToStbrd() : number {
    return NaN;
  }

  get dimToStbrdStatus() : DimStatus {
    if(!this._dimToStbrd) {
      this._dimToStbrd = this._getDimToStbrd() || NaN;
    }
    switch(this._dimToStbrd) {
      case 0: return 'NA'
      case 63: return 'HUGE'
      default: return 'VALID'
    }
  }

  get dimToStbrd() : number {
    if(!this._dimToStbrd) {
      this._dimToStbrd = this._getDimToStbrd() || NaN;
    }
    if((this._dimToStbrd === NaN) || (this._dimToStbrd === 63)) {
      return NaN;
    } else {
      return this._dimToStbrd;
    }
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
