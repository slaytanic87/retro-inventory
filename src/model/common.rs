use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum EntityType {
  Game,
  Console,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum Condition {
    Loose,
    CompleteInBox,
    Sealed,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PricePoint {
  /** ISO month, e.g. 2025-03-01 */
  date: String,
  value: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriceHistory {
  entity_id: String,
  entity_type: EntityType,
  points: Vec<PricePoint>,
}