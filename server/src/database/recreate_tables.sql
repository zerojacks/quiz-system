-- 删除旧表（按照外键依赖顺序）
DROP TABLE IF EXISTS idioms;
DROP TABLE IF EXISTS minor_types;
DROP TABLE IF EXISTS major_types;

-- 创建新表
-- 创建成语主分类表
CREATE TABLE idiom_major_types (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建成语次分类表
CREATE TABLE idiom_minor_types (
    type_code VARCHAR(50) PRIMARY KEY,
    major_type_code VARCHAR(50) NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    FOREIGN KEY (major_type_code) REFERENCES idiom_major_types(type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建成语主表
CREATE TABLE idioms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    idiom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    examples TEXT NOT NULL,
    exam_images TEXT,
    major_type_code VARCHAR(50),
    minor_type_code VARCHAR(50),
    FOREIGN KEY (major_type_code) REFERENCES idiom_major_types(type_code),
    FOREIGN KEY (minor_type_code) REFERENCES idiom_minor_types(type_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;