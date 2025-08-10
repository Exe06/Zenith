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
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import methodOverride from 'method-override';
import { checkConnection } from './utils/checkConnection.js';
import indexRoutes from './routes/index.js';
import userRoutes from './routes/user.js';
import propertyRoutes from './routes/property.js';

const app = express();
const PORT = process.env.PORT;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../public')));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use("/", indexRoutes);
app.use("/user", userRoutes);
app.use("/property", propertyRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

checkConnection();