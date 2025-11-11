import app from './infrastructure/server/server.js';

const PORT = process.env.PORT || 3001; // Use 3001 for the backend

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});