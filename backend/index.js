// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Keycloak from 'keycloak-connect';
import session from 'express-session';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
const memoryStore = new session.MemoryStore();
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: memoryStore,   
}));

const keycloakConfig = {
  realm: process.env.KEYCLOAK_REALM,
  'auth-server-url': process.env.KEYCLOAK_AUTH_SERVER_URL,
  resource: process.env.KEYCLOAK_BACKEND_CLIENT_ID,
  'ssl-required': 'external',
  'public-client': false,
  'confidential-port': 0,
  'bearer-only': true,
  'client-secret': process.env.KEYCLOAK_BACKEND_CLIENT_SECRET,
};

const keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
app.use(keycloak.middleware());


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('🔥 Unexpected error on idle PostgreSQL client:', err);
});


app.use((req, res, next) => {
  if (req.kauth && req.kauth.grant) {
    req.userId = req.kauth.grant.access_token.content.sub;
    console.log(`Authenticated user ID: ${req.userId}`); 
  }
  next();
});


app.get('/tasks', keycloak.protect(), async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
});


app.post('/tasks', keycloak.protect(), async (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  try {
    await pool.query('INSERT INTO tasks (title, description, completed, user_id) VALUES ($1, $2, false, $3)', [title, description, userId]);
    res.status(201).json({ message: 'Task added successfully' });
  } catch (err) {
    console.error('Error adding task:', err);
    res.status(500).json({ message: 'Failed to add task', error: err.message });
  }
});


app.put('/tasks/:id', keycloak.protect(), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const userId = req.userId;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const result = await pool.query('UPDATE tasks SET title = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *', [title, description, id, userId]);
    
    if (result.rowCount === 0) {
      console.log(`Task with ID ${id} not found or not owned by user ${userId}.`);
      return res.status(404).json({ message: 'Task not found or not owned by the user' });
    }

    console.log(`Successfully updated task with ID: ${id} for user ${userId}`);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error updating task in database:', err);
    res.status(500).json({ message: 'Failed to update task', error: err.message });
  }
});

app.delete('/tasks/:id', keycloak.protect(), async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found or not owned by the user' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Failed to delete task', error: err.message });
  }
});

app.patch('/tasks/:id/toggle', keycloak.protect(), async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  
  try {
    const result = await pool.query('UPDATE tasks SET completed = NOT completed WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Task not found or not owned by the user' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error toggling task completion:', err);
    res.status(500).json({ message: 'Failed to toggle task completion', error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});