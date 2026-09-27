/** INSOMNIA Google Form bridge.
 * Bind this script to the response spreadsheet.
 * Expected response headers: Full Name, Mobile Number, Email, Batch, UTR Transaction ID, Amount Paid, Class Representative.
 * The script creates a ticket record in Firestore via the Firebase REST API only after an admin-controlled import/verification workflow.
 * For production, use a secure server-side function or authenticated admin import rather than embedding a Firebase service account key in Apps Script.
 */
const CONFIG={PORTAL_URL:'https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPO/ticket/',SHEET_NAME:'Form Responses 1'};
function onFormSubmit(e){
  const v=e.namedValues||{}; const row=e.range.getRow();
  const sheet=e.range.getSheet();
  const headers=sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  const get=(h)=>((v[h]&&v[h][0])||'').trim();
  const name=get('Full Name'),mobile=get('Mobile Number'),email=get('Email'),batch=get('Batch'),utr=get('UTR Transaction ID'),amount=get('Amount Paid'),crName=get('Class Representative');
  if(!name||!mobile||!batch||!utr||!crName) throw new Error('Required registration fields missing');
  const ticketId='INS-'+Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
  const token=Utilities.getUuid()+Utilities.getUuid();
  const pin=Utilities.getUuid().replace(/-/g,'').slice(0,10).toUpperCase();
  const col=(h)=>headers.indexOf(h)+1;
  const additions={'Registration ID':ticketId,'Secure Token':token,'Retrieval PIN':pin,'Payment Status':'PENDING','Ticket Issued':'NO'};
  Object.entries(additions).forEach(([h,val])=>{let c=col(h);if(!c){c=sheet.getLastColumn()+1;sheet.getRange(1,c).setValue(h)}sheet.getRange(row,c).setValue(val)});
  // Do not email. Give organizers the registration ID and retrieval PIN through the approved portal workflow.
}
