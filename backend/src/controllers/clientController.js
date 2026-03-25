const { db } = require('../firebaseClient');

// Helper to sanitize client data (mask secrets)
const sanitizeClient = (client) => {
    const sanitized = { ...client };
    if (sanitized.meta) {
        delete sanitized.meta.accessToken;
        delete sanitized.meta.appSecret;
    }
    if (sanitized.google) {
        delete sanitized.google.clientSecret;
        delete sanitized.google.refreshToken;
        delete sanitized.google.developerToken;
    }
    return sanitized;
};

// GET /api/clients
exports.getClients = async (req, res) => {
    try {
        if (!db) throw new Error("Database not connected");
        const snapshot = await db.collection('clients').get();
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...sanitizeClient(doc.data()) }));
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/clients/:id
exports.getClientByClientId = async (req, res) => {
    try {
        if (!db) throw new Error("Database not connected");
        const doc = await db.collection('clients').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ error: 'Client not found' });
        res.json({ id: doc.id, ...doc.data() }); // Returns full data for internal use (or with auth)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/clients
exports.createClient = async (req, res) => {
    try {
        if (!db) throw new Error("Database not connected");
        const { clientId, ...clientData } = req.body;
        if (!clientId) return res.status(400).json({ error: 'clientId is required' });

        await db.collection('clients').doc(clientId).set({
            ...clientData,
            clientId,
            createdAt: new Date().toISOString()
        });
        res.status(201).json({ message: 'Client created', clientId });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PUT /api/clients/:id
exports.updateClient = async (req, res) => {
    try {
        if (!db) throw new Error("Database not connected");
        await db.collection('clients').doc(req.params.id).update(req.body);
        res.json({ message: 'Client updated' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// DELETE /api/clients/:id
exports.deleteClient = async (req, res) => {
    try {
        if (!db) throw new Error("Database not connected");
        await db.collection('clients').doc(req.params.id).delete();
        res.json({ message: 'Client deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
