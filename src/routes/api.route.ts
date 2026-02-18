import { Router } from 'express';
import * as ApiController from '../controllers/api.controller.js';

const router: Router = Router();

router.post('/register', ApiController.register);
router.post('/login', ApiController.login);

router.get('/list', ApiController.list);

export default router;