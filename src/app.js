import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import methodOverride from 'method-override';
import session from 'express-session';

import { checkConnection } from './utils/checkConnection.js';
import userLogged from './middlewares/userLogged.js';
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

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
}));
app.use(userLogged);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

checkConnection();

app.use("/", indexRoutes);
app.use("/property", propertyRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
  res.status(404).redirect('/');
});