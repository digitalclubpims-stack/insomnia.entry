/** INSOMNIA Google Form -> Firebase bridge.
 * Bind this script to the response spreadsheet and install an onFormSubmit trigger.
 * Put the following in Script Properties:
 * FIREBASE_SYNC_URL = https://asia-south1-YOUR_PROJECT.cloudfunctions.net/syncRegistration
 * SYNC_SECRET = the same secret configured in Firebase Functions
 */
const CONFIG={
  SHEET_NAME:'Form Responses 1',
  BATCHES:['2021','2022','2023','2024','2025','2026','OTHERS'],
  CR_BY_BATCH:{
    '2021':['Kashish Mahajan','CR 2'],
    '2022':['Rhythm Gupta','CR 2'],
    '2023':['Gurman Singh Bhatia','CR 2'],
    '2024':['Nishant Mittal','CR 2'],
    '2025':['Ishan','CR 2'],
    '2026':['CR 1','CR 2'],
    'OTHERS':['CR 1','CR 2']
  }
};
function onFormSubmit(e){
  const p=PropertiesService.getScriptProperties();
  const url=p.getProperty('FIREBASE_SYNC_URL'); const secret=p.getProperty('SYNC_SECRET');
  if(!url||!secret) throw new Error('Configure FIREBASE_SYNC_URL and SYNC_SECRET in Script Properties.');
  const v=e.namedValues||{};
  const get=(...names)=>{for(const n of names){if(v[n]&&v[n][0])return String(v[n][0]).trim()}return ''};
  const payload={
    name:get('NAME OF THE ATTENDEE','Full Name','Name of Attendee'),
    rollNumber:get('ROLL NUMBER','Roll Number'),
    mobile:get('PHONE NUMBER','Mobile Number','Phone Number'),
    email:get('Email','EMAIL'),
    batch:get('BATCH','Batch'),
    crName:get('MONEY PAID TO?','Money Paid To','Class Representative'),
    utr:get('TYPE THE UTR NUMBER (*for verification)','UTR Transaction ID','UTR'),
    amount:get('AMOUNT PAID','Amount Paid'),
    paymentScreenshotUrl:get('ATTACH THE SCREENSHOT OF PAYMENT.','Payment Screenshot','Payment Screenshot URL')
  };
  if(!payload.name||!payload.mobile||!payload.batch||!payload.crName||!payload.utr) throw new Error('Required registration field missing.');
  const options=CONFIG.CR_BY_BATCH[payload.batch]||[];
  if(options.length && !options.includes(payload.crName)) throw new Error('CR selection does not match the selected batch.');
  const res=UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',headers:{'x-insomnia-sync-secret':secret},payload:JSON.stringify(payload),muteHttpExceptions:true});
  const code=res.getResponseCode(); if(code<200||code>=300) throw new Error('Firebase sync failed: '+res.getContentText());
}
