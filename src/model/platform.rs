use super::common::{Condition, PricePoint};

pub struct GameConsole {
    id: String,
    name: String,
    short_name: String,
    manufacturer: String,
    release_year: u32,
    market_price: f64,
    buy_price: f64,
    condition: Condition,
    /** Accent colour used across the UI for this platform */
    color: String,
    image_url: Option<String>,
    added_at: String,
    /** Monthly market price track record; the last point matches `marketPrice`. */
    price_history: Vec<PricePoint>,
}