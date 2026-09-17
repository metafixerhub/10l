import React from 'react';

const ApiDocumentation = () => {
  return (
    <div className="card doc-card">
      <h2>API Integration Documentation</h2>
      <p className="doc-intro">
        Learn how to securely connect your external websites and backends directly to this server to read metrics or push data into your MongoDB clusters.
      </p>

      <div className="doc-section">
        <h3>1. How to READ the Database Stats (External Link)</h3>
        <p>If you have an outer website and want to display live dashboard stats, send a GET request to the Server.</p>
        
        <div className="endpoint-box">
          <span className="method get">GET</span>
          <code>https://one0l-server-point-234567.onrender.com/api/external/stats-embed</code>
        </div>
        
        <h4>Example Fetch (Frontend)</h4>
        <pre className="code-block">
          <code>{`fetch('https://one0l-server-point-234567.onrender.com/api/external/stats-embed')
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      console.log("Cluster 1 Stats:", data.data[0]); 
    }
  });`}</code>
        </pre>
      </div>

      <div className="doc-section">
        <h3>2. How to PUSH Data Directly into Clusters</h3>
        <p>This custom API allows an outer backend to push data into any of your 10 clusters without exposing MongoDB passwords.</p>
        
        <div className="endpoint-box">
          <span className="method post">POST</span>
          <code>https://one0l-server-point-234567.onrender.com/api/external/push-data</code>
        </div>

        <h4>Required JSON Body</h4>
        <ul className="doc-list">
          <li><strong>clusterIndex</strong>: A number from 1 to 10 (e.g., 1 for your first cluster).</li>
          <li><strong>dbName</strong>: The name of the database (e.g., "ShopDB").</li>
          <li><strong>collectionName</strong>: The collection folder (e.g., "users").</li>
          <li><strong>payload</strong>: The JSON data to save (single object or array of objects).</li>
        </ul>

        <h4>Example Axios (Node.js Backend)</h4>
        <pre className="code-block">
          <code>{`const axios = require('axios');

async function saveNewUser() {
  const response = await axios.post('https://one0l-server-point-234567.onrender.com/api/external/push-data', {
    clusterIndex: 3,                 // Pick a cluster
    dbName: "ShopDB",                // Target Database name
    collectionName: "users",         // Target Collection name
    payload: { name: "John", role: "admin" } // Your JSON data
  });

  if (response.data.success) {
    console.log("Success! Insert ID:", response.data.result.insertedId);
  }
}`}</code>
        </pre>
      </div>
    </div>
  );
};

export default ApiDocumentation;
