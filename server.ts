
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createServer as createViteServer } from "vite";
import { User } from "./types";

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
    password: "adminpassword",
    role: "admin",
    status: "active"
  },
  {
    id: "2",
    name: "Dr. Rafael Araujo",
    username: "dlx",
    password: "bmw32",
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

app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  users = users.filter(u => u.id !== id);
  res.status(204).send();
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
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
