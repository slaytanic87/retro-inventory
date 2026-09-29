use core::fmt;

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
    pub id: String,
    pub name: String,
    pub release_year: u32,
    pub publisher: String,
    pub genre: Genre,
    pub market_price: f64,
    pub buy_price: f64,
    pub console_platform: String,
    pub cover_url: Option<String>,
    pub condition: Condition,
    pub added_at: String,
    pub price_history: Option<Vec<PriceHistory>>,
}

impl fmt::Display for Genre {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let genre_str = match self {
            Genre::Platformer => "Platformer",
            Genre::RPG => "RPG",
            Genre::ShootEmUp => "ShootEmUp",
            Genre::Fighting => "Fighting",
            Genre::Racing => "Racing",
            Genre::ActionAdventure => "ActionAdventure",
            Genre::Puzzle => "Puzzle",
            Genre::Sports => "Sports",
            Genre::SurvivalHorror => "SurvivalHorror",
            Genre::Strategy => "Strategy",
        };
        write!(f, "{}", genre_str)
    }
}

impl fmt::Display for Condition {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let condition_str = match self {
            Condition::Loose => "Loose",
            Condition::CompleteInBox => "CompleteInBox",
            Condition::Sealed => "Sealed",
        };
        write!(f, "{}", condition_str)
    }
}