import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { BASE_URL } from '../../config/api';
import '../styles/logs.css'; // Asegúrate de que esta línea esté presente

function Logs() {
  const [logData, setLogData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [failedLogins, setFailedLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedServer, setSelectedServer] = useState('server1');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bar');
  const navigate = useNavigate();

  // URLs de los servidores usando la configuración centralizada
  const serverUrls = {
    server1: 'http://localhost:3000', // Servidor con Rate Limit - Esto debería actualizarse también
    server2: BASE_URL  // Servidor sin Rate Limit
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
    
    const fetchData = async () => {
      try {
        console.log('Obteniendo datos de logs...');
        
        // Obtener resumen de logs
        const logsResponse = await axios.get(`${serverUrl}/logs`);
        setLogData(logsResponse.data);
        
        // Obtener datos por hora
        const hourlyResponse = await axios.get(`${serverUrl}/logs/hourly`);
        setHourlyData(hourlyResponse.data);
        
        // Obtener usuarios con intentos fallidos
        const failedLoginsResponse = await axios.get(`${serverUrl}/logs/failed-logins`);
        setFailedLogins(failedLoginsResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        
        // Si hay un error de autenticación, redirigir al login
        if (error.response && error.response.status === 401) {
          console.log('Error de autenticación, redirigiendo al login');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Error al cargar los datos');
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [navigate]);

  const handleBack = () => {
    navigate('/home');
  };

  // Función para probar el servidor seleccionado
  const testServer = async () => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      const startTime = Date.now();
      const requests = [];
      
      // Realizar 10 peticiones al servidor seleccionado
      for (let i = 0; i < 10; i++) {
        requests.push(axios.get(`${serverUrls[selectedServer]}/ping`));
      }
      
      await Promise.all(requests);
      const endTime = Date.now();
      
      setTestResult({
        success: true,
        message: `Prueba completada exitosamente en ${endTime - startTime}ms`,
        server: selectedServer === 'server1' ? 'Servidor 1 (con Rate Limit)' : 'Servidor 2 (sin Rate Limit)'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Error al probar el servidor',
        server: selectedServer === 'server1' ? 'Servidor 1 (con Rate Limit)' : 'Servidor 2 (sin Rate Limit)'
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Función para simular un ataque de fuerza bruta
  const simulateBruteForce = async () => {
    setTestLoading(true);
    setTestResult(null);
    
    try {
      const startTime = Date.now();
      const requests = [];
      
      // Realizar 50 peticiones al servidor seleccionado
      for (let i = 0; i < 50; i++) {
        requests.push(
          axios.post(`${serverUrls[selectedServer]}/login`, {
            email: `test${i}@example.com`,
            password: 'wrongpassword'
          }).catch(err => {
            // Ignorar errores individuales para continuar con las peticiones
            return { status: err.response?.status || 500 };
          })
        );
      }
      
      await Promise.all(requests);
      const endTime = Date.now();
      
      setTestResult({
        success: true,
        message: `Simulación completada en ${endTime - startTime}ms. Se enviaron 50 peticiones.`,
        server: selectedServer === 'server1' ? 'Servidor 1 (con Rate Limit)' : 'Servidor 2 (sin Rate Limit)'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'Error al simular ataque',
        server: selectedServer === 'server1' ? 'Servidor 1 (con Rate Limit)' : 'Servidor 2 (sin Rate Limit)'
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Configuración para el gráfico de barras comparativo
  const barChartData = {
    labels: ['Total de Logs por Servidor'],
    datasets: [
      {
        label: 'Servidor 1 (con Rate Limit)',
        data: logData ? [logData.server1.info + logData.server1.warn + logData.server1.error] : [0],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Servidor 2 (sin Rate Limit)',
        data: logData ? [logData.server2.info + logData.server2.warn + logData.server2.error] : [0],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Configuración para el gráfico de pastel
  const pieChartData = {
    labels: ['Info', 'Warn', 'Error'],
    datasets: [
      {
        data: logData ? [
          logData.server1.info + logData.server2.info,
          logData.server1.warn + logData.server2.warn,
          logData.server1.error + logData.server2.error
        ] : [0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Configuración para el gráfico de líneas por hora
  const lineChartData = {
    datasets: [
      {
        label: 'Servidor 1 (con Rate Limit)',
        data: hourlyData?.server1 || [],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Servidor 2 (sin Rate Limit)',
        data: hourlyData?.server2 || [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Actividad por hora',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Hora'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de logs'
        },
        ticks: {
          precision: 0
        }
      }
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total de Logs por Servidor',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Distribución de logs por nivel',
      },
    }
  };

  if (loading) {
    return (
      <div className="logs-container">
        <div className="loading-spinner"></div>
        <p>Cargando logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="logs-container">
        <div className="error-message">{error}</div>
        <button onClick={handleBack} className="back-button">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h1>Registros del Sistema</h1>
        <button onClick={handleBack} className="back-button">
          Volver al inicio
        </button>
      </div>

      <div className="logs-description">
        <p>Esta página muestra un análisis comparativo de los logs generados por los servidores.</p>
        <p><strong>Servidor 1:</strong> Implementa Rate Limit (100 peticiones cada 10 minutos)</p>
        <p><strong>Servidor 2:</strong> No implementa Rate Limit</p>
      </div>

      {/* Sección para interactuar con los servidores */}
      <div className="server-interaction">
        <h2>Interacción con Servidores</h2>
        
        <div className="server-selector">
          <label htmlFor="server-select">Seleccionar servidor:</label>
          <select 
            id="server-select" 
            value={selectedServer} 
            onChange={(e) => setSelectedServer(e.target.value)}
          >
            <option value="server1">Servidor 1 (con Rate Limit)</option>
            <option value="server2">Servidor 2 (sin Rate Limit)</option>
          </select>
        </div>
        
        <div className="server-actions">
          <button 
            className="action-button test-button" 
            onClick={testServer}
            disabled={testLoading}
          >
            {testLoading ? 'Probando...' : 'Probar Servidor'}
          </button>
          
          <button 
            className="action-button simulate-button" 
            onClick={simulateBruteForce}
            disabled={testLoading}
          >
            {testLoading ? 'Simulando...' : 'Simular Ataque de Fuerza Bruta'}
          </button>
        </div>
        
        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <h3>Resultado de la prueba</h3>
            <p><strong>Servidor:</strong> {testResult.server}</p>
            <p><strong>Resultado:</strong> {testResult.message}</p>
          </div>
        )}
      </div>

      {/* Pestañas para diferentes tipos de gráficos */}
      <div className="chart-wrapper">
        <div className="chart-tabs">
          <div 
            className={`chart-tab ${activeTab === 'bar' ? 'active' : ''}`}
            onClick={() => setActiveTab('bar')}
          >
            Gráfica de Barras
          </div>
          <div 
            className={`chart-tab ${activeTab === 'pie' ? 'active' : ''}`}
            onClick={() => setActiveTab('pie')}
          >
            Gráfica de Pastel
          </div>
          <div 
            className={`chart-tab ${activeTab === 'line' ? 'active' : ''}`}
            onClick={() => setActiveTab('line')}
          >
            Actividad por Hora
          </div>
        </div>

        {activeTab === 'bar' && (
          <div className="chart">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        )}

        {activeTab === 'pie' && (
          <div className="chart">
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        )}

        {activeTab === 'line' && (
          <div className="hourly-chart-container">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        )}
      </div>

      {/* Tabla de usuarios con más intentos fallidos */}
      <div className="chart-wrapper">
        <h2>Usuarios con más intentos fallidos de login</h2>
        
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Intentos fallidos</th>
                <th>Último intento</th>
                <th>Servidor</th>
              </tr>
            </thead>
            <tbody>
              {failedLogins.length > 0 ? (
                failedLogins.map((user, index) => (
                  <tr key={index}>
                    <td>{user.email}</td>
                    <td className={user.attempts > 5 ? 'high-attempts' : ''}>
                      {user.attempts}
                    </td>
                    <td>{new Date(user.lastAttempt).toLocaleString()}</td>
                    <td>{user.server === 'server1' ? 'Servidor 1 (con Rate Limit)' : 'Servidor 2 (sin Rate Limit)'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No hay datos de intentos fallidos</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen de logs por servidor */}
      <div className="charts-row">
        <div className="chart-wrapper half">
          <h2>Servidor 1 (con Rate Limit)</h2>
          <div className="log-summary">
            <div className="log-stat">
              <span className="log-label">Info:</span>
              <span className="log-value">{logData?.server1.info || 0}</span>
            </div>
            <div className="log-stat">
              <span className="log-label">Warn:</span>
              <span className="log-value">{logData?.server1.warn || 0}</span>
            </div>
            <div className="log-stat">
              <span className="log-label">Error:</span>
              <span className="log-value">{logData?.server1.error || 0}</span>
            </div>
          </div>
        </div>

        <div className="chart-wrapper half">
          <h2>Servidor 2 (sin Rate Limit)</h2>
          <div className="log-summary">
            <div className="log-stat">
              <span className="log-label">Info:</span>
              <span className="log-value">{logData?.server2.info || 0}</span>
            </div>
            <div className="log-stat">
              <span className="log-label">Warn:</span>
              <span className="log-value">{logData?.server2.warn || 0}</span>
            </div>
            <div className="log-stat">
              <span className="log-label">Error:</span>
              <span className="log-value">{logData?.server2.error || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;