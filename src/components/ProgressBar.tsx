// src/components/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
    progress: number; // 进度百分比
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default ProgressBar;