# INSOMNIA Entry Portal

Production-oriented GitHub Pages + Firebase architecture for a three-night single-pass fest.

## Features
- Google Form/Google Sheet registration bridge
- Manual UTR verification by class representatives (batch-scoped)
- Ticket generation only after payment verification
- Ticket retrieval using registration ID + mobile + PIN
- Aesthetic mobile ticket with QR
- Firebase-backed live QR scanner
- Two gates: BOYS / GIRLS; scanner operator selects gate
- Four scanner devices supported concurrently
- No re-entry: one successful entry per ticket per night
- Night 1/2/3 state retained independently
- College ID check is an operational gate rule
- Admin dashboard, CR dashboard, scanner dashboard
- CSV import/export
- Audit logs
- Firestore transaction-based entry claim to prevent race conditions

## Important deployment note
GitHub Pages hosts the UI. Firebase Authentication + Firestore provide the secure backend. Do not put service-account credentials in this repository.

## Setup
1. Create a Firebase project and enable Authentication -> Email/Password and Firestore.
2. Create the web app and copy its config into `src/config.js` (or use the environment/config replacement documented there).
3. Deploy Firestore rules from `firebase/firestore.rules` and indexes from `firebase/firestore.indexes.json`.
4. Create one admin account in Firebase Auth. Assign its UID in the `admins/{uid}` document with `role: admin`.
5. Create CR accounts in Firebase Auth and corresponding `crs/{uid}` docs with `batch` set to 2021..2026 and `role: cr`.
6. Configure the Google Form and Apps Script in `apps-script/`.
7. Deploy the Apps Script web app if using the bridge endpoints, and set the Sheet ID / portal URL.
8. Deploy this folder to GitHub Pages.

## Google Form fields
Full Name, Mobile Number, Email, Batch (2021-2026), UTR Transaction ID, Amount Paid, Class Representative.

## Ticket lifecycle
PENDING -> VERIFIED -> ticket issued -> NIGHT_01/NIGHT_02/NIGHT_03 each independently UNUSED/USED.

## Security
The QR contains an opaque random token. The scanner never trusts the visible ticket number. Entry is a Firestore transaction that verifies the token, payment status, current-night status and then atomically marks the ticket used. The operator must press Confirm Entry after checking the attendee's college ID.

## Offline mode
The scanner is deliberately ONLINE-ONLY for authoritative entry decisions. Browser/network caching may make the shell load, but entry cannot be confirmed without a live Firestore transaction. This avoids duplicate-entry inconsistencies.
