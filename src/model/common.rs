
pub enum EntityType {
  Game,
  Console,
}

pub enum Condition {
    Loose,
    CompleteInBox,
    Sealed,
}

pub struct PricePoint {
  /** ISO month, e.g. 2025-03-01 */
  date: String,
  value: f64,
}

pub struct PriceHistory {
  entity_id: String,
  entity_type: EntityType,
  points: Vec<PricePoint>,
}