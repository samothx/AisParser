# AisParser
A Parser for NMEA0183  AIS messages.
The parser is written using [flow](https://flowtype.org/). It can be run from the src directory with babel-node or in the transpiled version from the index.js file or the lib directory. The code should get transpiled into the lib diretory at install (I am working on that currently). Otherwise it can be transpiled calling
```
npm install
npm run-script prepublish
```
The modules approach to parsing AIS messages is 'on demand'. A message is merely stored and only parsed partially when data is requested. For instance when the aisType is read only one byte of the message is actually translated and parsed. So it makes sense to only read the values that are really needed. Although some common values are cached in the result object once they have been requested, most values are not - meaning that they are parsed every time they are requested.

The Module parses AIS messages of types 1,2,3.4.5,18,19,21 and 24. These are the common message types, most other types are related to inter vessel or vessel to shore communication.

The author takes no responsability for the correctnes of returned values. Please always keep a good watch and an eye on the traffic while commanding a vessel.

The result object obtained from the parse function has a variable **supportedValues** which returns an array of valid field names that can be retrieved from the result object.
The instance variables of the result object are actually implemented as getter functions: The parsing is done while using these instance variables are accessed and they can throw exceptions when parsing fails. Therefore it is important to use a try catch block around the data retrieval to catch parse exceptions.   

## API

### Constructor
```new AisParser(options)```

Create a parser object, the parameter options can be omitted.
When supplied currently only one parameter ```checksum``` of type boolean is supported. If checksum is set to true AIS checksums are checked prior to parsing a message.

#### Example:
```var parser = new AisParser({ checksum : true })```

### Function checksumValid(message)
The function calculates and compares the checksum and returns true if the value matches or false if not. The function also does some basic checks and returns false if the message is obviously not valid.

#### Parameters
The function takes one string parameter:
- The AIS message.


#### Example:
```var msgOk = parser.checksumValid('!AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74')```

### Function parse(message,options)
The Function takes two parameters:
- The parameter message supplies the AIS message to be parsed.
- The second parameter can be left out. It has thesame content as the constructors option parameter the values given there.

#### Return Value
The function returns a result object that can be used to retrieve the status of the parse process and the messages values when parsing was successful.

### The Result Object
The result object contains the semi parsed message and a status of the parse process. Before reading any other values the **valid** instance variable must be read. It contains the status as a string and can be either of
- **VALID** - the message is valid and complete and further values can be read.
- **INVALID** - the message could not be parsed. Further information can be optained by reading the **errMsg** variable.
- **UNSUPPORTED** - the message was either of unsupported aisType or not an AIS message. Further information can be optained by reading the **errMsg** variable.
- **INCOMPLETE** - the message is part of a sequence of messages. Only when the last message of the sequence has been parsed will results be returned.

Generally all possible values can be queried on a valid or invalid result object. Numerical values will result in **NaN** string values in the **empty string** when not part of the message. Only available values will actually be parsed. If errors occurr during parsing you will receive an exception, so it is important to secure the reading code with a try catch block.

The **supportedValues** variable supplies an array of strings that contains the variable names that are supported by the parsed message.

The function ***getUnit(fieldName)*** returns the type of value for a field.
For numeric values following return values are possible:
- 'number' - a plain number.
- 'index' - an index into a list or enum. These values often have an accompanying field to get the string associated with the numberic value eg. epfd -> index, epfdStr returns the string.
- unit - a unit name like 'm', 'deg','rad'.
For strings the value 'string' is returned

The following variables are available for all message types:
 - ***aisType*** - the ais message type.
 - ***channel*** - the channel on which the message was sent, either 'A', 'B' or '-'.
 - ***repeatInd*** - The Repeat Indicator is a directive to an AIS transceiver that this
message should be rebroadcast.
 - ***mmsi*** - the Maritime Mobile Service Identity.


## Testing


## Usage: (as in samples/Sample.js)
```javascript
var AisParser = require('AisParser');
var parser = new AisParser({ checksum : true });

var sentences = [
  '!AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74',
  '$GPVTG,222.30,T,,M,0.30,N,0.6,K,A*09',
  '!AIVDM,1,1,,B,14`a`N001WrD12J4sMnWpV8l2<4`,0*0D',
  '!AIVDM,1,1,,B,15Bs:H8001JCUE852dB<FP1p2PSe,0*54',
  '!AIVDM,1,1,,B,3DSegB1uh2rCs6b54VuG417b0000,0*7C'
]

sentences.forEach(function(sentence) {
  var result = parser.parse(sentence);
  switch(result.valid) {
    case 'VALID':
      console.log('values for message:' + sentence);
      try {
        result.supportedValues.forEach(
          function(field) {
            console.log(' ' + field + ':' + result[field] +
                      ' / ' + result.getUnit(field));
          });
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
      console.log('incomlete message, waiting for more');
      break;
    }
  });
```
