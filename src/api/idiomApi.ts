// src/api/idiomApi.ts
const BASE_URL = 'https://quiz-system.zerojack-shi.workers.dev'; // 替换为你的 Worker URL
import { Idiom, ImageInfo } from '../types/idiom'; // 替换为你的 Idiom 类型定义

export const getIdioms = async () => {
    const response = await fetch(`${BASE_URL}/idioms`);
    if (!response.ok) {
        throw new Error('获取成语失败');
    }
    return await response.json();
};

export const updateIdiom = async (updatedIdiom: Idiom) => {
    const response = await fetch(`${BASE_URL}/update-idiom`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedIdiom),
    });
    if (!response.ok) {
        throw new Error('更新成语失败');
    }
    return await response.json();
};

export const uploadImage = async (formData: FormData) => {
    const response = await fetch(`${BASE_URL}/upload-image`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('上传图片失败');
    }
    return await response.json();
};

const IMGBB_API_KEY = '8e0838e6afb65165cca4d9e04f1e33b3'; // 替换为你的 imgbb API 密钥

// src/api/idiomApi.ts
export const uploadImageToImgbb = (file: File, onProgress: (progress: number) => void): Promise<ImageInfo> => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('image', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, true);

        // 监听上传进度
        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                onProgress(percentComplete); // 更新进度
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve({ url: data.data.url, deleteUrl: data.data.delete_url }); // 返回图片信息
            } else {
                reject(new Error('上传失败'));
            }
        };

        xhr.onerror = () => {
            reject(new Error('上传失败'));
        };

        xhr.send(formData);
    });
};