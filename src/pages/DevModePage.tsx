import React from 'react';
import ToolCard from '../components/ToolCard'; // 引入 ToolCard 组件

export const DevModePage: React.FC = () => {

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                <ToolCard title="配置文件" description="上传配置文件" path="/devmode/uploadconfig" />
                <ToolCard title="类别修改" description="修改/添加成语大类和成语小类" path="/devmode/catergory" />
                {/* 添加更多工具卡片 */}
            </div>
        </div>
    );
};