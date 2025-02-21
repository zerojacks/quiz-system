import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function importData() {
    try {
        // 读取数据
        const rawData = fs.readFileSync(path.join(__dirname, 'cloudflare_data.json'), 'utf8');
        const data = JSON.parse(rawData);

        // 创建数据库连接
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // 开始导入数据
        console.log('Starting data import...');

        // 1. 导入大类数据
        console.log('Importing major types...');
        for (const majorType of data.majorTypes) {
            await connection.execute(
                'INSERT INTO idiom_major_types (type_code, type_name, description) VALUES (?, ?, ?)',
                [majorType.type_code, majorType.type_name, majorType.description || null]
            );
        }

        // 2. 导入小类数据
        console.log('Importing minor types...');
        for (const minorType of data.minorTypes) {
            await connection.execute(
                'INSERT INTO idiom_minor_types (type_code, major_type_code, type_name, description) VALUES (?, ?, ?, ?)',
                [minorType.type_code, minorType.major_type_code, minorType.type_name, minorType.description || null]
            );
        }

        // 3. 导入成语数据
        console.log('Importing idioms...');
        for (const idiom of data.idioms) {
            await connection.execute(
                'INSERT INTO idioms (idiom, description, examples, exam_images, major_type_code, minor_type_code) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    idiom.idiom,
                    idiom.description,
                    JSON.stringify(idiom.examples),
                    idiom.examImages ? JSON.stringify(idiom.examImages) : null,
                    idiom.major_type_code,
                    idiom.minor_type_code
                ]
            );
        }

        console.log('Data import completed successfully!');
        await connection.end();
    } catch (error) {
        console.error('Error importing data:', error);
    }
}

importData();
