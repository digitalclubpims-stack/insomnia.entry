# INSOMNIA Entry Portal — Firebase + GitHub Pages

This package is the production-oriented starting point for the INSOMNIA three-night restricted-entry system.

## Agreed workflow
1. Student pays a batch CR by UPI.
2. Student submits the Google Form: email, attendee name, roll number, phone, batch, money paid to, UTR, payment screenshot.
3. The Google Form response spreadsheet is bridged to Firebase by Apps Script.
4. The registration is `PENDING` and has no valid ticket yet.
5. The assigned CR signs into the CR portal and sees only their batch's pending registrations.
6. The CR checks the UTR in their own UPI transaction history.
7. On **Verify**, the Firebase Cloud Function atomically changes the payment to `VERIFIED`, generates the unique ticket ID and opaque QR token, and creates the ticket record.
8. The attendee opens **Get Pass**, enters mobile + UTR, and downloads/views their unique phone ticket.
9. At the gate, the attendee shows the QR and college ID. A signed-in scanner checks Firebase live.
10. The operator checks the college ID and presses **Confirm Entry**. A Firestore transaction marks that night as used.
11. The same ticket works on Nights 1–3 independently. No re-entry is supported.

## Roles
- One `admin` account.
- Two CR slots per batch. Current CR 1 names: 2021 Kashish Mahajan; 2022 Rhythm Gupta; 2023 Gurman Singh Bhatia; 2024 Nishant Mittal; 2025 Ishan. CR 2 is reserved. 2026 is supported and its CR names are intentionally open.
- Four scanner accounts: two BOYS and two GIRLS. Create these from the admin portal.

## Important security design
- No ticket is valid before CR verification.
- QR contains an opaque random token, not the visible ticket ID.
- Scanner entry confirmation is performed server-side in a Firestore transaction to prevent simultaneous duplicate admission.
- Scanner is online-only for authoritative decisions.
- Firestore client rules deny direct writes to registrations/tickets/entry logs; privileged mutations happen in Cloud Functions.
- Do not put Firebase service-account credentials in GitHub Pages.

## Firebase setup
1. Create a Firebase project.
2. Enable Authentication -> Email/Password.
3. Create Firestore in production mode.
4. Add a Web App and copy its config into `src/config.js`.
5. Install Firebase CLI and run from the `firebase/` directory's parent project as documented below.
6. Set the Functions secret: `firebase functions:secrets:set SYNC_SECRET`.
7. Deploy functions, rules and indexes.
8. In Firebase Auth, create the single admin account manually. Then create `admins/{ADMIN_UID}` with `{ role: 'admin' }` in Firestore.
9. Sign into `/admin/` and create the CR/scanner accounts.
10. Configure the Google Sheet Apps Script Script Properties with the Cloud Function URL and the same sync secret.

## Cloud Functions deployment
From this project:

```bash
cd firebase
npm install -g firebase-tools
firebase login
firebase use --add
cd functions && npm install && cd ..
firebase functions:secrets:set SYNC_SECRET
firebase deploy --only functions,firestore:rules,firestore:indexes
```

The HTTP bridge URL is:
`https://asia-south1-YOUR_PROJECT_ID.cloudfunctions.net/syncRegistration`

## GitHub Pages
Upload the contents of this package (except the Firebase Functions folder if you prefer) to the GitHub repository. Enable GitHub Pages from the repository's `main` branch/root. Add the GitHub Pages domain to Firebase Authentication -> Settings -> Authorized domains.

## Google Form / Sheet bridge
The Apps Script is in `apps-script/Code.gs`. Bind it to the response spreadsheet, add the two Script Properties, and create an installable **From spreadsheet -> On form submit** trigger for `onFormSubmit`.

Do not send tickets by email. The consumer Apps Script email quota is intentionally irrelevant because the ticket is retrieved from the portal after CR approval.
