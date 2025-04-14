// server.js
import express from 'express';
import cors from 'cors';
import productsHandler from './api/products.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Ruta activa para productos
app.get('/api/products', (req, res) => {
  productsHandler(req, res);
});

// Ruta base (opcional)
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
