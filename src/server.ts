import dotenv from 'dotenv';
import express from 'express';
import type { Express } from 'express';
import cors from 'cors';

import apiRoute from './routes/api.route.js';
import { notFound } from './controllers/404.controller.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { ping } from './controllers/api.controller.js';

dotenv.config();

const app: Express = express();

app.use(cors());

app.use(express.json());

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/ping', ping);

app.use(apiRoute);
app.use(notFound);

app.use(errorHandler);

app.listen(process.env.PORT ?? 3000, (): void => {
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
});