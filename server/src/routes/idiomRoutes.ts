import express from 'express';
import { getAllIdioms, getIdiomByName } from '../controllers/idiomController';

const router = express.Router();

router.get('/idioms', getAllIdioms);
router.get('/idiom', getIdiomByName);

export default router;
