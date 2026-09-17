const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Parent directory where the .env files are located
const parentDir = path.join(__dirname, '..');

// Function to read connections from Environment Variables (Render) or local files (Local)
function getConnections() {
    const connections = [];

    // 1. Check Render Environment Variables first (MONGODB_URI_1, MONGODB_URI_2, etc.)
    for (let i = 1; i <= 10; i++) {
        const envUri = process.env[`MONGODB_URI_${i}`];
        if (envUri) {
            connections.push({
                file: `Render Env Var ${i}`,
                uri: envUri
            });
        }
    }

    // If Render environment variables are found, use them!
    if (connections.length > 0) {
        return connections;
    }

    // 2. Fallback: Read local .env files (for local testing)
    try {
        const files = fs.readdirSync(parentDir);
        const envFiles = files.filter(file => file.startsWith('atlas-credentials') && file.endsWith('.env'));
        
        envFiles.forEach(file => {
            const filePath = path.join(parentDir, file);
            const envConfig = dotenv.parse(fs.readFileSync(filePath));
            if (envConfig.MONGODB_URI) {
                connections.push({
                    file: file,
                    uri: envConfig.MONGODB_URI
                });
            }
        });
    } catch (err) {
        console.warn("Could not read local .env files.");
    }
    
    return connections;
}

async function getClusterStats() {
    const connections = getConnections();
    const stats = [];

    // To prevent long loading times, we connect to them concurrently but with a timeout
    const promises = connections.map(async (conn, index) => {
        const { file, uri } = conn;

        if (!uri) {
            return {
                clusterName: `Cluster ${index + 1}`,
                status: 'Error',
                usedStoragePercent: 0,
                error: 'No URI found'
            };
        }

        const client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        try {
            await client.connect();
            const db = client.db('admin');
            
            // Get actual storage stats
            let usedPercent = 0;
            try {
                // client.db() without arguments uses the default database from the URI
                const defaultDb = client.db();
                const dbStats = await defaultDb.command({ dbStats: 1 });
                
                // Atlas Free Tier limit (Updated to 513MB as requested)
                const maxStorageBytes = 513 * 1024 * 1024;
                if (dbStats.dataSize) {
                    usedPercent = parseFloat(((dbStats.dataSize / maxStorageBytes) * 100).toFixed(2));
                }
            } catch (err) {
                console.warn(`Failed to get real stats for ${file}, defaulting to 0%:`, err.message);
                usedPercent = 0; // Default to 0% if empty or unauthorized
            }

            return {
                clusterName: `Cluster ${index + 1}`,
                file: file,
                status: 'Online',
                usedStoragePercent: usedPercent
            };
        } catch (error) {
            console.error(`Failed to connect to ${file}:`, error.message);
            return {
                clusterName: `Cluster ${index + 1}`,
                file: file,
                status: 'Offline',
                usedStoragePercent: 0,
                error: error.message
            };
        } finally {
            await client.close();
        }
    });

    const results = await Promise.allSettled(promises);
    return results.map(r => r.status === 'fulfilled' ? r.value : { status: 'Error', error: 'Promise rejected' });
}

// Function to push data directly to a specific cluster
async function pushData(clusterIndex, dbName, collectionName, payload) {
    const connections = getConnections();
    // Validate cluster index (1-based index)
    if (clusterIndex < 1 || clusterIndex > connections.length) {
        throw new Error(`Invalid cluster index. Must be between 1 and ${connections.length}`);
    }

    const uri = connections[clusterIndex - 1].uri;
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Insert the data (can be single object or array of objects)
        let result;
        if (Array.isArray(payload)) {
            result = await collection.insertMany(payload);
        } else {
            result = await collection.insertOne(payload);
        }
        
        return { success: true, result };
    } finally {
        await client.close();
    }
}

module.exports = {
    getClusterStats,
    pushData
};
