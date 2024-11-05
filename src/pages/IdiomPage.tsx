import React, { useState, useEffect } from 'react';
import { getIdioms } from '../api/idiomApi';
import { Idiom } from '../types/idiom';
import IdiomDisplay from '../components/IdiomDisplay';

export const IdiomPage: React.FC = () => {
    const [idiomsData, setIdiomsData] = useState<Idiom[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentIdiom, setCurrentIdiom] = useState<Idiom | null>(null);
    const [suggestions, setSuggestions] = useState<Idiom[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newIdiomName, setNewIdiomName] = useState('');

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

    // 判断成语是否有分类信息
    const hasCategories = (idiom: Idiom): boolean => {
        return Boolean(idiom.major_type_code?.trim() && idiom.minor_type_code?.trim());
    };

    // 对成语进行排序的工具函数
    const compareIdioms = (a: Idiom, b: Idiom): number => {
        // 首先检查是否有分类信息
        const aHasCategories = hasCategories(a);
        const bHasCategories = hasCategories(b);

        // 如果分类信息状态不同，有分类信息的排在前面
        if (aHasCategories !== bHasCategories) {
            return aHasCategories ? -1 : 1;
        }

        // 如果都有分类信息，按照分类顺序排序
        if (aHasCategories && bHasCategories) {
            // 首先按major_type_code排序
            if (a.major_type_code !== b.major_type_code) {
                return a.major_type_code.localeCompare(b.major_type_code);
            }
            // major_type_code相同时，按minor_type_code排序
            if (a.minor_type_code !== b.minor_type_code) {
                return a.minor_type_code.localeCompare(b.minor_type_code);
            }
        }

        // 最后按成语名称排序
        return a.idiom.localeCompare(b.idiom);
    };

        
    const groupIdiomsByType = () => {
        // 创建一个特殊的分组用于未分类的成语
        const UNCLASSIFIED = 'UNCLASSIFIED';
        const grouped = new Map<string, Map<string, Idiom[]>>();
        
        idiomsData.forEach(idiom => {
            const majorCode = hasCategories(idiom) ? idiom.major_type_code : UNCLASSIFIED;
            const minorCode = hasCategories(idiom) ? idiom.minor_type_code : UNCLASSIFIED;
            
            if (!grouped.has(majorCode)) {
                grouped.set(majorCode, new Map<string, Idiom[]>());
            }
            
            const majorGroup = grouped.get(majorCode)!;
            if (!majorGroup.has(minorCode)) {
                majorGroup.set(minorCode, []);
            }
            
            majorGroup.get(minorCode)!.push(idiom);
        });
        
        // 确保未分类的成语组始终排在最后
        const sortedGroups = new Map<string, Map<string, Idiom[]>>(
            Array.from(grouped.entries()).sort((a, b) => {
                if (a[0] === UNCLASSIFIED) return 1;
                if (b[0] === UNCLASSIFIED) return -1;
                return a[0].localeCompare(b[0]);
            })
        );

        return sortedGroups;
    };

    const findNextIdiom = (direction: 'next' | 'previous'): Idiom => {
        if (!currentIdiom || idiomsData.length === 0) return idiomsData[0];

        const groupedIdioms = groupIdiomsByType();
        const majorCodes = Array.from(groupedIdioms.keys());
        
        // 找到当前成语所在的分组
        const currentMajor = hasCategories(currentIdiom) ? 
            currentIdiom.major_type_code : 
            'UNCLASSIFIED';
            
        const currentMinor = hasCategories(currentIdiom) ? 
            currentIdiom.minor_type_code : 
            'UNCLASSIFIED';

        const currentMajorIndex = majorCodes.indexOf(currentMajor);
        const currentMajorGroup = groupedIdioms.get(currentMajor)!;
        const minorCodes = Array.from(currentMajorGroup.keys());
        const currentMinorIndex = minorCodes.indexOf(currentMinor);
        const currentMinorIdioms = currentMajorGroup.get(currentMinor)!;
        const currentIdiomIndex = currentMinorIdioms.findIndex(
            idiom => idiom.idiom === currentIdiom.idiom
        );

        if (direction === 'next') {
            // 尝试在当前小类中找下一个成语
            if (currentIdiomIndex < currentMinorIdioms.length - 1) {
                return currentMinorIdioms[currentIdiomIndex + 1];
            }
            
            // 尝试找下一个小类
            if (currentMinorIndex < minorCodes.length - 1) {
                const nextMinorCode = minorCodes[currentMinorIndex + 1];
                return currentMajorGroup.get(nextMinorCode)![0];
            }
            
            // 移动到下一个大类的第一个小类的第一个成语
            if (currentMajorIndex < majorCodes.length - 1) {
                const nextMajorCode = majorCodes[currentMajorIndex + 1];
                const nextMajorGroup = groupedIdioms.get(nextMajorCode)!;
                const firstMinorCode = Array.from(nextMajorGroup.keys())[0];
                return nextMajorGroup.get(firstMinorCode)![0];
            }
            
            // 如果已经是最后一个大类，回到第一个大类
            const firstMajorGroup = groupedIdioms.get(majorCodes[0])!;
            const firstMinorCode = Array.from(firstMajorGroup.keys())[0];
            return firstMajorGroup.get(firstMinorCode)![0];
        } else {
            // 尝试在当前小类中找上一个成语
            if (currentIdiomIndex > 0) {
                return currentMinorIdioms[currentIdiomIndex - 1];
            }
            
            // 尝试找上一个小类
            if (currentMinorIndex > 0) {
                const prevMinorCode = minorCodes[currentMinorIndex - 1];
                const prevMinorIdioms = currentMajorGroup.get(prevMinorCode)!;
                return prevMinorIdioms[prevMinorIdioms.length - 1];
            }
            
            // 移动到上一个大类的最后一个小类的最后一个成语
            if (currentMajorIndex > 0) {
                const prevMajorCode = majorCodes[currentMajorIndex - 1];
                const prevMajorGroup = groupedIdioms.get(prevMajorCode)!;
                const lastMinorCode = Array.from(prevMajorGroup.keys()).pop()!;
                const lastMinorIdioms = prevMajorGroup.get(lastMinorCode)!;
                return lastMinorIdioms[lastMinorIdioms.length - 1];
            }
            
            // 如果已经是第一个大类，移动到最后一个大类
            const lastMajorCode = majorCodes[majorCodes.length - 1];
            const lastMajorGroup = groupedIdioms.get(lastMajorCode)!;
            const lastMinorCode = Array.from(lastMajorGroup.keys()).pop()!;
            const lastMinorIdioms = lastMajorGroup.get(lastMinorCode)!;
            return lastMinorIdioms[lastMinorIdioms.length - 1];
        }
    };

    const handleNext = () => {
        const nextIdiom = findNextIdiom('next');
        setCurrentIdiom(nextIdiom);
    };

    const handlePrevious = () => {
        const prevIdiom = findNextIdiom('previous');
        setCurrentIdiom(prevIdiom);
    };

    // 其他现有函数保持不变...
    const handleSelectIdiom = (selectedIdiom: Idiom) => {
        setCurrentIdiom(selectedIdiom);
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const handleAddIdiom = () => {
        setIsDialogOpen(true);
    };

    const handleDialogSubmit = () => {
        if (newIdiomName) {
            // 获取当前成语的分类信息（如果存在）
            const defaultMajorType = currentIdiom?.major_type_code || "";
            const defaultMinorType = currentIdiom?.minor_type_code || "";

            const newIdiom: Idiom = {
                idiom: newIdiomName,
                description: "",
                examples: [],
                examImages: [],
                major_type_code: defaultMajorType,
                minor_type_code: defaultMinorType,
            };

            handleUpdateIdiom(newIdiom);
            setNewIdiomName('');
            setIsDialogOpen(false);
        }
    };


    const handleUpdateIdiom = (updatedIdiom: Idiom) => {
        setIdiomsData(prevIdioms => {
            const existingIndex = prevIdioms.findIndex(idiom => idiom.idiom === updatedIdiom.idiom);
            let updatedIdioms: Idiom[];
            
            if (existingIndex !== -1) {
                // 更新现有成语
                updatedIdioms = [...prevIdioms];
                updatedIdioms[existingIndex] = updatedIdiom;
            } else {
                // 添加新成语
                updatedIdioms = [...prevIdioms, updatedIdiom];
            }

            // 使用新的排序逻辑
            return updatedIdioms.sort(compareIdioms);
        });

        setCurrentIdiom(updatedIdiom);
    };

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
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
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