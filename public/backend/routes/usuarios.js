// routes/usuarios.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

// Registro
router.post('/registro', async (req, res) => {
  const {
    rol, dni, apellido, nombre, email,
    password, telefono, codigo_postal,
    provincia, localidad, direccion
  } = req.body;

  try {
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO usuarios (rol, dni, apellido, nombre, email, password, telefono, codigo_postal, provincia, localidad, direccion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [rol, dni, apellido, nombre, email, hashed, telefono, codigo_postal, provincia, localidad, direccion]
    );

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    res.json({ nombre: user.nombre, email: user.email, rol: user.rol });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
