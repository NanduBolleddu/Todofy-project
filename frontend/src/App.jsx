// frontend/src/App.jsx
import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function App({ keycloak }) {
  const [userInfo, setUserInfo] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDesc, setEditedDesc] = useState('');

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (keycloak && keycloak.tokenParsed) {
        setUserInfo(keycloak.tokenParsed);
        if (keycloak.token) {
          await fetchTasks();
        }
      }
    };
    initializeApp();
  }, [keycloak]);

  const fetchTasks = async () => {
    if (!keycloak || !keycloak.token) {
      console.warn("Keycloak token not available, cannot fetch tasks.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/tasks', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!keycloak || !keycloak.token) {
      console.warn("Keycloak token not available, cannot add task.");
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ title, description: desc }),
      });
      if (response.ok) {
        setTitle('');
        setDesc('');
        fetchTasks();
      } else {
        const errorText = await response.text();
        console.error('Failed to add task:', response.status, errorText);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!keycloak || !keycloak.token) {
      console.warn("Keycloak token not available, cannot delete task.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      if (response.ok) {
        fetchTasks();
      } else {
        const errorText = await response.text();
        console.error('Failed to delete task:', response.status, errorText);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleToggleComplete = async (id) => {
    if (!keycloak || !keycloak.token) {
      console.warn("Keycloak token not available, cannot toggle task.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/tasks/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      if (response.ok) {
        fetchTasks();
      } else {
        const errorText = await response.text();
        console.error('Failed to toggle complete:', response.status, errorText);
      }
    } catch (err) {
      console.error('Failed to toggle complete:', err);
    }
  };
  
  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setEditedTitle(task.title);
    setEditedDesc(task.description);
  };
  
  const handleSaveEdit = async (id) => {
    if (!keycloak || !keycloak.token) {
      console.warn("Keycloak token not available, cannot save task.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({ title: editedTitle, description: editedDesc }),
      });
      if (response.ok) {
        setEditingTaskId(null);
        fetchTasks();
      } else {
        const errorText = await response.text();
        console.error('Failed to save task:', response.status, errorText);
      }
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };
  
  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <p className="text-xl text-gray-400">🔐 Getting user info...</p>
      </div>
    );
  }

  const displayName = userInfo.given_name || userInfo.preferred_username;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-inter">
      <div className="w-full px-4 py-8 md:px-12 md:py-16">
        <header className="flex justify-between items-center pb-6 md:pb-8 border-b border-gray-700">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600">Todofy</h1>
          <div className="relative" ref={profileMenuRef}>
            <div
              className="flex items-center space-x-2 cursor-pointer transition-colors hover:text-gray-300"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <span className="text-sm md:text-base font-medium text-gray-300">
                Hello, {displayName}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            {isProfileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg p-2 z-10">
                <button
                  className="w-full text-left px-4 py-2 border border-transparent rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                  onClick={() =>
                    keycloak.logout({ redirectUri: window.location.origin })
                  }
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 md:mt-12">
          <section className="bg-gray-900 p-6 md:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 relative pl-4 after:absolute after:top-1/2 after:-translate-y-1/2 after:left-0 after:w-1 after:h-4/5 after:bg-red-600 after:rounded-sm">
              Add a New Task
            </h2>
            <form onSubmit={handleAddTask} className="flex flex-col space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-3 focus:outline-none focus:border-red-600 transition-colors"
              />
              <textarea
                placeholder="Task Description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-md p-3 focus:outline-none focus:border-red-600 transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-red-600 text-white font-semibold py-3 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="M12 5v14"/>
                </svg>
                <span>Add Task</span>
              </button>
            </form>
          </section>

          <section className="bg-gray-900 p-6 md:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 relative pl-4 after:absolute after:top-1/2 after:-translate-y-1/2 after:left-0 after:w-1 after:h-4/5 after:bg-red-600 after:rounded-sm">
              Your Tasks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.length === 0 && (
                <p className="w-full text-lg text-gray-500 col-span-full text-center">You have no tasks. Get started by adding one!</p>
              )}
              {tasks.map((task) => (
                <div key={task.id} className={`bg-gray-800 rounded-xl p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${task.completed ? 'opacity-50 line-through' : ''}`}>
                  {editingTaskId === task.id ? (
                    <div className="flex flex-col space-y-4">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md p-2 focus:outline-none focus:border-red-600"
                      />
                      <textarea
                        value={editedDesc}
                        onChange={(e) => setEditedDesc(e.target.value)}
                        className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md p-2 focus:outline-none focus:border-red-600"
                      />
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleSaveEdit(task.id)} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition-colors">Save</button>
                        <button onClick={() => setEditingTaskId(null)} className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-semibold text-gray-100 flex-grow pr-4">{task.title}</h3>
                        <button
                          className={`transition-colors ${task.completed ? 'text-green-500 hover:text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                          onClick={() => handleToggleComplete(task.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                               fill="none" // No fill, icon is just an outline
                               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-8.8"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        </button>
                      </div>
                      <p className="mt-2 text-gray-400 text-sm">{task.description}</p>
                      <div className="flex justify-end space-x-2 mt-4">
                        <button className="text-gray-500 hover:text-gray-300 transition-colors" onClick={() => handleEditClick(task)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            <path d="m15 5 4 4"/>
                          </svg>
                        </button>
                        <button className="text-gray-500 hover:text-red-500 transition-colors" onClick={() => handleDeleteTask(task.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;