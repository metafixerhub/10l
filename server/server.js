const express = require('express');
const cors = require('cors');
const { getClusterStats } = require('./db-manager');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint for fetching all cluster stats
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await getClusterStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching cluster stats:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// A specialised endpoint example to connect an outer website
// Outer websites can fetch this endpoint to embed the stats.
app.get('/api/external/stats-embed', async (req, res) => {
    // We could add authentication/API Key verification here
    try {
        const stats = await getClusterStats();
        // Return a simplified structure for external embedding
        const externalData = stats.map(s => ({
            name: s.clusterName,
            status: s.status,
            storagePercent: s.usedStoragePercent
        }));
        res.json({ success: true, data: externalData });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch data for external source.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
