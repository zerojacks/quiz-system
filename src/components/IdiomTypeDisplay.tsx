// ... existing imports ...
import React, { useState, useEffect } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Idiom, MajorInfo, MinorInfo } from '../types/idiom';
import { fetchAllMajorTypes, fetchAllMinorTypes, fetchMajorTypeInfo, fetchMinorTypeInfo } from '../api/idiomApi';
import { ToastContainer, toast } from 'react-toastify'; // 引入 Toast 组件
import 'react-toastify/dist/ReactToastify.css'; // 引入样式

interface TypeDisplayProps {
    idiom: Idiom;
    isEditing: boolean;
    onUpdate: (updatedIdiom: Idiom) => void;
}

const IdiomTypeDisplay: React.FC<TypeDisplayProps> = ({ idiom, isEditing, onUpdate }) => {
    const [majorTypes, setMajorTypes] = useState<MajorInfo[]>([]);
    const [minorTypes, setMinorTypes] = useState<MinorInfo[]>([]);
    const [filteredTypes, setFilteredTypes] = useState<MinorInfo[]>([]);
    const [currentMajorType, setCurrentMajorType] = useState<MajorInfo | null>(null);
    const [currentMinorType, setCurrentMinorType] = useState<MinorInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch all type information on component mount
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const [majorData, minorData] = await Promise.all([
                    fetchAllMajorTypes(),
                    fetchAllMinorTypes()
                ]);
                setMajorTypes(majorData);
                setMinorTypes(minorData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching type information:', error);
                toast.error('获取类型信息失败，请重试。'); // 显示错误消息
                setLoading(false);
            }
        };
        fetchTypes();
    }, []);

    // Fetch current type information when idiom changes
    useEffect(() => {
        const fetchCurrentTypes = async () => {
            if (idiom.major_type_code || idiom.minor_type_code) {
                try {
                    const [majorInfo, minorInfo] = await Promise.all([
                        idiom.major_type_code ? fetchMajorTypeInfo(idiom.major_type_code) : null,
                        idiom.minor_type_code ? fetchMinorTypeInfo(idiom.minor_type_code) : null
                    ]);
                    setCurrentMajorType(majorInfo);
                    setCurrentMinorType(minorInfo);
                } catch (error) {
                    console.error('Error fetching current type information:', error);
                    toast.error('获取当前类型信息失败，请重试。'); // 显示错误消息
                    setCurrentMajorType({ type_code: idiom.major_type_code, type_name: '未知', description: ''});
                    setCurrentMinorType({ type_code: idiom.minor_type_code, major_type_code: idiom.major_type_code, type_name: '未知', description: ''});
                } finally {
                    setLoading(false);
                }
            } else {
                setCurrentMajorType(null);
                setCurrentMinorType(null);
            }
        };
        fetchCurrentTypes();
    }, [idiom]);

    useEffect(() => {
        const filteredTypes = minorTypes.filter((type) => type.major_type_code === currentMajorType?.type_code);
        setFilteredTypes(filteredTypes);
    }, [currentMajorType, minorTypes]); // 添加 minorTypes 作为依赖项

    const handleMajorTypeChange = (selectedType: MajorInfo) => {
        const updatedIdiom = {
            ...idiom,
            major_type_code: selectedType.type_code,
            minor_type_code: ''
        };
        setCurrentMajorType(selectedType);
        setCurrentMinorType(null);
        const filteredTypes = minorTypes.filter((type) => type.major_type_code === selectedType.type_code);
        setFilteredTypes(filteredTypes);
        onUpdate(updatedIdiom);
        toast.success(`已选择大类: ${selectedType.type_name}`); // 显示成功消息
    };

    const handleMinorTypeChange = (selectedType: MinorInfo) => {
        if (!currentMajorType) {
            toast.error('请先选择大类'); // 显示 Toast 提示
            return;
        }
        const updatedIdiom = {
            ...idiom,
            minor_type_code: selectedType.type_code
        };
        setCurrentMinorType(selectedType);
        onUpdate(updatedIdiom);
        toast.success(`已选择小类: ${selectedType.type_name}`); // 显示成功消息
    };

    if (loading) {
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

    const selectedMajorType = majorTypes.find(type => type.type_code === idiom.major_type_code) || null;
    const selectedMinorType = minorTypes.find(type => type.type_code === idiom.minor_type_code) || null;

    return (
        <div className="">
            <ToastContainer /> {/* 添加 ToastContainer */}
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-16">
                        大类
                    </label>
                    <div className="flex-1 max-w-xs">
                        {isEditing ? (
                            <Listbox value={selectedMajorType} onChange={handleMajorTypeChange}>
                                <ListboxButton className="text-left px-2 py-1 text-sm border rounded-md bg-white truncate">
                                    {selectedMajorType?.type_name || '选择大类'}
                                </ListboxButton>
                                <ListboxOptions anchor="bottom" className="absolute mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none text-sm z-10">
                                    {majorTypes.map((type) => (
                                        <ListboxOption key={type.type_code} value={type} className="px-2 py-1.5 cursor-pointer hover:bg-blue-50 data-[focus]:bg-blue-100 truncate">
                                            {type.type_name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </Listbox>
                        ) : (
                            <div className="px-2 py-1 text-sm bg-gray-50 rounded truncate">
                                {currentMajorType?.type_name || '未分类'}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-16">
                        小类
                    </label>
                    <div className="flex-1 max-w-xs">
                        {isEditing ? (
                            <Listbox value={selectedMinorType} onChange={handleMinorTypeChange}>
                                <ListboxButton className="text-left px-2 py-1 text-sm border rounded-md bg-white truncate">
                                    {selectedMinorType?.type_name || '选择小类'}
                                </ListboxButton>
                                {filteredTypes.length === 0 ? (
                                    <ListboxOptions anchor="bottom" className="absolute mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none text-sm z-10">
                                        <ListboxOption value={""} className="px-2 py-1.5 cursor-pointer hover:bg-blue-50 data-[focus]:bg-blue-100 truncate">
                                            {"先选择大类"}
                                        </ListboxOption>
                                    </ListboxOptions>
                                ) : (
                                    <ListboxOptions anchor="bottom" className="absolute mt-1 max-h-48 overflow-auto border border-gray-300 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none text-sm z-10">
                                        {filteredTypes.map((type) => (
                                            <ListboxOption key={type.type_code} value={type} className="px-2 py-1.5 cursor-pointer hover:bg-blue-50 data-[focus]:bg-blue-100 truncate">
                                                {type.type_name}
                                            </ListboxOption>
                                        ))}
                                    </ListboxOptions>
                                )
                                }

                            </Listbox>
                        ) : (
                            <div className="px-2 py-1 text-sm bg-gray-50 rounded truncate">
                                {currentMinorType?.type_name || '未分类'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IdiomTypeDisplay;