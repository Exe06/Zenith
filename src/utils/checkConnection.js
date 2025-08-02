import db from '../database/models/index.cjs';// ajustá la ruta si está en otro lugar

export async function checkConnection() {
  try {
    await db.sequelize.authenticate();  
    console.log('✅ Conexión establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};