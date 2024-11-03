import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageInfo {
    url: string;
    alt?: string;
}

interface ImagePreviewProps {
    image: ImageInfo;
    onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, onClose }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-6"
            onClick={handleBackdropClick}
        >
            <div className="relative max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="relative p-4">
                    <img
                        src={image.url}
                        alt={image.alt || "Preview image"}
                        className="w-full h-auto max-h-[80vh] object-contain"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        type="button"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImagePreview;