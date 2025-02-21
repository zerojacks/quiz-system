import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });


export interface ImageInfo {
    url: string;        // 图片的 URL
    deleteUrl: string;  // 删除链接
}

export interface MajorInfo {
    type_code: string;
    type_name: string;
    description: string;
}

export interface MinorInfo {
    type_code: string;
    major_type_code: string;
    type_name: string;
    description: string;
}

export interface Idiom {
    idiom: string;
    description: string;
    examples: string[];
    examImages: ImageInfo[]; // 修改为 ImageInfo 数组
    major_type_code: string;
    minor_type_code: string;
}

async function analyzeData() {
    const dataDir = path.join(__dirname, 'importdata');
    
    // 读取并分析大类数据
    console.log('\nAnalyzing major types...');
    const majorTypesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'major_types.json'), 'utf8')) as MajorInfo[];
    console.log(`Found ${majorTypesData.length} major types`);
    console.log('Sample major type:', majorTypesData[0]);
    console.log('Type codes:', majorTypesData.map(t => t.type_code).join(', '));

    // 读取并分析小类数据
    console.log('\nAnalyzing minor types...');
    const minorTypesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'minor_types.json'), 'utf8')) as MinorInfo[];
    console.log(`Found ${minorTypesData.length} minor types`);
    console.log('Sample minor type:', minorTypesData[0]);
    
    // 验证小类和大类的关联
    const majorTypeCodes = new Set(majorTypesData.map(t => t.type_code));
    const invalidMinorTypes = minorTypesData.filter(mt => !majorTypeCodes.has(mt.major_type_code));
    if (invalidMinorTypes.length > 0) {
        console.log('\nWarning: Found minor types with invalid major_type_code:');
        console.log(invalidMinorTypes);
    }

    // 读取并分析成语数据
    console.log('\nAnalyzing idioms...');
    const idiomsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'idioms.json'), 'utf8')) as Idiom[];
    console.log(`Found ${idiomsData.length} idioms`);
    console.log('Sample idiom:', idiomsData[0]);

    // 验证成语和类型的关联
    const minorTypeCodes = new Set(minorTypesData.map(t => t.type_code));
    const invalidIdioms = idiomsData.filter(i => 
        !majorTypeCodes.has(i.major_type_code) || !minorTypeCodes.has(i.minor_type_code)
    );
    if (invalidIdioms.length > 0) {
        console.log('\nWarning: Found idioms with invalid type codes:');
        console.log(invalidIdioms);
    }

    return {
        majorTypesData,
        minorTypesData,
        idiomsData,
        analysis: {
            totalMajorTypes: majorTypesData.length,
            totalMinorTypes: minorTypesData.length,
            totalIdioms: idiomsData.length,
            invalidMinorTypes: invalidMinorTypes.length,
            invalidIdioms: invalidIdioms.length
        }
    };
}

async function importData() {
    try {
        // 首先分析数据
        console.log('Analyzing data before import...');
        const { majorTypesData, minorTypesData, idiomsData, analysis } = await analyzeData();
        
        console.log('\nAnalysis Summary:');
        console.log(analysis);

        const proceed = await new Promise(resolve => {
            console.log('\nDo you want to proceed with the import? (y/n)');
            process.stdin.once('data', data => {
                resolve(data.toString().trim().toLowerCase() === 'y');
            });
        });

        if (!proceed) {
            console.log('Import cancelled');
            process.exit(0);
        }

        // 创建数据库连接
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // 开始导入数据
        console.log('\nStarting data import...');

        // 1. 导入大类数据
        console.log('Importing major types...');
        for (const majorType of majorTypesData) {
            await connection.execute(
                'INSERT INTO idiom_major_types (type_code, type_name, description) VALUES (?, ?, ?)',
                [majorType.type_code, majorType.type_name, majorType.description || null]
            );
        }

        // 2. 导入小类数据
        console.log('Importing minor types...');
        for (const minorType of minorTypesData) {
            await connection.execute(
                'INSERT INTO idiom_minor_types (type_code, major_type_code, type_name, description) VALUES (?, ?, ?, ?)',
                [minorType.type_code, minorType.major_type_code, minorType.type_name, minorType.description || null]
            );
        }

        // 3. 导入成语数据
        console.log('Importing idioms...');
        for (const idiom of idiomsData) {
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
        process.exit(1);
    }
}

importData();
