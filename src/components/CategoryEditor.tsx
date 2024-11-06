import React, { useEffect, useState } from 'react';
import { fetchAllMajorTypes, fetchAllMinorTypes, updateMajorType, updateMinorType, createMajorType, createMinorType } from '../api/idiomApi';
import { MajorInfo, MinorInfo } from '../types/idiom';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { PenSquare, Plus } from 'lucide-react';
import { pinyin } from 'pinyin-pro';
import { toast } from 'react-toastify';

const CategoryEditor: React.FC = () => {
    const [majorTypes, setMajorTypes] = useState<MajorInfo[]>([]);
    const [minorTypes, setMinorTypes] = useState<MinorInfo[]>([]);
    const [selectedMajor, setSelectedMajor] = useState<MajorInfo | null>(null);
    const [selectedMinor, setSelectedMinor] = useState<MinorInfo | null>(null);
    const [filteredTypes, setFilteredTypes] = useState<MinorInfo[]>([]);    
    const [isLoading, setIsLoading] = useState(false);
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        type: 'editMajor' | 'editMinor' | 'addMajor' | 'addMinor';
        name: string;
    }>({
        isOpen: false,
        type: 'editMajor',
        name: ''
    });

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
            setFilteredTypes(filteredTypes);
            setSelectedMinor(filteredTypes[0]);
        }
    }, [selectedMajor]);

    useEffect(() => {
        if (selectedMajor) {
            const filteredTypes = minorTypes.filter((type) => type.major_type_code === selectedMajor.type_code);
            setFilteredTypes(filteredTypes);
        }
    }, [minorTypes]);


    const handleMajorTypeChange = (selectedType: MajorInfo) => {
        setSelectedMajor(selectedType);
        setDialogState(prev => ({ ...prev, name: selectedType.type_name }));
    };

    const handleMinorTypeChange = (selectedType: MinorInfo) => {
        setSelectedMinor(selectedType);
        setDialogState(prev => ({ ...prev, name: selectedType.type_name }));
    };

    // 首先添加一个生成类型代码的辅助函数
    const generateTypeCode = (name: string, prefix: string = ''): string => {
        // 获取拼音（不带声调）
        const pinyinText = pinyin(name, {
            toneType: 'none',    // 不带声调
            type: 'array',       // 返回数组格式
            nonZh: 'consecutive' // 非中文原样返回
        }).join('');

        // 转换为小写并移除非字母数字字符
        const cleanPinyin = pinyinText.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // 如果有前缀，加上前缀和下划线，否则直接返回处理后的拼音
        return prefix ? `${prefix}_${cleanPinyin}` : cleanPinyin;
    };

    
    const handleDialogSubmit = async () => {
        const { type, name } = dialogState;
        
        if (!name.trim()) {
            alert('请输入类型名称');
            return;
        }
    
        try {
            if (type === 'editMajor' && selectedMajor) {
                // 编辑大类时，保持原有的 type_code，只更新名称
                await updateMajorType(selectedMajor.type_code, name);
                setMajorTypes(prev =>
                    prev.map(type =>
                        type.type_code === selectedMajor.type_code ? { ...type, type_name: name } : type
                    )
                );
                setSelectedMajor({ ...selectedMajor, type_name: name });
                toast.success('更新大类成功！');
            } else if (type === 'editMinor' && selectedMinor) {
                // 编辑小类时，保持原有的 type_code，只更新名称
                await updateMinorType(selectedMinor.type_code, name);
                setMinorTypes(prev =>
                    prev.map(type =>
                        type.type_code === selectedMinor.type_code ? { ...type, type_name: name } : type
                    )
                );
                setSelectedMinor({ ...selectedMinor, type_name: name });
                toast.success('更新小类成功！');
            } else if (type === 'addMajor') {
                // 生成新的大类 type_code
                const newTypeCode = generateTypeCode(name);
                
                // 检查是否已存在相同的 type_code
                if (majorTypes.some(type => type.type_code === newTypeCode)) {
                    throw new Error('该类型代码已存在');
                }
    
                const newMajorType: MajorInfo = {
                    type_code: newTypeCode,
                    type_name: name,
                    description: ''
                };
    
                // 调用 API 创建新大类
                await createMajorType(newMajorType);
                
                // 更新本地状态
                setMajorTypes(prev => [...prev, newMajorType]);
                // 选中新创建的大类
                setSelectedMajor(newMajorType);
                toast.success('添加大类成功！');
    
            } else if (type === 'addMinor' && selectedMajor) {
                // 生成新的小类 type_code，使用大类 type_code 作为前缀
                const newTypeCode = generateTypeCode(name, "SUB");
                
                // 检查是否已存在相同的 type_code
                if (minorTypes.some(type => type.type_code === newTypeCode)) {
                    throw new Error('该类型代码已存在');
                }
    
                const newMinorType: MinorInfo = {
                    type_code: newTypeCode,
                    type_name: name,
                    major_type_code: selectedMajor.type_code,
                    description: ''
                };
    
                // 调用 API 创建新小类
                await createMinorType(newMinorType);
                
                // 更新本地状态
                setMinorTypes(prev => [...prev, newMinorType]);
                // 选中新创建的小类
                setSelectedMinor(newMinorType);
                toast.success('添加小类成功！');
            }
            // 关闭对话框并清空输入
            setDialogState({ isOpen: false, type: 'editMajor', name: '' });
            
        } catch (error) {
            console.error('Failed to update/add category:', error);
            // alert(error instanceof Error ? error.message : '操作失败，请重试');
            const errorMessage = error instanceof Error ? error.message : '操作失败，请重试';
            toast.error(errorMessage);
        }
    };
    

    const openDialog = (type: typeof dialogState.type) => {
        setDialogState({
            isOpen: true,
            type,
            name: type.startsWith('edit') ? (type === 'editMajor' ? selectedMajor?.type_name || '' : selectedMinor?.type_name || '') : ''
        });
    };

    if (isLoading) {
        return (
            <div className="bg-white shadow rounded-lg p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            {/* Major Type Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">大类</label>
                    <button
                        onClick={() => openDialog('addMajor')}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        title="添加大类"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <Listbox value={selectedMajor} onChange={handleMajorTypeChange}>
                            <div className="relative">
                                <ListboxButton className="relative w-full text-left px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
                                    <span className="block truncate">{selectedMajor?.type_name || '选择大类'}</span>
                                </ListboxButton>
                                <ListboxOptions className="absolute z-10 w-full mt-1 max-h-48 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                                    {majorTypes.map((type) => (
                                        <ListboxOption
                                            key={type.type_code}
                                            value={type}
                                            className={({ active }) =>
                                                `px-3 py-2 cursor-pointer text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`
                                            }
                                        >
                                            {type.type_name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </div>
                        </Listbox>
                    </div>
                    <button
                        onClick={() => openDialog('editMajor')}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        title="编辑大类"
                    >
                        <PenSquare className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Minor Type Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">小类</label>
                    <button
                        onClick={() => openDialog('addMinor')}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        title="添加小类"
                        disabled={!selectedMajor}
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1">
                        <Listbox value={selectedMinor} onChange={handleMinorTypeChange}>
                            <div className="relative">
                                <ListboxButton className="relative w-full text-left px-3 py-2 text-sm border rounded-md bg-white hover:bg-gray-50">
                                    <span className="block truncate">{selectedMinor?.type_name || '选择小类'}</span>
                                </ListboxButton>
                                <ListboxOptions className="absolute z-10 w-full mt-1 max-h-48 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                                    {filteredTypes.map((type) => (
                                        <ListboxOption
                                            key={type.type_code}
                                            value={type}
                                            className={({ active }) =>
                                                `px-3 py-2 cursor-pointer text-sm ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}`
                                            }
                                        >
                                            {type.type_name}
                                        </ListboxOption>
                                    ))}
                                </ListboxOptions>
                            </div>
                        </Listbox>
                    </div>
                    <button
                        onClick={() => openDialog('editMinor')}
                        className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                        title="编辑小类"
                        disabled={!selectedMinor}
                    >
                        <PenSquare className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Dialog */}
            {dialogState.isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h4 className="text-lg font-semibold mb-4">
                            {dialogState.type === 'editMajor' && '修改大类名称'}
                            {dialogState.type === 'editMinor' && '修改小类名称'}
                            {dialogState.type === 'addMajor' && '添加新大类'}
                            {dialogState.type === 'addMinor' && '添加新小类'}
                        </h4>
                        <input
                            type="text"
                            value={dialogState.name}
                            onChange={(e) => setDialogState(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`请输入${dialogState.type.includes('Major') ? '大' : '小'}类名称`}
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                取消
                            </button>
                            <button
                                onClick={handleDialogSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                确定
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryEditor;