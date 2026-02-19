import { Router } from 'express';
import * as ApiController from '../controllers/api.controller.js';
import { Auth } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.post('/register', ApiController.register);
router.post('/login', ApiController.login);

router.get('/list', Auth.private, ApiController.list);

export default router;