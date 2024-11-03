export interface ImageInfo {
    url: string;        // 图片的 URL
    deleteUrl: string;  // 删除链接
}

export interface Idiom {
    idiom: string;
    description: string;
    examples: string[];
    examImages: ImageInfo[]; // 修改为 ImageInfo 数组
}