import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requireMFA, setRequireMFA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // URL del servidor - Usando solo el servidor sin rate limit
  const serverUrl = 'http://localhost:3001';  // Servidor sin Rate Limit

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (requireMFA) {
        // Verificar código OTP
        const response = await axios.post(`${serverUrl}/verify-otp`, {
          email,
          otp
        });

        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          navigate('/home');
        } else {
          setError('Código OTP inválido');
        }
      } else {
        // Iniciar sesión normal
        const response = await axios.post(`${serverUrl}/login`, {
          email,
          password
        });

        if (response.data.requiredMFA) {
          setRequireMFA(true);
        } else if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          navigate('/home');
        }
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{requireMFA ? 'Verificación de dos factores' : 'Iniciar sesión'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!requireMFA ? (
            <>
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
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <div className="form-group">
              <label htmlFor="otp">Código de verificación</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Ingresa el código de tu aplicación"
                required
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Procesando...' : requireMFA ? 'Verificar' : 'Iniciar sesión'}
          </button>
        </form>
        
        {!requireMFA && (
          <div className="auth-footer">
            ¿No tienes una cuenta? <Link to="/register">Registrarse</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;