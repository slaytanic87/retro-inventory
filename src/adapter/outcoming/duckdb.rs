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

    pub fn create_schemas(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.connection.execute_batch(
            r#"
            CREATE SEQUENCE IF NOT EXISTS game_id_seq;
            CREATE SEQUENCE IF NOT EXISTS console_id_seq;
            CREATE SEQUENCE IF NOT EXISTS price_point_id_seq;
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
                added_at TIMESTAMP NOT NULL,
                release_year INTEGER,
                entity_id INTEGER NOT NULL,
                FOREIGN KEY(id) REFERENCES price_point(entity_id)
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
                added_at TIMESTAMP NOT NULL,
                entity_id INTEGER NOT NULL,
                FOREIGN KEY(entity_id) REFERENCES price_point(entity_id)
            );
            CREATE TABLE IF NOT EXISTS price_point (
                id INTEGER PRIMARY KEY DEFAULT nextval('price_point_id_seq'),
                date TIMESTAMP NOT NULL,
                value NUMERIC NOT NULL
            );"#,
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
