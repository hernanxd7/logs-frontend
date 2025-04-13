import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config/api';
import '../styles/home.css';

function Home() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

 

  const infoEstatica = {
    alumno: {
      nombre: "Hernan Serrano Cruz",
      grupo: "IDGS11"
    },
    docente: {
      nombre: "Emmanuel Martínez Hernández",
    }
  };

   // Información estática para mostrar en la página
   const appInfo = {
    nombre: "Sistema de Autenticación Segura",
    descripcion: "Esta aplicación demuestra un sistema de autenticación con verificación de dos factores (2FA) y protección contra ataques de fuerza bruta mediante rate limiting. Utiliza tecnologías modernas como React, Node.js, Express y Firebase para proporcionar una experiencia de usuario segura y eficiente.",
    caracteristicas: [
      "Autenticación de dos factores (2FA)",
      "Protección contra ataques de fuerza bruta",
      "Almacenamiento seguro de contraseñas",
      "Tokens JWT para gestión de sesiones",
      "Interfaz de usuario intuitiva y responsive"
    ]
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    // Configurar el token en los headers de axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Usar la URL de la API desde la configuración centralizada
    const serverUrl = BASE_URL;
    
    const fetchUserData = async () => {
      try {
        console.log('Obteniendo información del usuario...');
        const response = await axios.get(`${serverUrl}/getInfo`);
        console.log('Respuesta recibida:', response.data);
        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        setError('Error al cargar los datos del usuario');
        setLoading(false);
        
        // Si hay un error de autenticación, redirigir al login
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Función para navegar a la pantalla de logs
  const handleViewLogs = () => {
    navigate('/logs');
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/login')} className="auth-button">
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⌊∕</span>
            LogMonitor
          </div>
        </div>
        <nav className="header-nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Configuración</button>
          <button onClick={handleViewLogs} className="nav-item">Ver Logs</button>
        </nav>
        <div className="header-right">
          <div className="user-menu">
            <span className="user-avatar">H</span>
            <span className="user-name">Bienvenido, {userData?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="info-grid">
          <div className="info-card user-info">
            <div className="card-header">
              <h2>Información del usuario</h2>
              <span className="card-icon">👤</span>
            </div>
            <div className="card-content">
              <div className="info-item">
                <label>Nombre de usuario:</label>
                <span>{userData?.username}</span>
              </div>
              <div className="info-item">
                <label>Correo electrónico:</label>
                <span>{userData?.email}</span>
              </div>
              <div className="info-item">
                <label>Fecha de registro:</label>
                <span>{userData?.createdAt?.toDate?.().toLocaleString() || 'No disponible'}</span>
              </div>
            </div>
          </div>

          <div className="info-card student-info">
            <div className="card-header">
              <h2>Información del alumno</h2>
              <span className="card-icon">📚</span>
            </div>
            <div className="card-content">
              <div className="info-item">
                <label>Nombre:</label>
                <span>{infoEstatica.alumno.nombre}</span>
              </div>
              <div className="info-item">
                <label>Grupo:</label>
                <span>{infoEstatica.alumno.grupo}</span>
              </div>
            </div>
          </div>

          <div className="info-card teacher-info">
            <div className="card-header">
              <h2>Información del docente</h2>
              <span className="card-icon">👨‍🏫</span>
            </div>
            <div className="card-content">
              <div className="info-item">
                <label>Nombre:</label>
                <span>{infoEstatica.docente.nombre}</span>
              </div>
            </div>
          </div>

          <div className="info-card system-info">
            <div className="card-header">
              <h2>{appInfo.nombre}</h2>
              <span className="card-icon">🔒</span>
            </div>
            <div className="card-content">
              <p className="system-description">{appInfo.descripcion}</p>
              <h3>Características principales:</h3>
              <ul className="feature-list">
                {appInfo.caracteristicas.map((feature, index) => (
                  <li key={index}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="info-card version-info">
            <div className="card-header">
              <h2>Información del sistema</h2>
              <span className="card-icon">⚙️</span>
            </div>
            <div className="card-content">
              <div className="info-item">
                <label>Versión de Node:</label>
                <span>{userData?.nodeVersion || 'v22.13.1'}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>© 2025 LogMonitor. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;