import React, { useState } from 'react';
import axios from 'axios';

const PushDataForm = () => {
  const [formData, setFormData] = useState({
    clusterIndex: 1,
    dbName: 'ShopDB',
    collectionName: 'users',
    payload: '{\n  "name": "Test User",\n  "role": "admin"\n}'
  });
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(formData.payload);
    } catch (err) {
      setStatus({ loading: false, success: null, error: 'Invalid JSON payload format.' });
      return;
    }

    try {
      const response = await axios.post('https://one0l-server-point-234567.onrender.com/api/external/push-data', {
        clusterIndex: parseInt(formData.clusterIndex, 10),
        dbName: formData.dbName,
        collectionName: formData.collectionName,
        payload: parsedPayload
      });

      if (response.data.success) {
        setStatus({ loading: false, success: 'Data pushed successfully!', error: null });
      } else {
        setStatus({ loading: false, success: null, error: response.data.error || 'Failed to push data.' });
      }
    } catch (err) {
      setStatus({ loading: false, success: null, error: err.response?.data?.error || 'Network error.' });
    }
  };

  return (
    <div className="card form-card">
      <h2>Push Data to Cluster</h2>
      <p className="form-subtitle">Use this tool to manually insert JSON data directly into any database.</p>
      
      <form onSubmit={handleSubmit} className="push-form">
        <div className="form-group-row">
          <div className="form-group">
            <label>Cluster (1-10)</label>
            <select name="clusterIndex" value={formData.clusterIndex} onChange={handleChange} className="form-input">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>Cluster {num}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Database Name</label>
            <input type="text" name="dbName" value={formData.dbName} onChange={handleChange} className="form-input" required />
          </div>
          
          <div className="form-group">
            <label>Collection Name</label>
            <input type="text" name="collectionName" value={formData.collectionName} onChange={handleChange} className="form-input" required />
          </div>
        </div>
        
        <div className="form-group">
          <label>JSON Payload</label>
          <textarea 
            name="payload" 
            value={formData.payload} 
            onChange={handleChange} 
            className="form-input payload-input" 
            rows="5"
            required 
          />
        </div>
        
        <button type="submit" className="submit-btn" disabled={status.loading}>
          {status.loading ? 'Pushing...' : 'Push Data'}
        </button>
      </form>

      {status.success && <div className="status-message success-message">{status.success}</div>}
      {status.error && <div className="status-message error-message">{status.error}</div>}
    </div>
  );
};

export default PushDataForm;
