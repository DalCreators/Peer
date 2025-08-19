const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = createServer(app);
// Allow multiple origins for CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://peer-kohl.vercel.app",
  "https://peer-ashen.vercel.app", 
  process.env.CLIENT_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Store active rooms and their documents
const rooms = new Map();

// Store voice chat participants by room
const voiceRooms = new Map();

// Store room members by room (for presence tracking)
const roomMembers = new Map();

// Store chat messages by room
const roomMessages = new Map();

// Store diagram data by room
const roomDiagrams = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
    
    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: '// Welcome to collaborative coding!\nconsole.log("Hello World");',
        language: 'javascript'
      });
    }

    // Initialize diagram for room if it doesn't exist
    if (!roomDiagrams.has(roomId)) {
      roomDiagrams.set(roomId, {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 }
      });
    }
    
    // Send current room state to the joining user
    socket.emit('room-state', rooms.get(roomId));
    // Send current diagram state to the joining user
    socket.emit('diagram-state', roomDiagrams.get(roomId));
  });
// Handle code changes
socket.on('code-change', (data) => {
  const { roomId, code, language } = data;
  
  // Update room state
  if (rooms.has(roomId)) {
    rooms.set(roomId, { code, language: language || rooms.get(roomId).language });
  }
  
  // Broadcast to all other users in the room
  socket.to(roomId).emit('code-change', data);
});

// Handle language changes
socket.on('language-change', (data) => {
  const { roomId, language } = data;
  
  // Update room state
  if (rooms.has(roomId)) {
    const roomData = rooms.get(roomId);
    rooms.set(roomId, { ...roomData, language });
  }
  
  // Broadcast to all other users in the room
  socket.to(roomId).emit('language-change', data);
});
})