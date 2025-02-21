import fs from 'fs';
import path from 'path';
import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';

const BASE_URL = 'https://quiz-system.zerojack-shi.workers.dev';

const axiosInstance: AxiosInstance = axios.create({
    timeout: 30000, // 增加超时时间到30秒
    httpsAgent: new https.Agent({  
        rejectUnauthorized: false // 忽略SSL证书验证
    }),
    proxy: false // 禁用代理
});

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    try {
        console.log(`Fetching ${url}...`);
        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... ${retries} attempts left`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            return fetchWithRetry(url, retries - 1);
        }
        throw error;
    }
}

async function fetchData() {
    try {
        console.log('Fetching idioms...');
        const idioms = await fetchWithRetry(`${BASE_URL}/idioms`);
        console.log(`Successfully fetched ${idioms?.length || 0} idioms`);

        console.log('Fetching major types...');
        const majorTypes = await fetchWithRetry(`${BASE_URL}/idiom_major_types?type_code=all`);
        console.log(`Successfully fetched ${majorTypes?.length || 0} major types`);

        console.log('Fetching minor types...');
        const minorTypes = await fetchWithRetry(`${BASE_URL}/idiom_minor_types?type_code=all`);
        console.log(`Successfully fetched ${minorTypes?.length || 0} minor types`);

        // 将数据保存为JSON文件
        const data = {
            idioms: idioms || [],
            majorTypes: majorTypes || [],
            minorTypes: minorTypes || []
        };

        const outputPath = path.join(__dirname, 'cloudflare_data.json');
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${outputPath}`);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Network error:', {
                message: error.message,
                code: error.code,
                status: error.response?.status,
                data: error.response?.data,
                host: error.request?.host,
                path: error.request?.path
            });
        } else {
            console.error('Error fetching data:', error);
        }
        process.exit(1); // 出错时退出
    }
}

fetchData();
