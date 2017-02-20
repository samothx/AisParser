# List of Parameters supported by AisParser

| Parameter | Type | Description          |Values      | Messages |
|:----------|:-----|:---------------------|:-----------|:---------|
|valid|string|Validity of the result|VALID, INVALID, UNSUPPORTED, INCOMPLETE|all|
|aisType|number|The message number of the AIS Message| 1-5, 18, 19, 21, or 24|all|
|channel|string|The VHF channel the message was Transmitted on |A,B or empty |all|
|repeatInd|number|Wether or not / how this message should be rebroadcasted | 0,1,2,3 |all|
|mmsi|number|Maritime Mobile Service Identity |9 digit number|all|
|midCountry|string|Country extracted from the MMSI|The Country or empty|all|
|midCountryIso|string|ISO String of the Country extracted from the MMSI|The ISO String or empty|all|
|mmsiType|string|The Type of Target extracted from the MMSI|Target type or empty|all|
|class |string|The Class of AIS Device | A, B empty | all |
|latitude| deg |The latitude of the Sender | -90-90 |1, 2, 3, 4, 18, 19|
|longitude| deg |The longitude of the Sender | -180-180 |1, 2, 3, 4, 18, 19|
|posAccuracy|boolean|Position Accuracy, true = DGPS Quality < 10m, false >10m|true,false|1, 2, 3, 4, 18, 19|
|navStatus|index|Navigational Status of AIS Target|0-15|1,2,3|
|navStatusStr|string|A String associated with Nav Status|-|1,2,3|
|utcYear|year|Message Type 4 Base Station Time Reference|1-999, 0=N/A|4|
|utcMonth|month|Message Type 4 Base Station Time Reference|1-12, 0=N/A|4|
|utcDay|day|Message Type 4 Base Station Time Reference|1-31, 0=N/A|4|
|utcHour|h|Message Type 4 Base Station Time Reference|0-23, 24 = N/A|4|
|utcMinute|min|Message Type 4 Base Station Time Reference|0-59, 60=N/A|4|
|utcSecond|s|Message Type 4 Base Station Time Reference|0-59, 60=N/A|4|
|epfd|index|EPFD Fix Type|0-8, 0=N/A|4,5,19|
|epfdStr|string|A String associated with EPFD index|-|4,5,19|
|callSign|string|Callsign of the AIS Target|7 Characters|5,24|
|name|string|AIS Targets Name|20 Characters|5,24|
|aisVer|number|0=ITU1371, 1-3=future editions|0-3|5|
|imo|number|IMO Registration Number|9 Digits|5|
|shipType|index|Ship Type & Cargo||5,19.24|
|shipTypeStr|string|A String associated with Ship Type & Cargo|-|5, 19, 24|
|dimToBow|m|Distance of the GPS Receiverfrom the Bow|1-510|5, 19, 21, 24|
|dimToBowStatus|string|Status of DimToBow, HUGE > 511|VALID, NA, HUGE|5, 19, 21, 24|
|dimToStern|m|Distance of the GPS Receiverfrom the Stern|1-510|5, 19, 21, 24|
|dimToSternStatus|string|Status of DimToStern, HUGE > 511|VALID, NA, HUGE|5, 19, 21, 24|
|dimToStbrd|m|Distance of the GPS Receiverfrom the Stardboard Side|1-62|5, 19, 21, 24|
|dimToStbrdStatus|string|Status of DimToStbrd, HUGE > 63|VALID, NA, HUGE|5, 19, 21, 24|
|dimToPort|m|Distance of the GPS Receiverfrom the Port Side|1-62|5, 19, 21, 24|
|dimToPortStatus|string|Status of DimToPort, HUGE > 63|VALID, NA, HUGE|5, 19, 21, 24|
|etaMonth|month|UTC Month of ETA at Destination|1-12 0=N/A|5|
|etaDay|day|UTC day of ETA at Destination|1-3 10=N/A|5|
|etaHour|h|UTC Hour of ETA at Destination|0-59 60=N/A|5|
|etaMinute|min|UTC Minute of ETA at Destination|0=N/A 0-59|5|
|destination|string|Destination of Vessel|-|5|
|draught|m|Draught of Target|-|5|
|heading|deg|True Heading of Target|0-359|1, 2, 3, 18, 19|
|sog|kn|Speed over Ground|0-102.1|1, 2, 3, 18, 19|
|sogStatus|string|Status of Speed over Ground, if status is VALID, then sog contains the Speed |VALID,HIGH,NA|1, 2, 3, 18, 19|
|cog|deg|Course over Ground|0-359|1, 2, 3, 18, 19|
|utcTsSec|s|Seconds of UTC Time|0-59|1, 2, 3, 18, 19|
|utcTsStatus|string|Status of the utcTsSec Paramerter|NA,  MANUAL, ESTIMATED, INOPERATIVE or INVALID|1, 2, 3, 18, 19|
|vendorId|string|Vendor Name of the AIS equipment|-|24|
|mothershipMmsi|string|MMSI of Mothership|9 Digit Number|24|
|rot|deg/min|Rate of Turn|-126-126|1, 2, 3|
|rotStatus|string|Status of Rate of Turn|'NONE, RIGHT, LEFT, NA|1,2,3|
|offPosInd|string|Off Position indicator for Aid to Navigation|IN_POS, OFF_POS, NA|21|
|aidType|index|Type of the Aid to Navigation|0-31|21|
|aidTypeStr|string|A String associated with the aidType|-|21|
|nameExt|string|Name Extension for Aid to Navigation|-|21|
