-- 删除旧表（按照外键依赖顺序）
DROP TABLE IF EXISTS idioms;
DROP TABLE IF EXISTS minor_types;
DROP TABLE IF EXISTS major_types;

-- 创建新表
-- 创建 idiom_major_types 表
CREATE TABLE IF NOT EXISTS idiom_major_types (
    type_code VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 创建 idiom_minor_types 表
CREATE TABLE IF NOT EXISTS idiom_minor_types (
    type_code VARCHAR(50) PRIMARY KEY,
    major_type_code VARCHAR(50) NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (major_type_code) REFERENCES idiom_major_types(type_code)
);

-- 创建 idioms 表
CREATE TABLE IF NOT EXISTS idioms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idiom VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    examples JSON NOT NULL,
    exam_images JSON,
    major_type_code VARCHAR(50) NOT NULL,
    minor_type_code VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (major_type_code) REFERENCES idiom_major_types(type_code),
    FOREIGN KEY (minor_type_code) REFERENCES idiom_minor_types(type_code)
);
