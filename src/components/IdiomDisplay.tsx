import React, { useState, useEffect } from 'react';
import { Idiom, ImageInfo } from '../types/idiom';
import { uploadImageToImgbb, updateIdiom } from '../api/idiomApi';
import { X, Upload, ZoomIn, Loader2 } from 'lucide-react';
import ImagePreview from './ImagePreview';

interface IdiomDisplayProps {
    idiom: Idiom;
    onUpdate: (updatedIdiom: Idiom) => void;
}

const IdiomDisplay: React.FC<IdiomDisplayProps> = ({ idiom, onUpdate }) => {
    const [localIdiom, setLocalIdiom] = useState<Idiom>(idiom);
    const [examImages, setExamImages] = useState<ImageInfo[]>(idiom.examImages || []);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setLocalIdiom(idiom);
    }, [idiom]); // 当 idiom 变化时更新 localIdiom

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const imageInfos: ImageInfo[] = [];
            for (const file of files) {
                const imageInfo = await uploadImageToImgbb(file, (progress) => {
                    setUploadProgress(Math.round(progress));
                });
                imageInfos.push(imageInfo);
            }

            const updatedImages = [...examImages, ...imageInfos];
            const updatedIdiom = {
                ...localIdiom,
                examImages: updatedImages,
            };

            await handleUpdateIdiom(updatedIdiom);
            setExamImages(updatedImages);
            setLocalIdiom(updatedIdiom);
        } catch (error) {
            console.error('上传图片失败:', error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDeleteImage = async (index: number) => {
        const updatedImages = examImages.filter((_, i) => i !== index);
        const deleteUrl = examImages[index].deleteUrl;
        if (deleteUrl) {
            try {
                await fetch(deleteUrl, { method: 'DELETE' });
            } catch (error) {
                console.error('删除图片失败:', error);
            }
        }

        const updatedIdiom = {
            ...localIdiom,
            examImages: updatedImages,
        };

        await handleUpdateIdiom(updatedIdiom);
        setExamImages(updatedImages);
        setLocalIdiom(updatedIdiom);
    };

    const handleUpdateIdiom = async (updatedIdiom: Idiom) => {
        try {
            await updateIdiom(updatedIdiom);
            onUpdate(updatedIdiom);
        } catch (error) {
            console.error('更新成语失败:', error);
        }
    };

    const handleSetDescription = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const updatedIdiom = {
            ...localIdiom,
            description: event.target.value,
        };
        setLocalIdiom(updatedIdiom);
    };

    const setEditedExamples = (value: string[]) => {
        const updatedIdiom = {
            ...localIdiom,
            examples: value
        };
        setLocalIdiom(updatedIdiom);
    };

    const handleSave = async () => {
        await handleUpdateIdiom(localIdiom);
        setIsEditing(false);
    };

    const renderImageUploader = () => (
        <div className="mt-4 space-y-4">
            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    multiple
                    disabled={isUploading}
                />
                <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                        ${isUploading ? 'bg-gray-100' : 'hover:bg-gray-50'} transition-colors`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center space-y-2">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <span className="text-sm text-gray-500">上传中... {uploadProgress}%</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500">点击或拖拽上传图片</span>
                        </div>
                    )}
                </label>
            </div>
        </div>
    );

    const renderImages = () => {
        if (examImages.length === 0) {
            return (
                <div className="text-gray-400 text-center py-8">
                    暂无真题图片
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {examImages.map((imageInfo, index) => (
                    <div key={index} className="relative group">
                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                            <img
                                src={imageInfo.url}
                                alt={`真题 ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                        </div>
                        {isEditing ? (
                            <button
                                onClick={() => handleDeleteImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        ) : (
                            <button
                                onClick={() => setSelectedImage(imageInfo)}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ZoomIn size={16} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-3xl font-bold mb-4">{localIdiom.idiom}</h2>
            {isEditing ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            描述
                        </label>
                        <textarea
                            value={localIdiom.description || ''}
                            onChange={handleSetDescription}
                            placeholder="请输入成语描述"
                            className="w-full border rounded p-2 min-h-[100px]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            例句
                        </label>
                        {(localIdiom.examples || []).map((example, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <textarea
                                    value={example || ''}
                                    onChange={(e) => {
                                        const newExamples = [...(localIdiom.examples || [])];
                                        newExamples[index] = e.target.value;
                                        setEditedExamples(newExamples);
                                    }}
                                    placeholder={`请输入例句 ${index + 1}`}
                                    className="w-full border rounded p-2"
                                />
                                <button
                                    onClick={() => {
                                        const newExamples = localIdiom.examples.filter((_, i) => i !== index);
                                        setEditedExamples(newExamples);
                                    }}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    删除
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() => setEditedExamples([...(localIdiom.examples || []), ''])}
                            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            添加例句
                        </button>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">真题示例:</h3>
                        {renderImageUploader()}
                        {renderImages()}
                    </div>

                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handleSave}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            保存
                        </button>
                        <button
                            onClick={() => {
                                setLocalIdiom(idiom);
                                setIsEditing(false);
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">描述:</h3>
                        <p className="text-lg">
                            {localIdiom.description || <span className="text-gray-400">暂无描述</span>}
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-3">例句:</h3>
                        {localIdiom.examples && localIdiom.examples.length > 0 ? (
                            <ul className="space-y-3 list-disc pl-5">
                                {localIdiom.examples.map((example, index) => (
                                    <li key={index} className="text-gray-700">
                                        {example}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">暂无例句</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">真题示例:</h3>
                        {renderImages()}
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        编辑
                    </button>
                </div>
            )}

            {selectedImage && (
                <ImagePreview
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </div>
    );
};

export default IdiomDisplay;