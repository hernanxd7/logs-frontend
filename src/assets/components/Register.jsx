import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config/api';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const navigate = useNavigate();

  // Usar la URL de la API desde la configuración centralizada
  const serverUrl = BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${serverUrl}/register`, {
        email,
        username,
        password
      });
      
      // Mostrar el código QR para configurar 2FA
      setQrCode(response.data.secretUrl);
      
    } catch (error) {
      console.error('Error en registro:', error);
      setError(error.response?.data?.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };
  
  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {!qrCode ? (
          <>
            <h2>Crear cuenta</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="username">Nombre de usuario</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
            
            <div className="auth-footer">
              ¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link>
            </div>
          </>
        ) : (
          <div className="qr-container">
            <h2>Configuración de autenticación de dos factores</h2>
            <p>Escanea este código QR con Google Authenticator o una aplicación similar:</p>
            <img src={qrCode} alt="Código QR para 2FA" />
            <p>Guarda este código de forma segura. Lo necesitarás para iniciar sesión.</p>
            <button 
              onClick={handleContinue} 
              className="auth-button"
            >
              Continuar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;