// // index.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const usuariosRoutes = require('./routes/usuarios');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use('/usuarios', usuariosRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en puerto ${PORT}`);
// });

import express from 'express';

const PORT = process.env.PORT || '3000';

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../public'));
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://${PORT}`);
});