const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'todos.json');

// Default initial todos
const DEFAULT_TODOS = [
  {
    id: '1',
    text: 'Set up GitHub repository and issues',
    completed: true,
    priority: 'High',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: '2',
    text: 'Configure Jira workflows',
    completed: false,
    priority: 'Medium',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    text: 'Build a premium glassmorphic UI dashboard',
    completed: false,
    priority: 'High',
    createdAt: new Date().toISOString()
  }
];

// Helper to load todos from file
function loadTodos() {
  try {
    // Ensure the data directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_TODOS, null, 2), 'utf8');
      return DEFAULT_TODOS;
    }

    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading/parsing todos file, using defaults:', err);
    return DEFAULT_TODOS;
  }
}

// Helper to save todos to file
function saveTodos(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving todos to file:', err);
  }
}

// Load initial data
let todos = loadTodos();

// Get all todos
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// Create a new todo
app.post('/api/todos', (req, res) => {
  const { text, priority } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text field is required' });
  }

  const newTodo = {
    id: Math.random().toString(36).substring(2, 9),
    text,
    completed: false,
    priority: priority || 'Medium',
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  saveTodos(todos);
  res.status(201).json(newTodo);
});

// Update todo completion status or content
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed, priority } = req.body;

  const todoIndex = todos.findIndex(t => t.id === id);
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const currentTodo = todos[todoIndex];
  todos[todoIndex] = {
    ...currentTodo,
    text: text !== undefined ? text : currentTodo.text,
    completed: completed !== undefined ? completed : currentTodo.completed,
    priority: priority !== undefined ? priority : currentTodo.priority
  };

  saveTodos(todos);
  res.json(todos[todoIndex]);
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const todoIndex = todos.findIndex(t => t.id === id);
  if (todoIndex === -1) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const deletedTodo = todos.splice(todoIndex, 1);
  saveTodos(todos);
  res.json({ message: 'Todo deleted successfully', todo: deletedTodo[0] });
});

// Clear all completed todos
app.post('/api/todos/clear-completed', (req, res) => {
  const initialLength = todos.length;
  todos = todos.filter(t => !t.completed);
  const deletedCount = initialLength - todos.length;
  saveTodos(todos);
  res.json({ message: `${deletedCount} completed tasks deleted successfully`, deletedCount });
});

app.listen(PORT, () => {
  console.log(`🚀 Todo backend server running on http://localhost:${PORT}`);
});

