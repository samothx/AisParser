import RandSeed from "random-seed"

const AIS_OUT_CHR_TBL: Array<string> = [
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
    ' ', '!', '\'', '#', '$', '%', '&', '"', '(', ')', '*', '+', ',', '-', '.', '/',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?']

const AIS_IN_CHR_TBL: Array<string> = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
    '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
    'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g',
    'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w']


export type TestData = {
    aisStr: string,
    padBits: number,
    bits: number,
    start: number,
    numBits: number
}

export type RealData = {
    aisStr: string,
    channel : string,
    aisType : number,
    valid : boolean
}

const AIS_REAL_DATA : Array<any> = [
    {   aisStr : '!AIVDM,1,1,,B,14`c;d002grD>PH50hr7RVE000SG,0*74',
        channel : 'B',
        aisType : 1,
        valid: true },
    {   aisStr : '!AIVDM,1,1,,B,34hwN60Oh3rCwib56`qJtbL<0000,0*12',
        channel : 'B',
        aisType : 3,
        valid: true }
]

/*

!AIVDM,1,1,,B,34hwN60Oh3rCwib56`qJtbL<0000,0*12
!AIVDM,1,1,,B,15TPq@0Oj0rClEv53P9HWVn<283C,0*51
!AIVDO,1,1,,,B39i>1000nTu;gQAlBj:wwS5kP06,0*5D
!AIVDM,1,1,,A,35SrP>5P00rCQAL5:KA8<wv:0000,0*5D
!AIVDM,1,1,,A,15NMBi;P00rCfhb58C4sLgv<20SG,0*42
!AIVDM,1,1,,B,14`a`N001WrD12J4sMnWpV8l2<4`,0*0D
!AIVDM,1,1,,B,15?P>b0000rCgTH58DU6KpJj0`0>,0*37
!AIVDO,1,1,,,B39i>1001FTu;bQAlAMscwe5kP06,0*3E
!AIVDM,1,1,,B,15Bs:H8001JCUE852dB<FP1p2PSe,0*54
!AIVDM,1,1,,B,3DSegB1uh2rCs6b54VuG417b0000,0*7C
!AIVDM,1,1,,B,15QK90?000JCkvP52fOj`Sep0l3r,0*06
!AIVDM,1,1,,A,15TPmF5PAsrCjhT539T8rWGj28Q8,0*05
!AIVDM,1,1,,A,11aucipP02rD0u056SAIawwj20Rw,0*2D
!AIVDM,2,1,6,A,58J>2p42@0D7UKSOCR1A84q<<Dp@Dr1@TlF22216BpM8D4w:0F40CPC@H888,0*23
!AIVDM,2,2,6,A,88888888880,2*22
!AIVDO,1,1,,,B39i>10006Tu;PQAl?uoWwUUkP06,0*43
!AIVDM,1,1,,A,15AfoT?002rCpob54FmCFP@H2<4C,0*71
!AIVDM,1,1,,B,15ATk20001JCqnl54fmTt1:@0<0l,0*27
!AIVDM,1,1,,B,15>kSB8P00rC``<59josGOvF2@6b,0*64
!AIVDM,1,1,,B,15RovJ0P02rCttP56n@Db?vH26C8,0*56
!AIVDM,1,1,,B,803Iu6PF1d=h0a@QAa>E;@30JcCsivKTvtOVq?g7q0`1wwqLD0,4*20
!AIVDO,1,1,,,B39i>10006Tu;PQAl?tTowV5kP06,0*22
!AIVDM,1,1,,B,3E>o=b?P2KJB;NP5FMrmAwv80000,0*3F
!AIVDM,1,1,,A,15D>NJ0000rCoub53sq5tPRF2D3v,0*27
!AIVDM,1,1,,B,14hwN60Oh1rCwh`56`tK>02H00Rs,0*26
!AIVDM,1,1,,A,35@Cc`0001rCP585:OBenrjF001S,0*78
!AIVDM,1,1,,A,18157t0OhSrCv?B53PHt;bnJ00Sb,0*30
!AIVDM,1,1,,B,1000Fo@P01rCuDL56cMMegvH0@7E,0*0E
!AIVDO,1,1,,,B39i>1000FTu;PQAl?tMKwVUkP06,0*0F
!AIVDM,1,1,,B,15`OGN?01lrDhFP51=hdS:2J287a,0*65
!AIVDO,1,1,,,B39i>1000VTu;PQAl?tM7wW5kP06,0*02
!AIVDM,1,1,,B,109t5aW000rCi@v57foqoP4L2H8;,0*70
!AIVDM,1,1,,A,A03IupkAC4:dH0v9WJhP1cF6nud@NrP5wH5T,0*23
!AIVDM,1,1,,A,15R=@2:P01rCTfL52hhJmgvL20SV,0*61
!AIVDM,1,1,,B,15QDvN0P00rC`Rf59jOQlOvJ2H8D,0*68
!AIVDM,1,1,,B,35AbuT1P01rD1at55VqDWwvL0000,0*2A
!AIVDO,1,1,,,B39i>1000nTu;Q1Al@0RswWUkP06,0*5B
!AIVDM,1,1,,B,15?Jc<0004rCswh537mTlVLL088b,0*32
!AIVDM,1,1,,A,15TPq@0PB1rCkS:53HqHeVlN2<4L,0*27
!AIVDM,1,1,,A,15?P>b0000rCgTd58DU6KpJL0PRR,0*00
!AIVDM,1,1,,A,15TPmF5OisrCjR8537v8woNN2H8k,0*12
!AIVDM,1,1,,A,14`a`N001VrD0jt4sHdWm68P2@8v,0*40
!AIVDM,1,1,,A,15NQaV?P01rCu1456IlbTOvP2<4a,0*07
!AIVDM,1,1,,B,H5>gpV0@tp60hT<60T000000000,2*35
!AIVDM,1,1,,B,3E>o=b?P2KJB;NP5FMrmAwv80000,0*3F
!AIVDO,1,1,,,B39i>1000nTu;Q1Al@0T?w`5kP06,0*46
!AIVDM,1,1,,B,13aA<h0028rD:D051Tbv200R0H9?,0*7B
!AIVDM,1,1,,B,15QDCP0P?w<tSF0l4Q@>4?wp00Rk,0*20
!AIVDM,1,1,,A,15Bs:H8001JCUDh52dD<FP1p2PT;,0*59
!AIVDM,2,1,7,B,55@Cc`42AgeuADNU1410E5DDpT0000000000000l1p<755H<0<Q2@@S3h000,0*5A
!AIVDM,2,2,7,B,00000000000,2*20
!AIVDM,2,1,8,B,5C=7Wv02<o<WTP8sL010u9B0E=@u8Th000000016D@LE;4vjNMhlRDm3hPC0,0*11
!AIVDM,2,2,8,B,00000000000,2*2F
!AIVDM,1,1,,A,15QdFT?P04rCui<54lID@gvN00RH,0*1A
!AIVDM,1,1,,B,35T;Uv1001rD>KT54o0LCSVP2Dnb,0*06
!AIVDM,1,1,,A,35RK:b1000rCqh@540@8Q06N0000,0*58
!AIVDM,1,1,,A,1ENQkw0000rB13v5G4hpoQ2F0000,0*01
!AIVDM,2,1,9,B,55ADDF2h=<`0PvoC;OHntr0@T4ltpB18UHE:22165h55<75c07PPC0ShH1F4,0*5F
!AIVDM,2,2,9,B,33ljEQH8880,2*4C
!AIVDM,1,1,,A,11aucipP02rD0t`56SAaq?vR2@9m,0*34
!AIVDM,1,1,,A,14`WDl?000JCi:J57nTo8IbR0D0`,0*11
!AIVDO,1,1,,,B39i>10016Tu;QQAl@4LWw`UkP06,0*6B
!AIVDM,1,1,,A,39NS<DA001rCsSB52aw5MkpR2Drr,0*3C
!AIVDM,1,1,,B,14`c;d002hrD=rp50Mi7RVDL089u,0*71
!AIVDM,1,1,,B,15QK90?000JCkvf52fR2`Sbv0h9w,0*7F
!AIVDM,1,1,,A,3Ca<Ov5000rBBw`5G?wldb>D0000,0*78
!AIVDM,1,1,,B,15NMBi;P00rCfh<58C3s??vT2D4J,0*45
!AIVDM,1,1,,B,H5>gpV4m71B=9>08@pqjh00P9220,0*12
!AIVDM,1,1,,A,15NK0G0P01rCl6F57Am9jgvR08:>,0*2E
!AIVDM,1,1,,B,15RcEl001cJCshH4u=u0bPbL0<2B,0*68
!AIVDO,1,1,,,B39i>1000nTu;I1Al>tgOwi5kP06,0*2E
!AIVDM,1,1,,A,1775gb0000rCaut59P?PB9o405pT,0*44
!AIVDM,1,1,,B,35BDU`0PAurCL1L5:oS4sSc400uQ,0*10
!AIVDM,1,1,,A,15R=@2:P00rCplb53r6sU?w625pT,0*23
!AIVDM,1,1,,B,15>uP00P0grCWsb59gOLG?w420Sa,0*29
!AIVDM,1,1,,B,15`OGN?Oh2rCww456Rqa8hO62@DA,0*37
!AIVDM,1,1,,A,15QdFT?P00JCr7454CD2eww40D3H,0*78
!AIVDO,1,1,,,B39i>1000nTu;IQAl?0cowiUkP06,0*4F
!AIVDM,1,1,,B,14a1Eb01hErCdBj59;:<Aaw408DJ,0*52
!AIVDM,1,1,,A,34hwN60Oh4rCwjv56`ul<i?60000,0*19
!AIVDM,1,1,,B,109t5aW000rCi@v57fm8Cs=620R>,0*50
!AIVDM,2,1,4,B,A03IupkAC4:dH0N97cep6Oi30EDOw3?v6ASsQ09C4goA03d<vjh2Diooigtd,0*1E
!AIVDM,2,2,4,B,5Op0w1T>wG<0>QKtqh0c,0*21
!AIVDM,1,1,,B,15QDCP0P?w<tSF0l4Q@>4?wp073h,0*45
!AIVDM,1,1,,A,3EU`;h?P1PJCnA053<;e:gvp2000,0*13
!AIVDM,1,1,,A,35TPq@0000rCfV457oNQ?GG625hS,0*67
!AIVDM,1,1,,A,15NQaV?P@LrCdv0591FdV:U82@Dd,0*36
!AIVDO,1,1,,,B39i>1000nTu;J1Al?4b3wj5kP06,0*16
!AIVDM,1,1,,B,8H152bPF0P000000000004QFADh000000>hi20000h0,2*5E
!AIVDM,1,1,,B,15D>NJ0000rCp7253rwpU09625pT,0*21
!AIVDM,1,1,,A,15RVtT0P00rCl9>533ES@gw82<1R,0*1A
!AIVDM,2,1,5,B,5INWsv@2>aG<7PmSB20<520M8DLu9V2222222217HA6;E4wG0J@k5PD?T0@S,0*2B
!AIVDM,2,2,5,B,0`888888880,2*72
!AIVDM,1,1,,A,15Bs:H8001JCpnv53qwkTP1p2hEA,0*79
!AIVDM,1,1,,A,15SNCR8P0eJC`B<59cRtU?w625pT,0*45
!AIVDM,1,1,,B,15QK90?000JD1;D54SlAfh5p0Up@,0*1C
!AIVDO,1,1,,,B39i>10016Tu;JQAl?4UgwjUkP06,0*2C
!AIVDM,1,1,,B,15?Jc<0001rCw8R53jkQg:o808EL,0*7B
!AIVDM,1,1,,B,15NMBi;P00rCfi:58C3CN?w:2D4F,0*60
!AIVDM,1,1,,A,11aucipP02rD14R56PU:hww:2<4V,0*79
 */


let seed: number = 47110815
let rand: RandSeed = new RandSeed(seed)
let realDataIdx = 0



function  isValidString(str: string): string {
    let idx: number = 0
    for (; idx < str.length; idx++) {
        if (AIS_OUT_CHR_TBL.indexOf(str.charAt(idx)) < 0) {
            console.log()
            return 'invalid character ' + str.charAt(idx) + ' at index ' + idx
        }
    }

    return ''
}

function createTestData(): TestData {
    // enough bits to read a 32 bit integer or a 6 character string - 7 * 6 - 5 = 37 bits minimum
    let count = rand.intBetween(7, 100)
    let tmp : string = ''
    let idx: number = 0
    for (; idx < count; idx++) {
        // one of the legal characters
        tmp += AIS_IN_CHR_TBL[rand.intBetween(0, AIS_IN_CHR_TBL.length - 1)]
    }

    let padBits: number = rand.intBetween(0, 5)

    return {
        aisStr: tmp,
        padBits: padBits,
        bits: count * 6 - padBits,
        start: 0,
        numBits: 0
    }
}


function createStringTestData(): TestData {
    let result : TestData = createTestData()
    result.start = rand.intBetween(0, result.bits - 6)
    result.numBits = rand.intBetween(0, (result.bits - result.start) / 6) * 6
    return result
}

function createInvalidStringTestData(): TestData {
    let result : TestData = createTestData()

    let failIdx = rand.intBetween(0,result.aisStr.length - 1)
    result.numBits = rand.intBetween(1,result.aisStr.length - 1) * 6
    result.aisStr = result.aisStr.substr(0, failIdx) + 'X' + result.aisStr.substr(failIdx + 1)

    let stMin = failIdx * 6 - result.numBits - 1
    if(stMin < 0) {
        stMin = 0
    }

    let stMax = failIdx * 6 - 1

    result.start = rand.intBetween(stMin,stMax)
    if((result.start + result.numBits) >= result.bits) {
        result.start = result.bits - result.numBits
    }

    return result
}

function createIntTestData(): TestData {
    let result : TestData = createTestData()
    result.numBits = rand.intBetween(1, 32)
    result.start = rand.intBetween(0, result.bits - result.numBits)
    return result
}

function getRealAisData() : ?RealData {
    if(realDataIdx < AIS_REAL_DATA.length) {
        return AIS_REAL_DATA[realDataIdx++]
    }
}


module.exports = {
    isValidString: isValidString,
    createStringTestData: createStringTestData,
    createInvalidStringTestData: createInvalidStringTestData,
    createIntTestData: createIntTestData,
    getRealAisData : getRealAisData
}