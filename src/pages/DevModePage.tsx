import React from 'react';
import ToolCard from '../components/ToolCard'; // 引入 ToolCard 组件

export const DevModePage: React.FC = () => {

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <ToolCard title="工具 1" description="描述工具 1" path="/devmode/uploadconfig" />
                <ToolCard title="工具 2" description="描述工具 2" path="/devmode/catergory" />
                {/* 添加更多工具卡片 */}
            </div>
        </div>
    );
};