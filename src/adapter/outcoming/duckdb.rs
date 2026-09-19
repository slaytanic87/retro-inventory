use duckdb::Connection;

pub struct InventoryDatabase {
    connection: Connection
}

impl InventoryDatabase {
    pub fn new() -> Self {
        let connection = Connection::open("inventory_db.duckdb").unwrap();
        Self { connection }
    }

    pub fn create_schemas(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.connection.execute_batch(r"
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
                console_id INTEGER,
                cover_url TEXT,
                condition TEXT,
                added_at TIMESTAMP NOT NULL,
                FOREIGN KEY(console_id) REFERENCES consoles(id),
                release_year INTEGER,
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
                FOREIGN KEY(id) REFERENCES price_point(entity_id)
            );
            CREATE TABLE IF NOT EXISTS price_point (
                id INTEGER PRIMARY KEY DEFAULT nextval('price_point_id_seq'),
                date TIMESTAMP NOT NULL,
                value NUMERIC NOT NULL,
                entity_id INTEGER NOT NULL
            );"
        )?;
        Ok(())
    }
}