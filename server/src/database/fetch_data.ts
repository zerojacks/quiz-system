import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const BASE_URL = 'https://quiz-system.zerojack-shi.workers.dev';

async function fetchData() {
    try {
        // 获取所有成语
        const idiomsResponse = await fetch(`${BASE_URL}/idioms`);
        const idioms = await idiomsResponse.json();

        // 获取所有大类
        const majorTypesResponse = await fetch(`${BASE_URL}/idiom_major_types?type_code=all`);
        const majorTypes = await majorTypesResponse.json();

        // 获取所有小类
        const minorTypesResponse = await fetch(`${BASE_URL}/idiom_minor_types?type_code=all`);
        const minorTypes = await minorTypesResponse.json();

        // 将数据保存为JSON文件
        const data = {
            idioms,
            majorTypes,
            minorTypes
        };

        fs.writeFileSync(
            path.join(__dirname, 'cloudflare_data.json'),
            JSON.stringify(data, null, 2)
        );

        console.log('Data fetched and saved successfully!');
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData();
