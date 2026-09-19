use axum::Json;

use crate::model::{game::Game, platform::GameConsole, common::PriceHistory};

pub fn list_games() -> Vec<Game> {
    Vec::new()
}

pub fn list_consoles() -> Vec<GameConsole> {
    Vec::new()
}

pub fn list_price_history() -> Vec<PriceHistory> {
    Vec::new()
}

pub fn create_game(Json(game): Json<Game>) {

}

pub fn create_console(Json(console): Json<GameConsole>) {

}