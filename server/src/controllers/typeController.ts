import { Request, Response } from 'express';
import pool from '../config/database';
import { MajorType, MinorType } from '../types';

export const createMajorType = async (req: Request, res: Response) => {
    try {
        const { type_code, type_name, description } = req.body as MajorType;

        if (!type_code || !type_name) {
            return res.status(400).json({ message: 'Type code and name are required' });
        }

        await pool.query(
            'INSERT INTO major_types (type_code, type_name, description) VALUES (?, ?, ?)',
            [type_code, type_name, description]
        );

        res.status(201).json({ message: 'Major type created successfully' });
    } catch (error) {
        console.error('Error creating major type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateMajorType = async (req: Request, res: Response) => {
    try {
        const { typeCode } = req.params;
        const { type_name, description } = req.body as MajorType;

        if (!type_name) {
            return res.status(400).json({ message: 'Type name is required' });
        }

        const [result] = await pool.query(
            'UPDATE major_types SET type_name = ?, description = ? WHERE type_code = ?',
            [type_name, description, typeCode]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: 'Major type not found' });
        }

        res.json({ message: 'Major type updated successfully' });
    } catch (error) {
        console.error('Error updating major type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createMinorType = async (req: Request, res: Response) => {
    try {
        const { type_code, major_type_code, type_name, description } = req.body as MinorType;

        if (!type_code || !major_type_code || !type_name) {
            return res.status(400).json({ message: 'Type code, major type code, and name are required' });
        }

        // 检查major_type是否存在
        const [majorTypes] = await pool.query(
            'SELECT type_code FROM major_types WHERE type_code = ?',
            [major_type_code]
        );

        if (!Array.isArray(majorTypes) || majorTypes.length === 0) {
            return res.status(400).json({ message: 'Major type does not exist' });
        }

        await pool.query(
            'INSERT INTO minor_types (type_code, major_type_code, type_name, description) VALUES (?, ?, ?, ?)',
            [type_code, major_type_code, type_name, description]
        );

        res.status(201).json({ message: 'Minor type created successfully' });
    } catch (error) {
        console.error('Error creating minor type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateMinorType = async (req: Request, res: Response) => {
    try {
        const { typeCode } = req.params;
        const { type_name, description } = req.body as MinorType;

        if (!type_name) {
            return res.status(400).json({ message: 'Type name is required' });
        }

        const [result] = await pool.query(
            'UPDATE minor_types SET type_name = ?, description = ? WHERE type_code = ?',
            [type_name, description, typeCode]
        );

        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ message: 'Minor type not found' });
        }

        res.json({ message: 'Minor type updated successfully' });
    } catch (error) {
        console.error('Error updating minor type:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
