// src/pages/IdiomPage.tsx
import React, { useState, useEffect } from 'react';
import { getIdioms, fetchMajorTypeInfo, fetchMinorTypeInfo } from '../api/idiomApi'; // 更新导入路径
import { Idiom } from '../types/idiom'; // 导入 Idiom 接口
import IdiomDisplay from '../components/IdiomDisplay'; // 导入 IdiomDisplay 组件

export const IdiomPage: React.FC = () => {
    const [idiomsData, setIdiomsData] = useState<Idiom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentIdiom, setCurrentIdiom] = useState<Idiom | null>(null);
    const [suggestions, setSuggestions] = useState<Idiom[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false); // 新增状态管理对话框
    const [newIdiomName, setNewIdiomName] = useState(''); // 新增状态管理成语名称

    // 获取成语数据
    useEffect(() => {
        const fetchIdioms = async () => {
            try {
                const idioms = await getIdioms();
                setIdiomsData(idioms);
                setCurrentIdiom(idioms[0]);
            } catch (error) {
                console.error('获取成语失败:', error);
            }
        };

        fetchIdioms();
    }, []);

    // 搜索建议更新
    useEffect(() => {
        if (searchTerm.trim()) {
            const results = idiomsData.filter(idiom =>
                idiom.idiom.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm, idiomsData]);

    const handleSelectIdiom = (selectedIdiom: Idiom) => {
        setCurrentIdiom(selectedIdiom);
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const handleNext = () => {
        const currentIndex = idiomsData.findIndex(idiom => idiom.idiom === currentIdiom?.idiom);
        const nextIndex = (currentIndex + 1) % idiomsData.length;
        setCurrentIdiom(idiomsData[nextIndex]);
    };

    const handlePrevious = () => {
        const currentIndex = idiomsData.findIndex(idiom => idiom.idiom === currentIdiom?.idiom);
        const prevIndex = (currentIndex - 1 + idiomsData.length) % idiomsData.length;
        setCurrentIdiom(idiomsData[prevIndex]);
    };

    const handleAddIdiom = () => {
        setIsDialogOpen(true); // 打开对话框
    };

    const handleDialogSubmit = () => {
        if (newIdiomName) {
            const newIdiom: Idiom = {
                idiom: newIdiomName,
                description: "",
                examples: [],
                examImages: [],
                major_type_code: "",
                minor_type_code: "",            
            };
            setCurrentIdiom(newIdiom);
            setNewIdiomName(''); // 清空输入
            setIsDialogOpen(false); // 关闭对话框
        }
    };

    // 处理点击外部区域以隐藏建议
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const suggestionsElement = document.getElementById('suggestions');
            if (suggestionsElement && !suggestionsElement.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleUpdateIdiom = (updatedIdiom: Idiom) => {
        setIdiomsData(prevIdioms => {
            const existingIndex = prevIdioms.findIndex(idiom => idiom.idiom === updatedIdiom.idiom);
            if (existingIndex !== -1) {
                // 如果存在，则更新原来的值
                const updatedIdioms = [...prevIdioms];
                updatedIdioms[existingIndex] = updatedIdiom;
                return updatedIdioms;
            } else {
                // 如果不存在，则添加新的成语
                return [...prevIdioms, updatedIdiom];
            }
        });
    };

    return (
        <div className="p-4 max-w-3xl mx-auto">
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="搜索成语 (Ctrl + K)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSuggestions && (
                    <ul id="suggestions" className="absolute w-full mt-1 max-h-60 overflow-auto bg-white border rounded-lg shadow-lg z-10">
                        {suggestions.map((idiom) => (
                            <li
                                key={idiom.idiom}
                                onClick={() => handleSelectIdiom(idiom)}
                                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            >
                                <div className="font-medium">{idiom.idiom}</div>
                                <div className="text-sm text-gray-600 truncate">
                                    {idiom.description}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {currentIdiom && (
                <IdiomDisplay
                    idiom={currentIdiom}
                    onUpdate={handleUpdateIdiom}
                />
            )}
            {isDialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"> {/* 添加背景遮罩 */}
                    <div className="bg-white p-6 rounded-lg shadow-lg"> {/* 对话框样式 */}
                        <input
                            type="text"
                            value={newIdiomName}
                            onChange={(e) => setNewIdiomName(e.target.value)}
                            placeholder="请输入成语名称"
                            className="border rounded-lg p-2 w-full"
                        />
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleDialogSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg">确认</button>
                            <button onClick={() => setIsDialogOpen(false)} className="ml-2 bg-gray-300 px-4 py-2 rounded-lg">取消</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="mt-6 flex justify-center space-x-4">
                <button
                    onClick={handlePrevious}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    上一个
                </button>
                <button
                    onClick={handleNext}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    下一个
                </button>
                <button
                    onClick={handleAddIdiom}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                    增加成语
                </button>
            </div>
        </div>
    );
};