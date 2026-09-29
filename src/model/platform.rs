use super::common::{Condition, PricePoint};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct GameConsole {
    pub id: String,
    pub name: String,
    pub short_name: String,
    pub manufacturer: String,
    pub release_year: u32,
    pub market_price: f64,
    pub buy_price: f64,
    pub condition: Condition,
    /** Accent colour used across the UI for this platform */
    pub color: String,
    pub image_url: Option<String>,
    pub added_at: String,
    /** Monthly market price track record; the last point matches `marketPrice`. */
    pub price_history: Option<Vec<PricePoint>>,
}
