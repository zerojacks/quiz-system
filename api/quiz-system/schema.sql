DROP TABLE IF EXISTS idioms;
CREATE TABLE IF NOT EXISTS idioms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idiom TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  examples TEXT NOT NULL,
  exam_images TEXT
);

CREATE TABLE idiom_major_types (
    type_code TEXT PRIMARY KEY,
    type_name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE idiom_minor_types (
    type_code TEXT PRIMARY KEY,
    major_type_code TEXT NOT NULL,
    type_name TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (major_type_code) REFERENCES idiom_major_types(type_code)
);