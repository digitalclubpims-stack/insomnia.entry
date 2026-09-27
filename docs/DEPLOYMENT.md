# Deployment checklist

1. Create Firebase project.
2. Enable Email/Password Authentication.
3. Create Firestore database.
4. Add web app and copy config into `src/config.js`.
5. Create one admin Firebase Auth user and document `admins/{uid}` with `{role:"admin"}`.
6. Create two CR Firebase Auth users per batch (2021-2026) and documents `crs/{uid}` with `{role:"cr",batch:"2021"}` etc. This is 12 CR accounts total.
7. Deploy `firebase/firestore.rules` and `firebase/firestore.indexes.json`.
8. Create/import tickets only through an authenticated admin workflow. Never put service account keys in GitHub Pages.
9. Bind `apps-script/Code.gs` to the Google Form response spreadsheet and install the form-submit trigger. The script adds registration ID, secure token, retrieval PIN and pending status. It does not email.
10. GitHub Pages: publish the repository root. Use HTTPS. Browser QR camera access requires HTTPS.
11. Before launch, create at least 20 test tickets and test: duplicate UTR, wrong CR, pending ticket, valid ticket, repeated same-night scan, next-night scan, both gates, concurrent scans, revoked ticket, and network loss.
12. Keep the scanner ONLINE-ONLY. If Firestore cannot be reached, the UI must not confirm entry.

## Google Form confirmation
Because native Google Forms confirmation text is not per-response, direct attendees to the portal separately using the registration ID/retrieval PIN delivery process you choose. For a fully seamless personalized redirect, replace the raw Google Form with an Apps Script/HTML registration front end that writes to the same Sheet, or use a form product that supports post-submit personalized URLs.
