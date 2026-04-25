
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer as createViteServer } from "vite";
import type { User } from "./types.ts";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

import { getFirebaseAdmin } from "./utils/firebaseAdmin.ts";

// API Routes
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const { db } = getFirebaseAdmin();
  
  try {
    const snapshot = await db.collection('users')
      .where('username', '==', username)
      .where('password', '==', password)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() } as User;
      
      if (user.status !== 'active') {
        return res.status(403).json({ error: "Conta aguardando liberação do moderador." });
      }
      
      const { auth } = getFirebaseAdmin();
      let customToken = "";
      try {
        // Create a custom token to allow the client to authenticate with Firebase
        customToken = await auth.createCustomToken(user.id);
      } catch (tokenError) {
        console.error("Error creating custom token:", tokenError);
        // We continue anyway, but the client might have permission issues
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        token: customToken
      });
    } else {
      res.status(401).json({ error: "Credenciais inválidas." });
    }
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Erro interno no servidor de autenticação." });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, username, password, rmsId } = req.body;
  const { db } = getFirebaseAdmin();
  
  try {
    const existing = await db.collection('users')
      .where('username', '==', username)
      .limit(1)
      .get();
    
    if (!existing.empty) {
      return res.status(400).json({ error: "Este RMS já está cadastrado." });
    }
    
    const newUser = {
      name,
      username,
      rmsId,
      password, // In a real app, hash this!
      role: 'doctor',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await db.collection('users').add(newUser);
    res.status(201).json({ message: "Solicitação enviada com sucesso. Aguarde a liberação do moderador." });
  } catch (error: any) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Erro ao processar registro." });
  }
});

app.get("/api/users", async (req, res) => {
  const { db } = getFirebaseAdmin();
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map((doc: any) => {
      const { password, ...u } = doc.data();
      return { id: doc.id, ...u };
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

app.post("/api/users", async (req, res) => {
  const { db } = getFirebaseAdmin();
  try {
    const newUser = {
      ...req.body,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('users').add(newUser);
    res.status(201).json({ id: docRef.id, ...newUser });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { db } = getFirebaseAdmin();
  try {
    await db.collection('users').doc(id).update(req.body);
    const updated = await db.collection('users').doc(id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    res.status(404).json({ error: "Usuário não encontrado" });
  }
});

app.get("/api/profile/:username", async (req, res) => {
  const { username } = req.params;
  const { db } = getFirebaseAdmin();
  try {
    const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
    if (!snapshot.empty) {
      const { password, ...u } = snapshot.docs[0].data();
      res.json({ id: snapshot.docs[0].id, ...u });
    } else {
      res.status(404).json({ error: "Perfil não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

app.post("/api/profile/:username", async (req, res) => {
  const { username } = req.params;
  const { db } = getFirebaseAdmin();
  try {
    const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
    if (!snapshot.empty) {
      await db.collection('users').doc(snapshot.docs[0].id).update(req.body);
      res.json({ message: "Perfil atualizado com sucesso" });
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { db } = getFirebaseAdmin();
  try {
    await db.collection('users').doc(id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
