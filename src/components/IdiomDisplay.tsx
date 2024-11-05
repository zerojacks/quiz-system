import React, { useState, useEffect } from 'react';
import { Idiom, ImageInfo } from '../types/idiom';
import { uploadImageToImgbb, updateIdiom, getIdiomApi } from '../api/idiomApi';
import { X, Upload, ZoomIn, Loader2, Edit } from 'lucide-react';
import ImagePreview from './ImagePreview';
import IdiomTypeDisplay from './IdiomTypeDisplay';
import { toast } from 'react-toastify';

interface IdiomDisplayProps {
    idiom: Idiom;
    onUpdate: (updatedIdiom: Idiom) => void;
}

interface UploadingInfo {
    state: boolean;
    content: string;
}

const UPDATE_TIMEOUT = 30000; // 30 seconds timeout for updates

const IdiomDisplay: React.FC<IdiomDisplayProps> = ({ idiom, onUpdate }) => {
    const [localIdiom, setLocalIdiom] = useState<Idiom>(idiom);
    const [examImages, setExamImages] = useState<ImageInfo[]>(idiom.examImages || []);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadinginfo, setUploadingInfo] = useState<UploadingInfo>({state:false, content:""});
    const [updateTimer, setUpdateTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getidiominfo = async() => {
            setIsLoading(true);
            const timer = startUpdateTimeout();
            setUploadingInfo({state:true, content:"正在读取，请稍后..."});
            try {
                const getidiom = await getIdiomApi(idiom.idiom);
                if (getidiom) {
                    setLocalIdiom(getidiom);
                    setExamImages(getidiom.examImages || []);
                } else {
                    toast.error('获取成语信息失败，请重试');
                    setExamImages([]);
                    setLocalIdiom(idiom);
                }       
            } catch (error) {
                setExamImages([]);
                setLocalIdiom(idiom);
            } finally {
                clearUpdateTimeout(timer);
                setUploadingInfo({state:false, content:""});
                setIsLoading(false);
            }
        }
        getidiominfo();
    }, [idiom]);

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => {
            if (updateTimer) {
                clearTimeout(updateTimer);
            }
        };
    }, [updateTimer]);

    const startUpdateTimeout = () => {
        const timer = setTimeout(() => {
            setUploadingInfo({state:false, content:""});
            toast.error('更新超时，请重试');
        }, UPDATE_TIMEOUT);
        setUpdateTimer(timer);
        return timer;
    };

    const clearUpdateTimeout = (timer: ReturnType<typeof setTimeout>) => {
        clearTimeout(timer);
        setUpdateTimer(null);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || isUploading) return;

        setIsUploading(true);
        setUploadProgress(0);

        const timer = startUpdateTimeout();

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
            toast.success('图片上传成功！');
        } catch (error) {
            console.error('上传图片失败:', error);
            toast.error('上传图片失败，请重试。');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            clearUpdateTimeout(timer);
        }
    };

    const handleDeleteImage = async (index: number) => {
        if (uploadinginfo.state) return;
        setUploadingInfo({state:true, content:"正在删除图片，请稍后..."});
        const timer = startUpdateTimeout();

        try {
            const updatedImages = examImages.filter((_, i) => i !== index);
            const updatedIdiom = {
                ...localIdiom,
                examImages: updatedImages,
            };
            await handleUpdateIdiom(updatedIdiom);
            setExamImages(updatedImages);
            setLocalIdiom(updatedIdiom);
            toast.success('图片删除成功！');
        } catch (error) {
            toast.error('删除图片失败，请重试。');
        } finally {
            setUploadingInfo({state:false, content:""});
            clearUpdateTimeout(timer);
        }
    };

    const handleUpdateIdiom = async (updatedIdiom: Idiom) => {
        if (uploadinginfo.state) return;
        setUploadingInfo({state:true, content:"正在更新，请稍后..."});
        const timer = startUpdateTimeout();

        try {
            await updateIdiom(updatedIdiom);
            onUpdate(updatedIdiom);
            toast.success('成语更新成功！');
        } catch (error) {
            console.error('更新成语失败:', error);
            toast.error('更新成语失败，请重试。');
            throw error;
        } finally {
            setUploadingInfo({state:false, content:""});
            clearUpdateTimeout(timer);
        }
    };

    const handleSave = async () => {
        if (uploadinginfo.state) return;

        try {
            await handleUpdateIdiom(localIdiom);
            setIsEditing(false);
        } catch (error) {
            // Error already handled in handleUpdateIdiom
            toast.error('更新成语失败，请重试。');
        };
    };

    const handleTypeUpdated = async (idiom: Idiom) => {
        const updatedIdiom = {
            ...localIdiom,
            major_type_code: idiom.major_type_code,
            minor_type_code: idiom.minor_type_code,
        };
        setLocalIdiom(updatedIdiom);
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

    const highlightIdiom = (text: string) => {
        return text.replace(
            new RegExp(localIdiom.idiom, 'g'),
            `<span class="bg-green-200">${localIdiom.idiom}</span>`
        );
    };

    const LoadingSkeleton = () => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse space-y-6">
                {/* Title skeleton */}
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                
                {/* Type info skeleton */}
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                
                {/* Description section */}
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">描述:</h3>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                </div>
                
                {/* Examples section */}
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">例句:</h3>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
                
                {/* Images section */}
                <div className="space-y-2">
                    <h3 className="text-xl font-semibold">真题示例:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="aspect-w-16 aspect-h-9">
                                <div className="w-full h-full bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <LoadingSkeleton />;
    }
    
    return (
        <div className="bg-white rounded-lg shadow p-6 relative">
            <button
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors disabled:opacity-50"
                disabled={uploadinginfo.state}
                title="编辑"
            >
                <Edit size={20} />
            </button>
            <h2 className="text-3xl font-bold mb-4">{localIdiom.idiom}</h2>
            <IdiomTypeDisplay idiom={localIdiom} isEditing={isEditing} onUpdate={handleTypeUpdated} />
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

                    <div className='w-full'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            例句
                        </label>
                        {(localIdiom.examples || []).map((example, index) => (
                            <div key={index} className="flex gap-2 mb-2 max-h-72 overflow-auto">
                                <textarea
                                    value={example || ''}
                                    onChange={(e) => {
                                        const newExamples = [...(localIdiom.examples || [])];
                                        newExamples[index] = e.target.value;
                                        setEditedExamples(newExamples);
                                    }}
                                    placeholder={`请输入例句 ${index + 1}`}
                                    className="w-full border rounded p-2 max-h-72 overflow-auto"
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
                        <div className="flex justify-end"> {/* 添加此 div 以右对齐按钮 */}
                            <button
                                onClick={() => setEditedExamples([...(localIdiom.examples || []), ''])}
                                className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                添加例句
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-3">真题示例:</h3>
                        {renderImageUploader()}
                        {renderImages()}
                    </div>

                    <div className="flex justify-end gap-4 mt-6 items-end flex-row"> {/* 修改为 justify-end */}
                        <button
                            onClick={handleSave}
                            disabled={uploadinginfo.state}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploadinginfo.state ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    保存中...
                                </>
                            ) : (
                                '保存'
                            )}
                        </button>
                        <button
                            onClick={() => {
                                setLocalIdiom(idiom);
                                setIsEditing(false);
                            }}
                            disabled={uploadinginfo.state}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            取消
                        </button>
                    </div>
                </div>
            ) : (
                <div className='p-4 '>
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
                                    <li
                                        key={index}
                                        dangerouslySetInnerHTML={{ __html: highlightIdiom(example) }}
                                        className="text-gray-700"
                                    />
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
                </div>
            )}

            {selectedImage && (
                <ImagePreview
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
            {/* Loading overlay */}
            {uploadinginfo.state && (
                <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg flex items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span>{uploadinginfo.content}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdiomDisplay;