use super::common::{Condition, PriceHistory};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum Genre {
  Platformer,
  RPG,
  ShootEmUp,
  Fighting,
  Racing,
  ActionAdventure,
  Puzzle,
  Sports,
  SurvivalHorror,
  Strategy,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Game {
  id: String,
  name: String,
  release_year: u32,
  publisher: String,
  genre: Genre,
  market_price: f64,
  buy_price: f64,
  console_id: String,
  cover_url: Option<String>,
  condition: Condition,
  added_at: String,
  price_history: Option<Vec<PriceHistory>>,
}
