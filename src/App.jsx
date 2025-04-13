import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './assets/components/landing'; // ✅ con mayúscula
import Login from './assets/components/login';
import Register from './assets/components/register';
import Home from './assets/components/home';
import Logs from './assets/components/logs';  // Cambiado a minúscula para coincidir con el archivo
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default App;
