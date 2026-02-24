import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
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
        const parsedUser = JSON.parse(savedUser);
        // CRITICAL FIX: Only restore if the user object is valid and has a role
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
        } else {
          console.warn("Invalid user data in storage, clearing...");
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } else {
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
