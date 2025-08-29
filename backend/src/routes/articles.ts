import { Router } from 'express';
import { ArticlesController } from '../controllers/articlesController';

const router = Router();
const articlesController = new ArticlesController();

// GET /api/articles - Obtener todos los artículos
router.get('/', (req, res) => articlesController.getArticles(req, res));

// GET /api/articles/:id - Obtener un artículo específico
router.get('/:id', (req, res) => articlesController.getArticleById(req, res));

// POST /api/articles/generate - Generar nuevo artículo
router.post('/generate', (req, res) => articlesController.generateArticle(req, res));

// POST /api/articles/test-image - Test generación de imágenes (DEBUG)
router.post('/test-image', (req, res) => articlesController.testImageGeneration(req, res));

// PUT /api/articles/:id - Actualizar artículo
router.put('/:id', (req, res) => articlesController.updateArticle(req, res));

// DELETE /api/articles/:id - Eliminar artículo
router.delete('/:id', (req, res) => articlesController.deleteArticle(req, res));

export default router;
