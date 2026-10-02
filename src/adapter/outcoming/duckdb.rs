use duckdb::{Connection, params};

use crate::model::game::Game;
use crate::model::platform::GameConsole;

pub struct InventoryDatabase {
    connection: Connection,
}

impl InventoryDatabase {
    pub fn new() -> Self {
        let connection = Connection::open("inventory_db.duckdb").unwrap();
        Self { connection }
    }

    pub fn drop_database(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.connection.execute_batch(
            r#"
            DROP TABLE IF EXISTS games;
            DROP TABLE IF EXISTS consoles;
            DROP TABLE IF EXISTS price_point;
            DROP TABLE IF EXISTS image;
            DROP SEQUENCE IF EXISTS game_id_seq;
            DROP SEQUENCE IF EXISTS console_id_seq;
            DROP SEQUENCE IF EXISTS price_point_id_seq;
            DROP SEQUENCE IF EXISTS image_id_seq;
            "#,
        )?;
        Ok(())
    }

    pub fn create_schemas(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.connection.execute_batch(
            r#"
            CREATE SEQUENCE IF NOT EXISTS game_id_seq;
            CREATE SEQUENCE IF NOT EXISTS console_id_seq;
            CREATE SEQUENCE IF NOT EXISTS price_point_id_seq;
            CREATE SEQUENCE IF NOT EXISTS image_id_seq;
            CREATE TABLE IF NOT EXISTS games (
                id INTEGER PRIMARY KEY DEFAULT nextval('game_id_seq'),
                title TEXT NOT NULL,
                publisher TEXT,
                genre TEXT NOT NULL,
                market_price NUMERIC,
                buy_price NUMERIC,
                console_platform TEXT NOT NULL,
                cover_url TEXT,
                condition TEXT,
                added_at DATE NOT NULL DEFAULT CURRENT_DATE,
                release_year INTEGER,
                entity_id INTEGER NOT NULL,
                FOREIGN KEY(entity_id) REFERENCES price_point(id),
                image_id INTEGER,
                FOREIGN KEY(image_id) REFERENCES images(id)
            );
            CREATE TABLE IF NOT EXISTS consoles (
                id INTEGER PRIMARY KEY DEFAULT nextval('console_id_seq'),
                name TEXT NOT NULL,
                short_name TEXT NOT NULL,
                manufacturer TEXT NOT NULL,
                release_year INTEGER,
                market_price NUMERIC,
                buy_price NUMERIC,
                condition TEXT,
                color TEXT NOT NULL,
                image_url TEXT,
                added_at DATE NOT NULL DEFAULT CURRENT_DATE,
                entity_id INTEGER NOT NULL,
                FOREIGN KEY(entity_id) REFERENCES price_point(id),
                image_id INTEGER,
                FOREIGN KEY(image_id) REFERENCES images(id)
            );
            CREATE TABLE IF NOT EXISTS price_point (
                id INTEGER PRIMARY KEY DEFAULT nextval('price_point_id_seq'),
                date DATE NOT NULL DEFAULT CURRENT_DATE,
                value NUMERIC NOT NULL
            );
            CREATE TABLE IF NOT EXISTS images (
                id INTEGER PRIMARY KEY DEFAULT nextval('image_id_seq'),
                metadata TEXT,
                data BYTEA NOT NULL
            );
            "#,
        )?;
        Ok(())
    }

    pub fn add_game(&self, game: Game) -> Result<(), Box<dyn std::error::Error>> {
        self.connection.execute(r#"INSERT INTO games (name, publisher, genre, market_price, buy_price, console_platform, cover_url, condition, added_at, release_year) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            params![
                game.name,
                game.publisher,
                game.genre.to_string(),
                game.market_price,
                game.buy_price,
                game.console_platform,
                game.cover_url,
                game.condition.to_string(),
                game.added_at,
                game.release_year,
            ]
        )?;
        Ok(())
    }

    pub fn remove_game(&self, game_id: u64) -> Result<(), Box<dyn std::error::Error>> {
        let entity_id: u64 = self.connection.query_row(
            "SELECT entity_id FROM games WHERE id = ?",
            params![game_id],
            |row| row.get::<_, u64>(0),
        )?;
        let image_id: u64 = self.connection.query_row(
            "SELECT image_id FROM games WHERE id = ?",
            params![game_id],
            |row| row.get::<_, u64>(0),
        )?;
        self.connection.execute(
            r#"DELETE FROM price_point WHERE entity_id = ?"#,
            params![entity_id],
        )?;
        self.connection.execute(
            r#"DELETE FROM images WHERE id = ?"#,
            params![image_id],
        )?;
        self.connection.execute(
            r#"DELETE FROM games WHERE id = ?"#,
            params![game_id],
        )?;
        Ok(())
    }

    pub fn remove_console(&self, console_id: u64) -> Result<(), Box<dyn std::error::Error>> {
        self.connection.execute(
            r#"DELETE FROM consoles WHERE id = ?"#,
            params![console_id],
        )?;
        Ok(())
    }

    pub fn add_console(&self, console: GameConsole) -> Result<(), Box<dyn std::error::Error>> {
        self.connection.execute(
            r#"INSERT INTO consoles (name, short_name, manufacturer, release_year, market_price, buy_price, condition, color, image_url, added_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"#,
            params![
                console.name,
                console.short_name,
                console.manufacturer,
                console.release_year,
                console.market_price,
                console.buy_price,
                console.condition.to_string(),
                console.color,
                console.image_url,
                console.added_at,
            ],
        )?;
        Ok(())
    }
}
