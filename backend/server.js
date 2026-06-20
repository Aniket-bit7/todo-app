const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory data store for testing
let todos = [
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
  res.json({ message: 'Todo deleted successfully', todo: deletedTodo[0] });
});

app.listen(PORT, () => {
  console.log(`🚀 Todo backend server running on http://localhost:${PORT}`);
});
