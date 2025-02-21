import express from 'express';
import {
    createMajorType,
    updateMajorType,
    createMinorType,
    updateMinorType
} from '../controllers/typeController';

const router = express.Router();

router.post('/major-types', createMajorType);
router.put('/major-types/:typeCode', updateMajorType);
router.post('/minor-types', createMinorType);
router.put('/minor-types/:typeCode', updateMinorType);

export default router;
