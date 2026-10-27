import { useState, useEffect } from "react";
import TaskList from "./components/TaskList.jsx";
import TaskForm from "./components/TaskForm.jsx";
import LoginForm from "./components/LoginForm.jsx";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [loggedInAs, setLoggedInAs] = useState("");

  async function fetchTasks() {
    try {
      setError("");
      const res = await fetch(`${API_URL}/api/tasks`);
      if (!res.ok) throw new Error(`GET /api/tasks answered ${res.status}`);
      setTasks(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function logIn(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error);
    }
    setToken(data.token);
    setLoggedInAs(email);
  }

  function logOut() {
    setToken("");
    setLoggedInAs("");
  }

  async function addTask(title) {
    const res = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: title,
        dueDate: new Date().toISOString().slice(0, 10),
        userId: 1,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error);
    }
    await fetchTasks();
  }

  return (
    <main className="tasks">
      <h1>Task Manager</h1>

      {token ? (
        <>
          <p className="user-bar">
            Logged in as {loggedInAs}
            <button onClick={logOut}>Log out</button>
          </p>
          <TaskForm onAdd={addTask} />
        </>
      ) : (
        <LoginForm onLogin={logIn} />
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="error">Could not load the tasks: {error}</p>}
      {!loading && !error && (
        <>
          <p className="count">{tasks.length} tasks</p>
          <TaskList tasks={tasks} />
        </>
      )}
    </main>
  );
}

export default App;