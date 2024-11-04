import React from 'react';
import { useNavigate } from 'react-router-dom'; // 修改为 useNavigate

interface ToolCardProps {
    title: string;
    description: string;
    path: string; // 路径用于导航
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, path }) => {
    const navigate = useNavigate(); // 使用 useNavigate

    const handleClick = () => {
        navigate(path); // 导航到指定路径
    };

    return (
        <div
            className="border rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleClick}
        >
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

export default ToolCard;