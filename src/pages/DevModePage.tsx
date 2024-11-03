import React, { useState } from 'react';
import { updateIdiom } from '../api/idiomApi';
import { Idiom } from '../types/idiom';

export const DevModePage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const rawIdioms = JSON.parse(content);

                // 转换成符合 Idiom 接口格式的数组
                const idioms: Idiom[] = rawIdioms.map((item: any) => ({
                    idiom: item.idiom,
                    description: item.description,
                    examples: item.examples || [], // 确保 examples 字段存在
                    examImages: [] // 初始化为空数组
                }));

                for (let i = 0; i < idioms.length; i++) {
                    await updateIdiom(idioms[i]);
                    setUploadProgress(((i + 1) / idioms.length) * 100); // 更新进度
                }

                alert('成语更新成功！');
                setUploadProgress(0); // 重置进度
                setFile(null); // 清空文件选择
            } catch (error) {
                console.error('文件处理出错:', error);
                alert('文件处理出错，请检查文件格式。');
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-4">
            <input type="file" accept=".json" onChange={handleFileChange} />
            <p>请上传包含成语的 JSON 文件。</p>
            {file && (
                <div>
                    <button onClick={handleUpload} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                        上传成语
                    </button>
                    <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600">{uploadProgress.toFixed(0)}% 完成</p>
                    </div>
                </div>
            )}
        </div>
    );
};