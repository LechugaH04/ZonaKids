const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

let serviceAccount;
const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT;
if (saEnv) {
    try {
        serviceAccount = JSON.parse(saEnv);
    } catch (err) {
        try {
            const decoded = Buffer.from(saEnv, 'base64').toString('utf8');
            serviceAccount = JSON.parse(decoded);
        } catch (err2) {
            console.error('FIREBASE_SERVICE_ACCOUNT is set but is not valid JSON nor base64-encoded JSON');
        }
    }
} else if (process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
        type: process.env.FIREBASE_TYPE || 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
    };
} else {
    try {
        serviceAccount = require('./serviceAccountKey.json');
    } catch (e) { }
}

if (!admin.apps.length) {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    } else {
        admin.initializeApp();
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };