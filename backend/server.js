require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware
const FRONTEND_URL = process.env.CORS_ORIGIN || 'http://localhost:8080';
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Mock Database
let users = [];
let tokens = [];

// Routes
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;

    if (users.some(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = { id: users.length + 1, username, email, password };
    users.push(user);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    res.status(201).json({ token, user: { username, email } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

    res.json({ token, user: { username: user.username, email: user.email } });
});

app.get('/api/validate', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true });
    } catch {
        res.status(401).json({ valid: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));