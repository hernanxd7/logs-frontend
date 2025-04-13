import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [requireMFA, setRequireMFA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: email, 2: MFA, 3: nueva contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Usar la URL de la API desde la configuración centralizada
  const serverUrl = BASE_URL;

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

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (recoveryStep === 1) {
        // Verificar si el email existe
        const response = await axios.post(`${serverUrl}/check-user`, { email });
        if (response.data.exists) {
          setRecoveryStep(2);
        } else {
          setError('No se encontró ninguna cuenta con ese correo electrónico');
        }
      } else if (recoveryStep === 2) {
        // Verificar código MFA
        const response = await axios.post(`${serverUrl}/verify-recovery-mfa`, {
          email,
          otp
        });
        
        if (response.data.success) {
          setRecoveryStep(3);
        } else {
          setError('Código de verificación inválido');
        }
      } else if (recoveryStep === 3) {
        // Verificar que las contraseñas coincidan
        if (newPassword !== confirmPassword) {
          setError('Las contraseñas no coinciden');
          setLoading(false);
          return;
        }
        
        // Actualizar contraseña
        const response = await axios.post(`${serverUrl}/reset-password`, {
          email,
          otp,
          newPassword
        });
        
        if (response.data.success) {
          alert('Contraseña actualizada correctamente');
          setIsRecoveryMode(false);
          setRecoveryStep(1);
        } else {
          setError('Error al actualizar la contraseña');
        }
      }
    } catch (error) {
      console.error('Error en recuperación:', error);
      setError(error.response?.data?.message || 'Error en el proceso de recuperación');
    } finally {
      setLoading(false);
    }
  };

  // Renderizado para el modo de recuperación
  if (isRecoveryMode) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Recuperación de contraseña</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleRecoverySubmit}>
            {recoveryStep === 1 && (
              <div className="form-group">
                <label htmlFor="recovery-email">Correo electrónico</label>
                <input
                  type="email"
                  id="recovery-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}
            
            {recoveryStep === 2 && (
              <div className="form-group">
                <label htmlFor="recovery-otp">Código de verificación</label>
                <input
                  type="text"
                  id="recovery-otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Ingresa el código de tu aplicación"
                  required
                />
              </div>
            )}
            
            {recoveryStep === 3 && (
              <>
                <div className="form-group">
                  <label htmlFor="new-password">Nueva contraseña</label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirm-password">Confirmar contraseña</label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Continuar'}
            </button>
          </form>
          
          <div className="auth-footer">
            <button 
              onClick={() => {
                setIsRecoveryMode(false);
                setRecoveryStep(1);
                setError('');
              }}
              className="text-button"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado normal para login
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
            <br />
            <button 
              onClick={() => setIsRecoveryMode(true)} 
              className="text-button"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;