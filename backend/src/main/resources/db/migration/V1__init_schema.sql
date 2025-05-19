CREATE TABLE conversation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT
);

CREATE TABLE message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT,
    content TEXT,
    timestamp DATETIME,
    conversation_id INTEGER,
    FOREIGN KEY (conversation_id) REFERENCES conversation(id)
);