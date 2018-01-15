# AisParser
A Parser for NMEA0183  AIS messages.

## Installation
The parser is written using [flow](https://flowtype.org/). It can be run from the src directory with babel-node or in the transpiled version from the index.js file or the lib directory. If you are using the NPM package ( add "aisparser" :">=0.0.12" to your package.json dependencies) you do not have to worry about transpiling, it has been done for you allready. If you are using the github package you will need to take care of transpiling by calling the following commands:
```
cd <package-dir>
npm install
npm run-script transpile
```

## How it works
The modules approach to parsing AIS messages is 'on demand'. A message is merely stored and some basic checks are done by the **parse** function. When data is requested only as much of the message is parsed as is needed to decode the requested data. For instance when the aisType is read only one byte of the message is actually translated and parsed. So it makes sense to only read the values that are really needed. Although some common values are cached in the result object once they have been requested, most values are not - meaning that they are parsed every time they are requested.

The Module parses AIS messages of types 1,2,3.4.5,18,19,21 and 24. These are the common message types, most other types are related to inter vessel or vessel to shore communication.

Although the parser has been thoroughly checked against AIS logs from AISHub and AIS recordings from the Panama Canal, the author takes no responsibility for the correctness of returned values. Please always keep a good watch and an eye on the traffic while commanding a vessel.

The result object obtained from the parse function has a variable **supportedValues** which returns an object containing the field names that can be retrieved from the result object associated with their type or unit. The list may look something like this:
```json
{
  "aisType" : "number",
  "mmsi" : "number",
  "name" : "string",
  "longitude" : "deg",
  "latitude" : "deg",
  "sog" : "kn"
  ...
}
```
The list is specific to the message type, it lists values that may be present in the message. Retrieving the values may still return NaN or "" values, if the value is set to empty or undefined in the actual message.

The instance variables of the result object are implemented as getter functions: The parsing is done while the instance variables are accessed and they can throw exceptions when parsing fails. This should only happen when maformed (too short) messages are being processed. Having the checksum checked should make sure that this does not happen as long as the device producing the messages does not emmit faulty messages. Otherwise use a try catch block around the data retrieval to catch parse exceptions.   

## API

### Constructor
```new AisParser(options)```

Create a parser object, the parameter options can be omitted.
When supplied currently only one parameter ```checksum``` of type boolean is supported. If checksum is set to true AIS checksums are checked prior to parsing a message.

#### Example:
```var parser = new AisParser({ checksum : true })```

### Function checksumValid(message)
checksumValid is a static function of the module, it calculates and compares the checksum and returns true if the value matches or false if not. The function also does some basic checks and returns false if the message is obviously not valid otherwise.

#### Parameters
The function takes one string parameter:
- The AIS message.


#### Example:
```var msgOk = AisParser.checksumValid('!AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74')```

### Function parse(message,options)
The Function takes two parameters:
- The parameter message supplies the NMEA0183 AIS message to be parsed.
- The second parameter can be left out. It has the same content as the constructors option parameter. When given it overrides the options given in the constructor.

#### Return Value
The function returns a result object that can be used to retrieve the status of the parse process and the messages values when parsing was successful.

### Function parseArray(array)
The function takes a preprocessed message as parameter. The array can be derived from the original message by splitting the
the message (eg. using message.split(',')) and is targeted at environments where NMEA0183 messages have already preprocessed handing them to the AIS parser. This function does not compute a checksum.

#### Return Value
The function returns a result object that can be used to retrieve the status of the parse process and the messages values when parsing was successful.

### The Result Object
The result object contains the semi parsed message and a status of the parse process. Before reading any other values the **valid** instance variable must be read. It contains the status as a string and can be either of
- **VALID** - the message is valid and complete and further values can be read.
- **INVALID** - the message could not be parsed. Further information can be optained by reading the **errMsg** variable.
- **UNSUPPORTED** - the message was either of unsupported aisType or not an AIS message. Further information can be optained by reading the **errMsg** variable.
- **INCOMPLETE** - the message is part of a sequence of messages. Only when the last message of the sequence has been parsed will results be returned.

Generally all possible values can be queried on a valid or invalid result object. Numerical values will result in **NaN**, string values in the **empty string** when not part of the message. Only available values will actually be parsed. If errors occurr during parsing you will receive an exception, so it is important to secure the reading code with a try catch block.

The **supportedValues** variable supplies a dictionary of strings that contains the variable names that are supported by the parsed message associated with their type or unit.

The function ***getUnit(fieldName)*** returns the type of value for a field.
For numeric values following return values are possible:
- 'number' - a plain number.
- 'index' - an index into a list or enum. These values often have an accompanying field to get the string associated with the numberic value eg. epfd -> index, epfdStr returns the string.
- 'string' - a string value.
- unit - a unit name like 'm', 'deg','rad'.


The following variables are available for all message types:
 - ***aisType*** - the ais message type.
 - ***channel*** - the channel on which the message was sent, either 'A', 'B' or ''.
 - ***repeatInd*** - The Repeat Indicator is a directive to an AIS transceiver that this
message should be rebroadcast.
 - ***mmsi*** - the Maritime Mobile Service Identity.

A complete list of parameters can be found in SupportedValues.md.

## Testing

You will find the files scanFile.js and testdata.tgz in the test directory.
When AisParser is installed via 'npm install' it can be run with babel-node.

```shell
tar -xzf testdata.tgz
babel-node scanFile.js output.txt output.csv output.fail plain
```

The command will scan the file output1000.txt print all errors to the screen. There will plenty of errors because the file contains about 1000 NMEA messages from the Panama Canal which are not all AIS messages- There are also several unsupported AIS messages in the file. With all supplied test files all errors should be of type UNSUPPORTED and refer to message types other than 1,2,3,4,5,18,19,21,24.
After executing the command the file output1000.csv should contain comma separated values data with the content of the parsed messages. It can be opened with excel or Libreoffice Calc. The file output1000.fail will contain all failed AIS messages.
The last parameter delivers the type of data to be read. When set to sigk it will try to parse a format delivered by the signalk-node-server that puts a timestamp and a source tag in front of every line.  

## Usage: (as in samples/Sample.js)
```javascript
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
```
