// Inicio de sesión
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    alert('Inicio de sesión exitoso. Bienvenido, ' + user.nombre);
    // Simular sesión
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    alert('Email o contraseña incorrectos');
  }
});