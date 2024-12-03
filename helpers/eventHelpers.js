const fs = require('fs');
const path = require('path');

// Add Event
const addEvent = (events, title, description, time) => {
    const event = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        description,
        time: time.toISOString(),
    };
    events.push(event);
    events.sort((a, b) => new Date(a.time) - new Date(b.time)); // Sort by time
    return event;
};

// Get Events
const getEvents = (events) => {
    const now = new Date();
    return events.filter(event => new Date(event.time) > now);
};

// Save Completed Event
const saveCompletedEvent = (event) => {
    const filePath = path.join(__dirname, '../data/completed_events.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        const events = err ? [] : JSON.parse(data || '[]');
        events.push(event);
        fs.writeFile(filePath, JSON.stringify(events, null, 2), (err) => {
            if (err) console.error('Error saving completed event:', err);
        });
    });
};

module.exports = { addEvent, getEvents, saveCompletedEvent };
