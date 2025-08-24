import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Register from './components/Register';
import Login from './components/Login';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Variants from './components/Variants';
import Items from './components/Items';
import Matching from './components/Matching';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz" 
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/variants" 
              element={
                <ProtectedRoute>
                  <Variants />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/items" 
              element={
                <ProtectedRoute>
                  <Items />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/matching" 
              element={
                <ProtectedRoute>
                  <Matching />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/matching/:quizId" 
              element={
                <ProtectedRoute>
                  <Matching />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
