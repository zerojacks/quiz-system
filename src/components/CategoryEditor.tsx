import React, { useEffect, useState } from 'react';
import { fetchAllMajorTypes, fetchAllMinorTypes } from '../api/idiomApi';
import { MajorInfo, MinorInfo } from '../types/idiom';

const CategoryEditor: React.FC = () => {
    const [majorTypes, setMajorTypes] = useState<MajorInfo[]>([]);
    const [minorTypes, setMinorTypes] = useState<MinorInfo[]>([]);
    const [selectedMajor, setSelectedMajor] = useState<MajorInfo | null>(null);
    const [selectedMinor, setSelectedMinor] = useState<MinorInfo | null>(null);

    useEffect(() => {
        const loadTypes = async () => {
            const majors = await fetchAllMajorTypes();
            setMajorTypes(majors);
            const minors = await fetchAllMinorTypes();
            setMinorTypes(minors);
        };
        loadTypes();
    }, []);

    const handleMajorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const major = majorTypes.find(m => m.type_code === e.target.value) || null;
        setSelectedMajor(major);
        setSelectedMinor(null); // Reset minor when major changes
    };

    const handleMinorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const minor = minorTypes.find(m => m.type_code === e.target.value) || null;
        setSelectedMinor(minor);
    };

    const handleUpdateMajor = async () => {
        if (selectedMajor) {
            // await updateIdiom(selectedMajor); // 这里可以根据需要修改更新逻辑
            alert('大类更新成功！');
        }
    };

    const handleUpdateMinor = async () => {
        if (selectedMinor) {
            // await updateIdiom(selectedMinor); // 这里可以根据需要修改更新逻辑
            alert('小类更新成功！');
        }
    };

    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold">选择和编辑大类小类</h3>
            <select onChange={handleMajorChange} className="mt-2 block w-full border rounded p-2">
                <option value="">选择大类</option>
                {majorTypes.map((major) => (
                    <option key={major.type_code} value={major.type_code}>{major.type_name}</option>
                ))}
            </select>
            {selectedMajor && (
                <div>
                    <h4 className="mt-2">编辑大类: {selectedMajor.type_name}</h4>
                    <button onClick={handleUpdateMajor} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                        更新大类
                    </button>
                </div>
            )}
            <select onChange={handleMinorChange} className="mt-2 block w-full border rounded p-2">
                <option value="">选择小类</option>
                {minorTypes.map((minor) => (
                    <option key={minor.type_code} value={minor.type_code}>{minor.type_name}</option>
                ))}
            </select>
            {selectedMinor && (
                <div>
                    <h4 className="mt-2">编辑小类: {selectedMinor.type_name}</h4>
                    <button onClick={handleUpdateMinor} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                        更新小类
                    </button>
                </div>
            )}
        </div>
    );
};

export default CategoryEditor;