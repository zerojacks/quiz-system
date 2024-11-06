import React, { useEffect, useState } from 'react';
import { fetchAllMajorTypes, fetchAllMinorTypes } from '../api/idiomApi';
import { MajorInfo, MinorInfo } from '../types/idiom';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

const CategoryEditor: React.FC = () => {
    const [majorTypes, setMajorTypes] = useState<MajorInfo[]>([]);
    const [minorTypes, setMinorTypes] = useState<MinorInfo[]>([]);
    const [selectedMajor, setSelectedMajor] = useState<MajorInfo | null>(null);
    const [selectedMinor, setSelectedMinor] = useState<MinorInfo | null>(null);
    const [filteredTypes, setFilteredTypes] = useState<MinorInfo[]>([]);    
    const [isLoading, setIsLoading] = useState(false);
    const [isMajorDialogOpen, setIsMajorDialogOpen] = useState(false);
    const [isMinorDialogOpen, setIsMinorDialogOpen] = useState(false);
    const [newMajorName, setNewMajorName] = useState('');
    const [newMinorName, setNewMinorName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [allMajorTypes, allMinorTypes] = await Promise.all([
                    fetchAllMajorTypes(),
                    fetchAllMinorTypes()
                ]);
                setMajorTypes(allMajorTypes);
                setMinorTypes(allMinorTypes);
                setSelectedMajor(allMajorTypes[0]);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedMajor) {
            const filteredTypes = minorTypes.filter((type) => type.major_type_code === selectedMajor.type_code);
            setSelectedMinor(filteredTypes[0] || null);
            setFilteredTypes(filteredTypes);
        }
    }, [selectedMajor, minorTypes]);

    const handleMajorTypeChange = (selectedType: MajorInfo) => {
        setSelectedMajor(selectedType);
        setNewMajorName(selectedType.type_name); // 设置输入框的初始值
        const filteredTypes = minorTypes.filter((type) => type.major_type_code === selectedType.type_code);
        setSelectedMinor(filteredTypes[0] || null);
        setFilteredTypes(filteredTypes);
    };

    const handleMinorTypeChange = (selectedType: MinorInfo) => {
        setSelectedMinor(selectedType);
        setNewMinorName(selectedType.type_name); // 设置输入框的初始值
    };

    const handleMajorTypeNameChange = (newName: string) => {
        if (selectedMajor) {
            setMajorTypes((prev) =>
                prev.map((type) =>
                    type.type_code === selectedMajor.type_code ? { ...type, type_name: newName } : type
                )
            );
        }
    };

    const handleMinorTypeNameChange = (newName: string) => {
        if (selectedMinor) {
            setMinorTypes((prev) =>
                prev.map((type) =>
                    type.type_code === selectedMinor.type_code ? { ...type, type_name: newName } : type
                )
            );
        }
    };

    const handleMajorDialogSubmit = () => {
        if (newMajorName) {
            handleMajorTypeNameChange(newMajorName);
            setIsMajorDialogOpen(false);
            setNewMajorName(''); // 清空输入框
        }
    };

    const handleMinorDialogSubmit = () => {
        if (newMinorName) {
            handleMinorTypeNameChange(newMinorName);
            setIsMinorDialogOpen(false);
            setNewMinorName(''); // 清空输入框
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white shadow rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-medium">类型信息</h3>
                </div>
                <div className="p-4">
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <h3 className="text-lg font-semibold">选择和编辑大类小类</h3>
            <div className="flex-1 max-w-xs">
                <Listbox value={selectedMajor} onChange={handleMajorTypeChange}>
                    <ListboxButton className="text-left px-2 py-1 text-sm border rounded-md bg-white truncate">
                        {selectedMajor?.type_name || '选择大类'}
                    </ListboxButton>
                    <ListboxOptions anchor="bottom" className="absolute mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none text-sm z-10">
                        {majorTypes.map((type) => (
                            <ListboxOption key={type.type_code} value={type} className="px-2 py-1.5 cursor-pointer hover:bg-blue-50 data-[focus]:bg-blue-100 truncate">
                                {type.type_name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Listbox>
                {/* 编辑大类图标 */}
                <button
                    className="ml-2 p-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMajorDialogOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232a3 3 0 00-4.243 0L3 12.586V17h4.414l8.988-8.988a3 3 0 000-4.243z" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 max-w-xs mt-4">
                <Listbox value={selectedMinor} onChange={handleMinorTypeChange}>
                    <ListboxButton className="text-left px-2 py-1 text-sm border rounded-md bg-white truncate">
                        {selectedMinor?.type_name || '选择小类'}
                    </ListboxButton>
                    <ListboxOptions anchor="bottom" className="absolute mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none text-sm z-10">
                        {filteredTypes.map((type) => (
                            <ListboxOption key={type.type_code} value={type} className="px-2 py-1.5 cursor-pointer hover:bg-blue-50 data-[focus]:bg-blue-100 truncate">
                                {type.type_name}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </Listbox>
                {/* 编辑小类图标 */}
                <button
                    className="ml-2 p-2 text-gray-600 hover:text-gray-900"
                    onClick={() => setIsMinorDialogOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232a3 3 0 00-4.243 0L3 12.586V17h4.414l8.988-8.988a3 3 0 000-4.243z" />
                    </svg>
                </button>
            </div>

            {/* 大类对话框 */}
            {isMajorDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-4 w-1/3">
                        <h4 className="text-lg font-semibold mb-4">修改大类名称</h4>
                        <input
                            type="text"
                            value={newMajorName}
                            onChange={(e) => setNewMajorName(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="输入新的大类名称"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                                onClick={handleMajorDialogSubmit}
                            >
                                确定
                            </button>
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setIsMajorDialogOpen(false)}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 小类对话框 */}
            {isMinorDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-4 w-1/3">
                        <h4 className="text-lg font-semibold mb-4">修改小类名称</h4>
                        <input
                            type="text"
                            value={newMinorName}
                            onChange={(e) => setNewMinorName(e.target.value)}
                            className="border rounded-md p-2 w-full"
                            placeholder="输入新的小类名称"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
                                onClick={handleMinorDialogSubmit}
                            >
                                确定
                            </button>
                            <button
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                                onClick={() => setIsMinorDialogOpen(false)}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryEditor;