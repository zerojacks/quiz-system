import express from 'express';
import { getAllIdioms, getIdiomByName, updateIdiom } from '../controllers/idiomController';

const router = express.Router();

router.get('/idioms', getAllIdioms);
router.get('/idiom', getIdiomByName);
router.post('/update-idiom', updateIdiom);

export default router;
