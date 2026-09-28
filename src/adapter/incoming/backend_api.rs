use axum::{Json};

use crate::model::{game::Game, platform::GameConsole, common::PriceHistory};

pub async fn list_games() -> Json<Vec<Game>> {
    Json(Vec::new())
}

pub async fn list_consoles() -> Json<Vec<GameConsole>> {
    Json(Vec::new())
}

pub async fn list_price_history() -> Json<Vec<PriceHistory>> {
    Json(Vec::new())
}

pub async fn create_game(Json(game): Json<Game>) -> Json<Game> {
    Json(game)
}

pub async fn create_console(Json(console): Json<GameConsole>) -> Json<GameConsole> {
    Json(console)
}