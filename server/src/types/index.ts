export interface Idiom {
    idiom: string;
    description: string;
    examples: string[];
    examImages?: string[];
    major_type_code: string;
    minor_type_code: string;
}

export interface MajorType {
    type_code: string;
    type_name: string;
    description?: string;
}

export interface MinorType {
    type_code: string;
    major_type_code: string;
    type_name: string;
    description?: string;
}
