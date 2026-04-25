import { getFirebaseAdmin } from './utils/firebaseAdmin.ts';

async function seed() {
    const { db } = getFirebaseAdmin();
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("username", "==", "admin").get();
    
    if (snapshot.empty) {
        await usersRef.add({
            name: "Moderador Sistema",
            username: "admin",
            password: "admin",
            role: "admin",
            status: "active",
            createdAt: new Date().toISOString()
        });
        console.log("Admin criado com sucesso!");
    } else {
        console.log("Admin já existe!");
    }
    process.exit(0);
}
seed().catch(console.error);
