import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DbBarChart from './components/DbBarChart';
import ApiDocumentation from './components/ApiDocumentation';
import './index.css';

function App() {
  const [dbData, setDbData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from our deployed Node.js backend on Render
    axios.get('https://one0l-server-point-234567.onrender.com/api/stats')
      .then(response => {
        if (response.data.success) {
          setDbData(response.data.data);
        } else {
          setError('Failed to fetch data from backend');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Error connecting to the backend server. Is it running?');
        setLoading(false);
      });
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">MongoDB Atlas Dashboard</h1>
        <p className="subtitle">Real-time Storage Usage Across 10 Clusters</p>
      </header>
      
      <main className="main-content">
        <div className="card chart-card">
          <h2>Storage Usage Analysis</h2>
          {loading ? (
            <div className="loading-state">
               <div className="spinner"></div>
               <p>Connecting to clusters...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : (
            <DbBarChart data={dbData} />
          )}
        </div>

        {!loading && !error && (
          <>
            <div className="card stats-card">
              <h2>Cluster Status Summary</h2>
              <div className="status-grid">
                {dbData.map((db, idx) => (
                  <div key={idx} className={`status-item ${db.status === 'Online' ? 'online' : 'offline'}`}>
                    <span className="status-indicator"></span>
                    <div className="status-info">
                      <strong>{db.clusterName}</strong>
                      <span className="file-name">{db.file}</span>
                    </div>
                    <span className="storage-badge">{db.usedStoragePercent}% Used</span>
                  </div>
                ))}
              </div>
            </div>
            
            <ApiDocumentation />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
