import { Router } from 'express';
import { OpenAIController } from '../controllers/openaiController';

const router = Router();

/**
 * @route GET /api/openai/credits
 * @desc Obtiene los créditos actuales de OpenAI
 * @access Public
 */
router.get('/credits', OpenAIController.getCredits);

/**
 * @route POST /api/openai/credits/refresh
 * @desc Actualiza y obtiene los créditos de OpenAI
 * @access Public
 */
router.post('/credits/refresh', OpenAIController.refreshCredits);

/**
 * @route POST /api/openai/credits/update
 * @desc Actualiza manualmente los valores de crédito
 * @access Public
 */
router.post('/credits/update', OpenAIController.updateCredits);

export default router;
