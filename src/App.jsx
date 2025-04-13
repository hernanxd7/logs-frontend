import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './assets/components/landing';
import Login from './assets/components/Login';
import Register from './assets/components/Register';
import Home from './assets/components/Home';
import Logs from './assets/components/Logs';  // Cambiado a minúscula para coincidir con el archivo
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
