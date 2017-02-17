# AisParser
A Parser for NMEA0183  AIS messages.
The parser is written using [flow](https://flowtype.org/). It can be run from the src directory with babel-node or in the transpiled version from the lib directory. The code should get transpiled in install (I am working on that currently) otherwise it can be transpiled calling ```npm install``` and ```npm run-script prepublish```.

Usage:
```javascript
var AisParser = require('AisParser');

var parser = new AisParser({ checksum : true });

...
while(data.available) {
  var sentence = data.nextsentence();
  var result = parser.parse(sentence);
  switch(result.valid) {
    case 'VALID':
      console.log('values for message:' + sentence);
      result.supportedValues.forEach(
        function(field) {
          console.log(' ' + field + ':' + result[field] +
                      ' ' + result.getUnit(field));
        });
      break;
    case 'UNSUPPORTED':
      console.log('unsupported message :' + sentence);
      console.log('errror message: :' + result.errMsg);
      break;
    case 'INVALID':
      console.log('invalid message :' + sentence);
      console.log('errror message: :' + result.errMsg);
      break;
    case 'INCOMPLETE':
      console.log('incomlete message, waiting for more');
      break;
    }  
  }
```
Test:
