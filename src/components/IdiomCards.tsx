import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIdioms, fetchAllMajorTypes, fetchAllMinorTypes } from '../api/idiomApi';
import { Idiom, MajorInfo, MinorInfo } from '../types/idiom';
import { ChevronRightIcon } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';

interface IdiomCardProps {
    idiom: Idiom;
    onSelect: (idiom: Idiom) => void;
}

const IdiomCard: React.FC<IdiomCardProps> = ({ idiom, onSelect }) => {
    return (
        <div
            className="bg-white shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors flex items-center"
            onClick={() => onSelect(idiom)}
        >
            <div className="flex-1">
                <h3 className="text-xl font-bold">{idiom.idiom}</h3>
                <p className="text-gray-600 mt-2">{idiom.description}</p>
            </div>
            <ChevronRightIcon className="text-gray-500 ml-4" />
        </div>
    );
};

const IdiomCards: React.FC = () => {
    const history = useNavigate();
    const [idioms, setIdioms] = useState<Idiom[]>([]);
    const [majorTypes, setMajorTypes] = useState<MajorInfo[]>([]);
    const [minorTypes, setMinorTypes] = useState<MinorInfo[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allIdioms, allMajorTypes, allMinorTypes] = await Promise.all([
                    getIdioms(),
                    fetchAllMajorTypes(),
                    fetchAllMinorTypes()
                ]);
                setIdioms(allIdioms);
                setMajorTypes(allMajorTypes);
                setMinorTypes(allMinorTypes);
                setActiveTab(allMajorTypes[0]?.type_code);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);

    const handleTabChange = (tabCode: string) => {
        setActiveTab(tabCode);
    };

    const handleIdiomSelect = (idiom: Idiom) => {
        console.log("selectid", idiom);
        history(`/idiom/${idiom.idiom}`);
    };

    const filteredIdioms = activeTab
        ? idioms.filter(idiom => idiom.major_type_code === activeTab)
        : idioms;

    const groupedIdiomsByMinorType = filteredIdioms.reduce((acc, idiom) => {
        const majorType = majorTypes.find(type => type.type_code === idiom.major_type_code) || { type_code: '其他', type_name: '其他类型' }; // 处理 type_code 为 '' 或 null 的情况
        const minorType = minorTypes.find(type => type.type_code === idiom.minor_type_code);
        if (majorType) {
            if (!acc[majorType.type_code]) {
                acc[majorType.type_code] = {
                    majorTypeName: majorType.type_name,
                    minorTypes: {}
                };
            }
            if (!acc[majorType.type_code].minorTypes[minorType?.type_code || '其他']) { // 处理 minorType 为 undefined 的情况
                acc[majorType.type_code].minorTypes[minorType?.type_code || '其他'] = {
                    minorTypeName: minorType?.type_name || '其他类型',
                    idioms: []
                };
            }
            acc[majorType.type_code].minorTypes[minorType?.type_code || '其他'].idioms.push(idiom);
        }
        return acc;
    }, {} as Record<string, { majorTypeName: string; minorTypes: Record<string, { minorTypeName: string; idioms: Idiom[] }> }>);

    return (
        <div className="flex h-full">
            <div className="bg-gray-100 p-6 w-1/4 rounded-l-lg overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">成语分类</h2>
                <List
                    height={window.innerHeight - 300} // 设置列表高度
                    itemCount={majorTypes.length}
                    itemSize={50} // 每个项的高度
                    width="100%"
                >
                    {({ index, style }) => (
                        <div
                            key={majorTypes[index].type_code}
                            style={style}
                            className={`px-4 py-2 rounded-md cursor-pointer transition-colors ${majorTypes[index].type_code === activeTab
                                ? 'bg-white shadow-md font-medium'
                                : 'hover:bg-gray-200'
                                }`}
                            onClick={() => handleTabChange(majorTypes[index].type_code)}
                        >
                            {majorTypes[index].type_name}
                        </div>
                    )}
                </List>
            </div>
            <div className="flex-1 p-6 rounded-r-lg overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{activeTab ? majorTypes.find(type => type.type_code === activeTab)?.type_name : 'All Idioms'}</h2>
                <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                    {Object.values(groupedIdiomsByMinorType).map(majorType => (
                        <div key={majorType.majorTypeName} className="mb-8">
                            <div className="space-y-4">
                                {Object.values(majorType.minorTypes).map(minorType => (
                                    <div key={minorType.minorTypeName}>
                                        <h4 className="text-lg font-medium mb-2">{minorType.minorTypeName}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {minorType.idioms.map(idiom => (
                                                <IdiomCard key={idiom.idiom} idiom={idiom} onSelect={handleIdiomSelect} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default IdiomCards;