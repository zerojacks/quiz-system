import React, { useState, useEffect } from 'react';
import idiomsData from '../data/idioms.json';

export const IdiomPage: React.FC = () => {
    const [currentIdiom, setCurrentIdiom] = useState(idiomsData[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<typeof idiomsData>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedDescription, setEditedDescription] = useState(currentIdiom.description);
    const [editedExamples, setEditedExamples] = useState(currentIdiom.examples);

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
    }, [searchTerm]);

    // 当前成语变化时更新编辑状态
    useEffect(() => {
        setEditedDescription(currentIdiom.description);
        setEditedExamples([...currentIdiom.examples]);
        setIsEditing(false);
    }, [currentIdiom]);

    const handleSelectIdiom = (selectedIdiom: typeof idiomsData[0]) => {
        setCurrentIdiom(selectedIdiom);
        setSearchTerm('');
        setShowSuggestions(false);
    };

    const handleNext = () => {
        const currentIndex = idiomsData.findIndex(idiom => idiom.idiom === currentIdiom.idiom);
        const nextIndex = (currentIndex + 1) % idiomsData.length;
        setCurrentIdiom(idiomsData[nextIndex]);
    };

    const handlePrevious = () => {
        const currentIndex = idiomsData.findIndex(idiom => idiom.idiom === currentIdiom.idiom);
        const prevIndex = (currentIndex - 1 + idiomsData.length) % idiomsData.length;
        setCurrentIdiom(idiomsData[prevIndex]);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        const updatedIdiom = {
            ...currentIdiom,
            description: editedDescription,
            examples: editedExamples
        };
        
        try {
            // 发送更新后的数据到 Cloudflare Worker
            const response = await fetch('https://quiz-system.zerojack-shi.workers.dev/update-idiom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedIdiom),
            });
    
            if (!response.ok) {
                throw new Error('网络错误');
            }
    
            setCurrentIdiom(updatedIdiom);
            setIsEditing(false);
        } catch (error) {
            console.error('保存失败:', error);
        }
    };
    

    const highlightIdiom = (text: string) => {
        return text.replace(
            new RegExp(currentIdiom.idiom, 'g'),
            `<span class="bg-green-200">${currentIdiom.idiom}</span>`
        );
    };

    const handleSearch = (event: React.KeyboardEvent) => {
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            const searchInput = document.getElementById('search-input');
            searchInput?.focus();
        }
    };

    return (
        <div className="p-4 max-w-3xl mx-auto" onKeyDown={handleSearch}>
            <div className="relative mb-6">
                <input
                    id="search-input"
                    type="text"
                    placeholder="搜索成语 (Ctrl + K)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {showSuggestions && (
                    <ul className="absolute w-full mt-1 max-h-60 overflow-auto bg-white border rounded-lg shadow-lg z-10">
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

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-3xl font-bold mb-4">{currentIdiom.idiom}</h2>
                {isEditing ? (
                    <div className="space-y-4">
                        <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            className="w-full border rounded p-2 min-h-[100px]"
                        />
                        {editedExamples.map((example, index) => (
                            <textarea
                                key={index}
                                value={example}
                                onChange={(e) => {
                                    const newExamples = [...editedExamples];
                                    newExamples[index] = e.target.value;
                                    setEditedExamples(newExamples);
                                }}
                                className="w-full border rounded p-2"
                            />
                        ))}
                        <button
                            onClick={handleSave}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            保存
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-lg mb-6">{currentIdiom.description}</p>
                        <h3 className="text-xl font-semibold mb-3">例句:</h3>
                        <ul className="space-y-3 list-disc pl-5">
                            {currentIdiom.examples.map((example, index) => (
                                <li
                                    key={index}
                                    dangerouslySetInnerHTML={{ __html: highlightIdiom(example) }}
                                    className="text-gray-700"
                                />
                            ))}
                        </ul>
                        <button
                            onClick={handleEdit}
                            className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            编辑
                        </button>
                    </div>
                )}
            </div>

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
            </div>
        </div>
    );
};