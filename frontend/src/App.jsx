import React, { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, priority }),
      });

      if (!response.ok) {
        throw new Error('Failed to add todo');
      }

      const newTodo = await response.json();
      setTodos(prev => [...prev, newTodo]);
      setInputText('');
      setPriority('Medium');
    } catch (err) {
      console.error(err);
      setError('Could not add task. Backend offline?');
    }
  };

  const handleToggleTodo = async (id, currentCompleted) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to update todo');
      }

      const updatedTodo = await response.json();
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
    } catch (err) {
      console.error(err);
      setError('Could not update task status.');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete todo');
      }

      setTodos(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error(err);
      setError('Could not delete task.');
    }
  };

  // Stats calculation
  const totalTasks = todos.length;
  const completedTasks = todos.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Filter and search
  const filteredTodos = todos
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase()));

  const formatDate = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="todo-container">
      <header className="todo-header">
        <h1>Sprint Backlog Workspace</h1>
        <p>Real-time task synchronization for Jira & GitHub workflows</p>
      </header>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '0.9rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>⚠️ {error}</span>
          <button onClick={fetchTodos} style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}>Retry</button>
        </div>
      )}

      {/* Stats Dashboard */}
      <section className="stats-panel">
        <div className="stats-info">
          <span className="stats-number">{completedTasks}/{totalTasks}</span>
          <span className="stats-label">Tasks Completed</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="stats-info" style={{ alignItems: 'flex-end' }}>
          <span className="stats-number">{progressPercent}%</span>
          <span className="stats-label">Progress</span>
        </div>
      </section>

      {/* Add Task Form */}
      <form onSubmit={handleAddTodo} className="todo-form">
        <div className="form-row">
          <input
            type="text"
            className="todo-input"
            placeholder="Add a new task to sprint..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <select
            className="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={loading}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <button type="submit" className="todo-button" disabled={loading}>
            Add Task
          </button>
          <button
            type="button"
            className="todo-button refresh-button"
            onClick={fetchTodos}
            disabled={loading}
            title="Refresh todos"
          >
            Refresh
          </button>
        </div>
      </form>

      {/* Filter and Search controls */}
      <div className="filter-search-bar">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search task registry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Todo List */}
      <main className="todo-list">
        {loading ? (
          <div className="empty-state">
            <span className="empty-icon" style={{ animation: 'spin 1.5s linear infinite' }}>🔄</span>
            <span>Fetching backend registry...</span>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📁</span>
            <span>No tasks found here. Create one!</span>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div
              key={todo.id}
              className={`todo-card completed-${todo.completed} priority-${todo.priority.toLowerCase()} ${todo.completed ? 'completed' : ''}`}
            >
              <div className="todo-card-left">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id, todo.completed)}
                  />
                  <span className="checkmark"></span>
                </label>
                <div className="task-content">
                  <span className="task-text">{todo.text}</span>
                  <div className="task-meta">
                    <span className={`badge badge-${todo.priority.toLowerCase()}`}>
                      {todo.priority}
                    </span>
                    <span>•</span>
                    <span>Created {formatDate(todo.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDeleteTodo(todo.id)}
                title="Remove task"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
