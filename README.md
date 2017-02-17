# AisParser
A Parser for NMEA0183  AIS messages.
The parser is written using flow. It is transpiled on install to the lib directory.
The Parser needs to keep a context to ber able to process multi line messages therefore it is implemented as a class.
The class mainly holds the context for the parse function.

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
