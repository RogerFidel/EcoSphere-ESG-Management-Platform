const express = require('express');
const router = express.Router();
const { sseClients } = require('../config/redis');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// GET /sse — Server-Sent Events for real-time notifications
router.get('/', (req, res) => {
  // Authenticate via token query param (SSE doesn't support custom headers from browser)
  const token = req.query.token;
  if (!token) return res.status(401).json({ error: 'Token required.' });

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time notifications active' })}\n\n`);

  // Register client
  if (!sseClients.has(userId)) {
    sseClients.set(userId, new Set());
  }
  sseClients.get(userId).add(res);
  logger.info(`SSE: Client connected - User ${userId} (total: ${sseClients.get(userId).size})`);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch (err) {
      clearInterval(heartbeat);
    }
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    const clients = sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) sseClients.delete(userId);
    }
    logger.info(`SSE: Client disconnected - User ${userId}`);
  });
});

module.exports = router;
