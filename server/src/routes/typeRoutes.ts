import express from 'express';
import {
    createMajorType,
    updateMajorType,
    createMinorType,
    updateMinorType,
    getAllMinorTypes,
    getMinorTypesByMajor,
    getAllMajorTypes,
    getMajorTypeByCode
} from '../controllers/typeController';

const router = express.Router();

// Major type routes
router.get('/idiom_major_types', getAllMajorTypes);
router.get('/idiom_major_types/:typeCode', getMajorTypeByCode);
router.post('/major-types', createMajorType);
router.put('/major-types/:typeCode', updateMajorType);

// Minor type routes
router.get('/idiom_minor_types', getAllMinorTypes);
router.get('/idiom_minor_types/:typeCode', getMinorTypesByMajor);
router.post('/minor-types', createMinorType);
router.put('/minor-types/:typeCode', updateMinorType);

export default router;
