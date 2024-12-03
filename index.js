const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const cron = require('node-cron');
const { addEvent, getEvents, saveCompletedEvent } = require('./helpers/eventHelpers');

const app = express();
const PORT = 3000;
const wss = new WebSocket.Server({ noServer: true });

app.use(bodyParser.json());

let events = []; // In-memory storage for events
let clients = []; // Connected WebSocket clients

// API Endpoints
app.post('/events', (req, res) => {
    const { title, description, time } = req.body;
    if (!title || !description || !time) {
        return res.status(400).send('Title, description, and time are required.');
    }
    const event = addEvent(events, title, description, new Date(time));
    res.status(201).json(event);
});

app.get('/events', (req, res) => {
    res.json(getEvents(events));
});

// WebSocket Integration
wss.on('connection', (ws) => {
    clients.push(ws);
    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});

// Server Upgrade for WebSocket
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Cron Job for Notifications
cron.schedule('* * * * *', () => {
    const now = new Date();
    events.forEach((event) => {
        const timeDiff = (new Date(event.time) - now) / 60000;
        if (timeDiff > 0 && timeDiff <= 5) {
            // Notify clients about the event
            clients.forEach((client) => client.send(`Event Starting Soon: ${event.title}`));
        }
        if (timeDiff <= 0) {
            // Mark event as completed
            saveCompletedEvent(event);
            events = events.filter(e => e.id !== event.id);
        }
    });
});
