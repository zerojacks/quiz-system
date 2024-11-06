import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIdioms, fetchAllMajorTypes, fetchAllMinorTypes } from '../api/idiomApi';
import { Idiom, MajorInfo, MinorInfo } from '../types/idiom';
import { ChevronRightIcon, Menu, X } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

// 骨架屏组件
const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// 类型选择器骨架屏
const TypeSelectorSkeleton = () => (
    <div className="space-y-2 px-4">
        {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
        ))}
    </div>
);

// 成语卡片骨架屏
const IdiomCardSkeleton = () => (
    <div className="bg-white shadow-md rounded-lg p-4 flex items-center">
        <div className="flex-1 min-w-0">
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-4/5 mt-2" />
        </div>
        <Skeleton className="h-6 w-6 ml-4 flex-shrink-0" />
    </div>
);

// 内容区域骨架屏
const ContentSkeleton = () => (
    <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <div key={sectionIndex} className="space-y-4">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, cardIndex) => (
                        <IdiomCardSkeleton key={cardIndex} />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

interface IdiomGroup {
    majorTypeName: string;
    minorTypes: {
        [key: string]: {
            minorTypeName: string;
            idioms: Idiom[];
        };
    };
}

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
            <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-bold truncate">{idiom.idiom}</h3>
                <p className="text-gray-600 mt-2 text-sm md:text-base line-clamp-2">{idiom.description}</p>
            </div>
            <ChevronRightIcon className="h-6 w-6 text-gray-500 ml-4 flex-shrink-0" />
        </div>
    );
};

interface TypeSelectorProps {
    allMajorCode: string[];
    majorTypes: MajorInfo[];
    activeTab: string | null;
    onTabChange: (code: string) => void;
    className?: string;
}
const getMajorName = (code: string, majorTypes: MajorInfo[]): string =>
    majorTypes.find((type) => type.type_code === code)?.type_name ?? '未分类';
// ... existing code ...
const TypeSelector: React.FC<TypeSelectorProps> = ({ allMajorCode, majorTypes, activeTab, onTabChange, className }) => {
    console.log(allMajorCode);
    return (
        <List
            height={600}
            itemCount={allMajorCode.length}
            itemSize={50}
            width="100%"
            className={`${className} h-full`}
        >
            {({ index, style }) => (
                <div
                    key={allMajorCode[index]}
                    style={style}
                    className={`px-4 py-2 rounded-md cursor-pointer transition-colors items-center shrink-0 truncate ${allMajorCode[index] === activeTab
                        ? 'bg-gray-400 shadow-md font-medium'
                        : 'hover:bg-gray-200'
                        }`}
                    onClick={() => onTabChange(allMajorCode[index])}
                >
                    <span className="text-sm md:text-base">{getMajorName(allMajorCode[index], majorTypes)}</span>
                </div>
            )}
        </List>
    );
};

const IdiomCards: React.FC = () => {
    const navigate = useNavigate(); // 改用正确的命名
    const [idioms, setIdioms] = useState<Idiom[]>([]);
    const [majorTypes, setMajorTypes] = useState<MajorInfo[]>([]);
    const [minorTypes, setMinorTypes] = useState<MinorInfo[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [idiomGroups, setIdiomGroups] = useState<{ [key: string]: IdiomGroup }>({});
    const UNCLASSIFIED = 'UNCLASSIFIED';

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [allIdioms, allMajorTypes, allMinorTypes] = await Promise.all([
                    getIdioms(),
                    fetchAllMajorTypes(),
                    fetchAllMinorTypes()
                ]);
                setIdioms(allIdioms);
                allMajorTypes.push({ type_code: UNCLASSIFIED, type_name: '未分类', description: '未分类' })
                allMinorTypes.push({ type_code: UNCLASSIFIED, major_type_code: UNCLASSIFIED, type_name: '未分类', description: '未分类' })
                setMajorTypes(allMajorTypes);
                setMinorTypes(allMinorTypes);
                setActiveTab(allMajorTypes[0]?.type_code ?? null);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const groupedIdioms = groupIdiomsByType();
        setIdiomGroups(groupedIdioms);
    }, [idioms, majorTypes, minorTypes]); // 添加所有相关依赖

    const hasCategories = (idiom: Idiom): boolean => {
        return Boolean(idiom.major_type_code?.trim() && idiom.minor_type_code?.trim());
    };

    const groupIdiomsByType = () => {
        const grouped: { [key: string]: IdiomGroup } = {};

        idioms.forEach(idiom => {
            const majorCode = hasCategories(idiom) ? idiom.major_type_code : UNCLASSIFIED;
            const majorType = majorTypes.find(type => type.type_code === majorCode);
            const minorCode = hasCategories(idiom) ? idiom.minor_type_code : UNCLASSIFIED;
            const minorType = minorTypes.find(type => type.type_code === minorCode);
            if (!grouped[majorCode]) {
                grouped[majorCode] = {
                    majorTypeName: majorType?.type_name ?? 'Unclassified',
                    minorTypes: {}
                };
            }

            if (!grouped[majorCode].minorTypes[minorCode]) {
                grouped[majorCode].minorTypes[minorCode] = {
                    minorTypeName: minorType?.type_name ?? 'Unclassified',
                    idioms: []
                };
            }

            grouped[majorCode].minorTypes[minorCode].idioms.push(idiom);
        });

        // Sort groups
        return Object.fromEntries(
            Object.entries(grouped).sort(([a], [b]) => {
                if (a === UNCLASSIFIED) return 1;
                if (b === UNCLASSIFIED) return -1;
                return a.localeCompare(b);
            })
        );
    };



    const handleTabChange = (tabCode: string) => {
        setActiveTab(tabCode);
        setIsMenuOpen(false);
    };

    const handleIdiomSelect = (idiom: Idiom) => {
        navigate(`/idiom/${idiom.idiom}`);
    };

    const filteredIdiomGroups = React.useMemo(() => {
        if (!activeTab || !idiomGroups[activeTab]) {
            return idiomGroups;
        }
        return { [activeTab]: idiomGroups[activeTab] };
    }, [activeTab, idiomGroups]);

    const getColorFromString = (str: string) => {
        const hash = Array.from(str).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360; // 生成色相
        return `hsl(${hue}, 70%, 70%)`; // 使用 HSL 颜色
    };

    if (isLoading) {
        return (
            <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
                <div className="hidden md:block w-1/4 bg-gray-100 p-6">
                    <TypeSelectorSkeleton />
                </div>
                <div className="flex-1 p-4 md:p-6">
                    <ContentSkeleton />
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col w-full h-full md:flex-row min-h-screen bg-gray-50">
            {/* Mobile Menu Button */}
            <div className="md:hidden p-4 bg-white shadow-sm">
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6 text-gray-600" />
                </button>
            </div>

            {/* Mobile Navigation Dialog */}
            <Transition appear show={isMenuOpen} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-50 h-full md:hidden"
                    onClose={() => setIsMenuOpen(false)}
                >
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </TransitionChild>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <TransitionChild
                                as={Fragment}
                                enter="transform transition ease-out duration-300"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in duration-300"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <DialogPanel className="fixed inset-y-0 left-0 max-w-[300px] w-full bg-white shadow-xl">
                                    <div className="h-full flex flex-col">
                                        <div className="px-4 py-6 flex items-center justify-between border-b">
                                            <DialogTitle className="text-xl font-semibold">
                                                成语分类
                                            </DialogTitle>
                                            <button
                                                onClick={() => setIsMenuOpen(false)}
                                                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                                                aria-label="Close menu"
                                            >
                                                <X className="h-5 w-5 text-gray-600" />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto px-2 py-4 h-full">
                                            {isLoading ? (
                                                <TypeSelectorSkeleton />
                                            ) : (
                                                <TypeSelector
                                                    allMajorCode={Object.keys(idiomGroups).sort((a, b) => a === 'UNCLASSIFIED' ? 1 : b === 'UNCLASSIFIED' ? -1 : a.localeCompare(b))}
                                                    majorTypes={majorTypes}
                                                    activeTab={activeTab}
                                                    onTabChange={handleTabChange}
                                                    className="w-full h-full overflow-y-auto"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Desktop Navigation */}
            <div className="hidden md:block w-1/4 bg-gray-100 p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">成语分类</h2>
                {isLoading ? (
                    <TypeSelectorSkeleton />
                ) : (
                    <TypeSelector
                        allMajorCode={Object.keys(idiomGroups).sort((a, b) => a === 'UNCLASSIFIED' ? 1 : b === 'UNCLASSIFIED' ? -1 : a.localeCompare(b))}
                        majorTypes={majorTypes}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                    />
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <h2 className="text-xl md:text-2xl font-bold mb-4">
                    {majorTypes.find(type => type.type_code === activeTab)?.type_name ?? '所有成语'}
                </h2>
                <div className="space-y-6">
                    {Object.entries(filteredIdiomGroups).map(([majorCode, majorGroup]) => {
                        if (!majorGroup || !majorGroup.minorTypes) return null;

                        return Object.entries(majorGroup.minorTypes).map(([minorCode, minorGroup]) => {
                            if (!minorGroup || !minorGroup.idioms) return null;
                            const backgroundColor = getColorFromString(minorGroup.minorTypeName || '未分类');
                            return (
                                <div key={`${majorCode}-${minorCode}`} className="mb-8">
                                    <div className="relative inline-block">
                                        {/* 不规则高亮背景 */}
                                        <div className="absolute inset-0 m-0 p-0 bg-opacity-50" style={{
                                            backgroundColor: backgroundColor, // 可自定义颜色
                                            clipPath: 'polygon(20% 0%, 100% 0%, 100% 80%, 80% 100%, 0% 100%, 0% 20%)'
                                        }}></div>
                                        <span className="relative z-10 text-lg font-bold text-gray-900 p-2">
                                            {minorGroup.minorTypeName || '未分类'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {minorGroup.idioms.map(idiom => (
                                            <IdiomCard
                                                key={idiom.idiom}
                                                idiom={idiom}
                                                onSelect={handleIdiomSelect}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        });
                    })}
                </div>
            </div>
        </div>
    );
};

export default IdiomCards;