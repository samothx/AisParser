
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

var AisParser = require('../index');

var parser = new AisParser({ checksum : true });

var sentences = [
  '!AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74',
  '!AIVDM,1,1,,B,34hwN60Oh3rCwib56`qJtbL<0000,0*12',
  '!AIVDM,1,1,,B,15TPq@0Oj0rClEv53P9HWVn<283C,0*51',
  '!AIVDO,1,1,,,B39i>1000nTu;gQAlBj:wwS5kP06,0*5D',
  '!AIVDM,1,1,,A,35SrP>5P00rCQAL5:KA8<wv:0000,0*5D',
  '!AIVDM,1,1,,A,15NMBi;P00rCfhb58C4sLgv<20SG,0*42',
  '$GPVTG,222.30,T,,M,0.30,N,0.6,K,A*09',
  '!AIVDM,1,1,,B,14`a`N001WrD12J4sMnWpV8l2<4`,0*0D',
  '!AIVDM,1,1,,B,15?P>b0000rCgTH58DU6KpJj0`0>,0*37',
  '!AIVDO,1,1,,,B39i>1001FTu;bQAlAMscwe5kP06,0*3E',
  '!AIVDM,1,1,,B,15Bs:H8001JCUE852dB<FP1p2PSe,0*54',
  '!AIVDM,1,1,,B,3DSegB1uh2rCs6b54VuG417b0000,0*7C'
]

sentences.forEach(function(sentence) {
  var result = parser.parse(sentence);
  switch(result.valid) {
    case 'VALID':
      console.log('values for message:' + sentence);
      try {
        var suppValues = result.supportedValues;
        for(field in suppValues) {
          console.log(' ' + field + ':' + result[field] +
                      ' / ' + suppValues[field]);
        }
      } catch(error) {
          console.log('parsing failed for' + sentence +
                      ' error:' + error);
      }
      break;
    case 'UNSUPPORTED':
      console.log('unsupported message :' + sentence);
      console.log('error message: :' + result.errMsg);
      break;
    case 'INVALID':
      console.log('invalid message :' + sentence);
      console.log('error message: :' + result.errMsg);
      break;
    case 'INCOMPLETE':
      console.log('incomplete message, waiting for more');
      break;
    }
  });
