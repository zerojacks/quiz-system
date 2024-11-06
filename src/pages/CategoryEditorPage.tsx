import React from 'react';
import { useNavigate } from 'react-router-dom'; // 导入 useNavigate
import CategoryEditor from '../components/CategoryEditor'; // 引入 CategoryEditor 组件
import { ArrowLeft } from 'lucide-react'; // 导入返回图标

export const CategoryEditorPage: React.FC = () => {
    const navigate = useNavigate(); // 使用 useNavigate

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md relative">
            <button 
                onClick={() => navigate(-1)} // 返回上一级路由
                className="absolute top-4 left-4 bg-gray-300 text-black p-2 rounded-full hover:bg-gray-400 transition"
                aria-label="返回"
            >
                <ArrowLeft size={20} /> {/* 使用图标 */}
            </button>
            <h2 className="text-2xl font-semibold text-center mb-4">类别编辑器</h2>
            <CategoryEditor /> {/* 渲染 CategoryEditor 组件 */}
        </div>
    );
};