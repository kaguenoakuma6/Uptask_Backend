import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import { corsConfig } from './config/cors';


dotenv.config();

connectDB();

const app = express();

// Se habilita el uso de cors para filtrar las peticiones
app.use(cors(corsConfig));

//Logeo de las consultas
app.use(morgan('dev'));

// Habilitar el uso de JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

export default app;