import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import LoadingPage from './components/LoadingPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      } else {
        // If one is missing, clear both to be safe
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } catch (e) {
      console.error("Session restoration failed", e);
      localStorage.clear();
    } finally {
      // Simulate a brief load for aesthetic finish
      setTimeout(() => setLoading(false), 500);
    }
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route
          path="/"
          element={(!user || !user.role) ? <Login setUser={setUser} /> : <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} />}
        />
        <Route path="/register" element={<Register />} />

        <Route
          path="/teacher"
          element={(user?.role === 'teacher') ? <TeacherDashboard user={user} setUser={setUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/student"
          element={(user?.role === 'student') ? <StudentDashboard user={user} setUser={setUser} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
