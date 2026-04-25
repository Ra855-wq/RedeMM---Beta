
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

// In-memory user store for beta
let users: User[] = [
  {
    id: "1",
    name: "Moderador Sistema",
    username: "admin",
    password: "admin",
    role: "admin",
    status: "active"
  },
  {
    id: "2",
    name: "Dr. Rafael Araujo",
    username: "beta.tester.pmmb",
    password: "RedeMM#Beta@v0.1.0-Safe",
    role: "doctor",
    status: "active"
  }
];

// API Routes
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    if (user.status !== 'active') {
      return res.status(403).json({ error: "Conta aguardando liberação do moderador." });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } else {
    res.status(401).json({ error: "Credenciais inválidas." });
  }
});

app.post("/api/register", (req, res) => {
  const { name, username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Este RMS já está cadastrado." });
  }
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    username,
    password,
    role: 'doctor',
    status: 'pending'
  };
  users.push(newUser);
  res.status(201).json({ message: "Solicitação enviada com sucesso. Aguarde a liberação do moderador." });
});

app.get("/api/users", (req, res) => {
  // In a real app, check for admin role here
  res.json(users.map(({ password, ...u }) => u));
});

app.post("/api/users", (req, res) => {
  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body,
    status: req.body.status || 'pending'
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

app.patch("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ error: "Usuário não encontrado" });
  }
});

app.get("/api/profile/:username", (req, res) => {
  const { username } = req.params;
  const user = users.find(u => u.username === username);
  if (user) {
    const { password, ...u } = user;
    res.json(u);
  } else {
    res.status(404).json({ error: "Perfil não encontrado" });
  }
});

app.post("/api/profile/:username", (req, res) => {
  const { username } = req.params;
  const index = users.findIndex(u => u.username === username);
  if (index !== -1) {
    // In a real app, we'd have a separate profile table or more fields in User
    // For this beta, we'll just acknowledge the save
    res.json({ message: "Perfil atualizado com sucesso" });
  } else {
    res.status(404).json({ error: "Usuário não encontrado" });
  }
});

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  users = users.filter(u => u.id !== id);
  res.status(204).send();
});

// AI Routes (Server-side to hide API Key)
import { 
  generateProntuario, 
  searchHealthFacilities, 
  generateTTS, 
  aiChat 
} from "./utils/aiService.ts";

app.post("/api/ai/prontuario", async (req, res) => {
  try {
    const text = await generateProntuario(req.body);
    res.json({ text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/facilities", async (req, res) => {
  try {
    const { query } = req.body;
    const data = await searchHealthFacilities(query);
    res.json(data);
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/tts", async (req, res) => {
  try {
    const { text } = req.body;
    const base64Audio = await generateTTS(text);
    res.json({ base64Audio });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const text = await aiChat(messages);
    res.json({ text });
  } catch (error: any) {
    console.error("AI Error:", error);
    res.status(500).json({ error: error.message });
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
    app.get("*all", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
