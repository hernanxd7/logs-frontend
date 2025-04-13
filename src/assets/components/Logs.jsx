import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { BASE_URL } from '../../config/api';
import '../styles/logs.css'; // Asegúrate de que esta línea esté presente

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

function Logs() {
  const [logData, setLogData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  // Agregar nuevo estado para los datos de métodos HTTP
  const [methodsData, setMethodsData] = useState({
    server1: { GET: 0, POST: 0, PUT: 0, DELETE: 0, OTHER: 0 },
    server2: { GET: 0, POST: 0, PUT: 0, DELETE: 0, OTHER: 0 }
  });
  // Agregar estados para controlar las actualizaciones
  const [lastHourlyUpdate, setLastHourlyUpdate] = useState(0);
  const [lastMethodsUpdate, setLastMethodsUpdate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('bar');
  const navigate = useNavigate();

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
        
        // Obtener datos por hora - reducir frecuencia
        if (!hourlyData || Date.now() - lastHourlyUpdate > 60000) { // Actualizar cada minuto
          const hourlyResponse = await axios.get(`${serverUrl}/logs/hourly`);
          setHourlyData(hourlyResponse.data);
          setLastHourlyUpdate(Date.now());
        }
        
        // Obtener datos de métodos HTTP - reducir frecuencia
        if (!methodsData.server1.GET || Date.now() - lastMethodsUpdate > 300000) { // Actualizar cada 5 minutos
          const methodsResponse1 = await axios.get('http://localhost:3000/logs/methods');
          const methodsResponse2 = await axios.get('http://localhost:3001/logs/methods');
          
          setMethodsData({
            server1: methodsResponse1.data || { GET: 0, POST: 0, PUT: 0, DELETE: 0, OTHER: 0 },
            server2: methodsResponse2.data || { GET: 0, POST: 0, PUT: 0, DELETE: 0, OTHER: 0 }
          });
          setLastMethodsUpdate(Date.now());
        }
        
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
    // Aumentar el intervalo de actualización a 30 segundos en lugar de 5
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleBack = () => {
    navigate('/home');
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

  // Configuración para el gráfico de métodos HTTP
  const methodsChartData = {
    labels: ['GET', 'POST', 'PUT', 'DELETE', 'OTROS'],
    datasets: [
      {
        label: 'Servidor 1 (con Rate Limit)',
        data: [
          methodsData.server1.GET || 0,
          methodsData.server1.POST || 0,
          methodsData.server1.PUT || 0,
          methodsData.server1.DELETE || 0,
          methodsData.server1.OTHER || 0
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Servidor 2 (sin Rate Limit)',
        data: [
          methodsData.server2.GET || 0,
          methodsData.server2.POST || 0,
          methodsData.server2.PUT || 0,
          methodsData.server2.DELETE || 0,
          methodsData.server2.OTHER || 0
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
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

  const methodsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tipos de Peticiones HTTP',
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
          <div 
            className={`chart-tab ${activeTab === 'methods' ? 'active' : ''}`}
            onClick={() => setActiveTab('methods')}
          >
            Métodos HTTP
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

        {activeTab === 'methods' && (
          <div className="chart">
            <Bar data={methodsChartData} options={methodsChartOptions} />
          </div>
        )}
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