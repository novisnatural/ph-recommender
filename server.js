// server.js
import express from 'express';
import productsRoute from './api/products.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/products', productsRoute);

app.get('/', (req, res) => {
  res.send('Backend de perfumes activo');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
