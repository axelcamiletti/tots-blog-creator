import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import articlesRoutes from './routes/articles';
import openaiRoutes from './routes/openai';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// CORS - permitir requests desde el frontend
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'http://localhost:4200', // Para desarrollo local
    'https://tots-blog-creator-frontend.onrender.com' // Para producción
];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir requests sin origin (como aplicaciones móviles o Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Logging
app.use(morgan('combined'));

// Parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'tots-blog-backend'
    });
});

// API Routes
app.use('/api/articles', articlesRoutes);
app.use('/api/openai', openaiRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Error handler global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error handler:', err);
    
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 TOTS Blog Backend running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 API Base: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
