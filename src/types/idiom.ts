export interface ImageInfo {
    url: string;        // 图片的 URL
    deleteUrl: string;  // 删除链接
}

export interface MajorInfo {
    type_code: string;
    type_name: string;
    description: string;
}

export interface MinorInfo {
    type_code: string;
    major_type_code: string;
    type_name: string;
    description: string;
}

export interface Idiom {
    idiom: string;
    description: string;
    examples: string[];
    examImages: ImageInfo[]; // 修改为 ImageInfo 数组
    major_type_code: string;
    minor_type_code: string;
}