require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Route /api/:fn  →  api/:fn.js handler
app.all('/api/:fn', async (req, res) => {
  try {
    const fn = require(path.join(__dirname, 'api', req.params.fn));
    const event = {
      httpMethod: req.method,
      path: req.path,
      headers: req.headers,
      body: JSON.stringify(req.body),
    };
    const result = await fn.handler(event);
    res
      .status(result.statusCode || 200)
      .set(result.headers || { 'Content-Type': 'application/json' })
      .send(result.body);
  } catch (err) {
    console.error(`[api/${req.params.fn}]`, err.message);
    res.status(500).json({ error: 'Function error', detail: err.message });
  }
});

// Serve static site files
app.use(express.static(__dirname, {
  index: 'index.html',
  dotfiles: 'ignore',
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Site:  http://localhost:${PORT}`);
  console.log(`  API:   http://localhost:${PORT}/api/chat\n`);
});
