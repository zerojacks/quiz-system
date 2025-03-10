import { Request, Response } from 'express';
import pool from '../config/database';
import { Idiom } from '../types';

export const getAllIdioms = async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(
            'SELECT idiom, description, examples, exam_images, major_type_code, minor_type_code FROM idioms ORDER BY major_type_code'
        );

        const idioms = (rows as any[]).map(row => ({
            idiom: row.idiom,
            description: row.description,
            examples: JSON.parse(row.examples),
            examImages: row.exam_images ? JSON.parse(row.exam_images) : [],
            major_type_code: row.major_type_code,
            minor_type_code: row.minor_type_code,
        }));

        res.json(idioms);
    } catch (error) {
        console.error('Error fetching idioms:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getIdiomByName = async (req: Request, res: Response) => {
    try {
        const { idiom } = req.query;

        if (!idiom) {
            return res.status(400).json({ message: 'Idiom parameter is required' });
        }

        const [rows] = await pool.query(
            'SELECT idiom, description, examples, exam_images, major_type_code, minor_type_code FROM idioms WHERE idiom = ?',
            [idiom]
        );

        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(404).json({ message: 'Idiom not found' });
        }

        const row = rows[0] as any;
        const idiomData = {
            idiom: row.idiom,
            description: row.description,
            examples: JSON.parse(row.examples),
            examImages: row.exam_images ? JSON.parse(row.exam_images) : [],
            major_type_code: row.major_type_code,
            minor_type_code: row.minor_type_code,
        };

        res.json(idiomData);
    } catch (error) {
        console.error('Error fetching idiom:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateIdiom = async (req: Request, res: Response) => {
    try {
        const { idiom, description, examples, examImages, majorTypeCode, minorTypeCode } = req.body;

        if (!idiom) {
            return res.status(400).json({ message: 'Idiom is required' });
        }

        // 检查成语是否存在
        const [existingIdiom] = await pool.query(
            'SELECT idiom FROM idioms WHERE idiom = ?',
            [idiom]
        );

        if (!Array.isArray(existingIdiom) || existingIdiom.length === 0) {
            // 如果成语不存在，插入新成语
            await pool.query(
                `INSERT INTO idioms (idiom, description, examples, exam_images, major_type_code, minor_type_code) 
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    idiom,
                    description,
                    JSON.stringify(examples),
                    examImages ? JSON.stringify(examImages) : null,
                    majorTypeCode || null,
                    minorTypeCode || null
                ]
            );

            return res.json({ success: true, message: '成语已插入' });
        }

        // 如果存在，执行更新
        await pool.query(
            `UPDATE idioms 
            SET description = ?, 
                examples = ?,
                exam_images = ?,
                major_type_code = ?,
                minor_type_code = ?
            WHERE idiom = ?`,
            [
                description,
                JSON.stringify(examples),
                examImages ? JSON.stringify(examImages) : null,
                majorTypeCode || null,
                minorTypeCode || null,
                idiom
            ]
        );

        res.json({ success: true, message: '成语已更新' });
    } catch (error) {
        console.error('Error updating idiom:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
