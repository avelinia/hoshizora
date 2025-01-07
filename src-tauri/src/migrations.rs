// src-tauri/src/migrations.rs
use tauri_plugin_sql::{Migration, MigrationKind};

pub fn get_migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../migrations/001_initial_schema.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 2,
            description: "create_default_collections",
            sql: include_str!("../migrations/002_default_collections.sql"),
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "enhance_library_schema",
            sql: include_str!("../migrations/003_enhance_library_schema.sql"),
            kind: MigrationKind::Up,
        },
    ]
}
