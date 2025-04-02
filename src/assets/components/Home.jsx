import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    
    // Usar siempre el servidor 2 (sin rate limit)
    const serverUrl = 'http://localhost:3001';
    
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
    <div className="home-container">
      <div className="home-header">
        <h1>Bienvenido, {userData?.username}</h1>
        <div className="header-buttons">
          <button onClick={handleViewLogs} className="view-logs-button">
            Ver Logs
          </button>
          <button onClick={handleLogout} className="logout-button">
            Cerrar sesión
          </button>
        </div>
      </div>

      

      <div className="user-info-card">
        <h2>Información del usuario</h2>
        <div className="user-info-item">
          <strong>Nombre de usuario:</strong> {userData?.username}
        </div>
        <div className="user-info-item">
          <strong>Correo electrónico:</strong> {userData?.email}
        </div>
        <div className="user-info-item">
          <strong>Fecha de registro:</strong> {userData?.createdAt?.toDate?.().toLocaleString() || 'No disponible'}
        </div>
      </div>

      <div className="user-info-card">
        <h2>Información del alumno</h2>
        <div className="user-info-item">
          <strong>Nombre:</strong> {infoEstatica.alumno.nombre}
        </div>
        <div className="user-info-item">
          <strong>Grupo:</strong> {infoEstatica.alumno.grupo}
        </div>
      </div>

      <div className="user-info-card">
        <h2>Información del docente</h2>
        <div className="user-info-item">
          <strong>Nombre:</strong> {infoEstatica.docente.nombre}
        </div>
        {/* Eliminamos la referencia al grupo del docente ya que no existe */}
      </div>

      {/* Nueva tarjeta con información de la aplicación */}
      <div className="user-info-card app-description">
        <h2>{appInfo.nombre}</h2>
        <p className="app-description-text">{appInfo.descripcion}</p>
        <h3>Características principales:</h3>
        <ul className="feature-list">
          {appInfo.caracteristicas.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="user-info-card">
        <h2>Información del sistema</h2>
        <div className="user-info-item">
          <strong>Versión de Node:</strong> {userData?.nodeVersion || 'No disponible'}
        </div>
      </div>
    </div>
  );
}

export default Home;