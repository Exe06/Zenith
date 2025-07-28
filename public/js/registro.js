// URL base de tu backend en Railway
const BASE_URL = 'https://tu-backend.railway.app/api/usuarios';

// Registro de usuario
document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const user = {
    rol: document.getElementById('role').value,
    dni: document.getElementById('dni').value,
    apellido: document.getElementById('apellido').value,
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    telefono: document.getElementById('telefono').value,
    codigo_postal: document.getElementById('cp').value,
    provincia: document.getElementById('provincia').value,
    localidad: document.getElementById('localidad').value,
    direccion: document.getElementById('direccion').value
  };

  try {
    const res = await fetch(`${BASE_URL}/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (!res.ok) {
      const error = await res.json();
      alert(`Error: ${error.message || res.statusText}`);
    } else {
      alert('Registro exitoso');
      document.getElementById('registerForm').reset();
    }
  } catch (err) {
    alert('Error de red: ' + err.message);
  }
});

// Inicio de sesión
document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const credentials = {
    email: document.getElementById('loginEmail').value,
    password: document.getElementById('loginPassword').value
  };

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Error: ${data.message || res.statusText}`);
    } else {
      alert(`Inicio de sesión exitoso. Bienvenido, ${data.nombre || 'usuario'}`);
      localStorage.setItem('currentUser', JSON.stringify(data));
    }
  } catch (err) {
    alert('Error de red: ' + err.message);
  }
});

