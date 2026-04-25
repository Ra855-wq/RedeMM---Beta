import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp({
  projectId: config.projectId,
  credential: applicationDefault()
});

let db: FirebaseFirestore.Firestore;
if (config.firestoreDatabaseId) {
    db = getFirestore(app, config.firestoreDatabaseId);
} else {
    db = getFirestore(app);
}

async function test() {
  try {
    const s = await db.collection('users').limit(1).get();
    console.log("Success", s.docs.length);
  } catch(e) {
    console.error(e);
  }
}
test();
