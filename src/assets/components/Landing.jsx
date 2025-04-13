import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

function Landing() {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">⌊∕</span>
            Monitor de registro
          </Link>
          <div className="nav-links">
            <Link to="#features" className="nav-link">Características</Link>
            <Link to="#testimonials" className="nav-link">Testimonios</Link>
            <Link to="#pricing" className="nav-link">Precios</Link>
            <Link to="/login" className="nav-link login">Iniciar sesión</Link>
            <Link to="/register" className="nav-button">Registrarse</Link>
          </div>
        </div>
      </header>
      
      <main className="landing-content">
        <div className="content-wrapper">
          <div className="hero-section">
            <h1>Monitoreo de registros inteligente y en tiempo real</h1>
            <p className="hero-text">
              Detecta problemas antes de que afecten a tus usuarios. Analiza, visualiza y gestiona todos tus logs en una única plataforma centralizada.
            </p>
          </div>

          <div className="feature-window">
            <div className="window-dots">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="feature-content">
              <div className="feature-icon">📈</div>
              <h3>Monitoreo en tiempo real</h3>
              <p>Visualiza y analiza la actividad de tus sistemas al instante</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Landing;