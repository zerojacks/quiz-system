import React, { useState } from 'react';
import { updateIdiom } from '../api/idiomApi';
import { Idiom } from '../types/idiom';
import { useNavigate } from 'react-router-dom'; // 导入 useNavigate
import { ArrowLeft } from 'lucide-react'; // 导入返回图标

export const UploadConfigPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const navigate = useNavigate(); // 使用 useNavigate

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

                const idioms: Idiom[] = rawIdioms.map((item: any) => ({
                    idiom: item.idiom,
                    description: item.description,
                    examples: item.examples || [],
                    examImages: []
                }));

                for (let i = 0; i < idioms.length; i++) {
                    await updateIdiom(idioms[i]);
                    setUploadProgress(((i + 1) / idioms.length) * 100);
                }

                alert('成语更新成功！');
                setUploadProgress(0);
                setFile(null);
            } catch (error) {
                console.error('文件处理出错:', error);
                alert('文件处理出错，请检查文件格式。');
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md relative">
            <button 
                onClick={() => navigate(-1)} // 返回上一级路由
                className="absolute top-4 left-4 bg-gray-300 text-black p-2 rounded-full hover:bg-gray-400 transition"
                aria-label="返回"
            >
                <ArrowLeft size={20} /> {/* 使用 lucide-react 的图标 */}
            </button>
            <h2 className="text-2xl font-semibold text-center mb-4">配置文件</h2>
            <div className="mb-4">
                <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileChange} 
                    className="block w-full text-sm text-gray-500 
                               file:mr-4 file:py-2 file:px-4 
                               file:rounded-md file:border-0 
                               file:text-sm file:font-semibold 
                               file:bg-blue-500 file:text-white 
                               hover:file:bg-blue-600 transition"
                />
                <p className="text-center text-gray-600 mt-2">请上传包含成语的 JSON 文件。</p>
            </div>
            {file && (
                <div>
                    <button 
                        onClick={handleUpload} 
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        上传成语
                    </button>
                    <div className="mt-4">
                        <div className="bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 text-center mt-1">{uploadProgress.toFixed(0)}% 完成</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadConfigPage;