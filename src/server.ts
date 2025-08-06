import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db';
import projectRoutes from './routes/projectRoutes';
import { corsConfig } from './config/cors';


dotenv.config();

connectDB();

const app = express();

// Se habilita el uso de cors para filtrar las peticiones
app.use(cors(corsConfig));

// Habilitar el uso de JSON
app.use(express.json());

// Rutas 
app.use('/api/projects', projectRoutes);

export default app;