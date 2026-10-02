use axum::{Json, extract::Path};
use serde::{Deserialize, Serialize};

use crate::model::{
    common::{Condition, PriceHistory},
    game::{Game, Genre},
    platform::GameConsole,
};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGameCoverRequest {
    cover_url: Option<String>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateConsoleImageRequest {
    image_url: Option<String>,
}

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

pub async fn update_game_cover(
    Path(game_id): Path<u64>,
    Json(request): Json<UpdateGameCoverRequest>,
) -> Json<Game> {
    Json(Game {
        id: game_id.to_string(),
        name: String::new(),
        release_year: 0,
        publisher: String::new(),
        genre: Genre::Fighting,
        market_price: 0.0,
        buy_price: 0.0,
        console_platform: String::new(),
        cover_url: request.cover_url,
        condition: Condition::CompleteInBox,
        added_at: String::new(),
        price_history: None,
    })
}

pub async fn update_console_image(
    Path(console_id): Path<u64>,
    Json(request): Json<UpdateConsoleImageRequest>,
) -> Json<GameConsole> {
    Json(GameConsole {
        id: console_id.to_string(),
        name: String::new(),
        short_name: String::new(),
        manufacturer: String::new(),
        release_year: 0,
        market_price: 0.0,
        buy_price: 0.0,
        condition: Condition::CompleteInBox,
        color: String::new(),
        image_url: request.image_url,
        added_at: String::new(),
        price_history: None,
    })
}

pub async fn delete_game(
    Path(game_id): Path<u64>
) {
}

pub async fn delete_console(
    Path(console_id): Path<u64>
) {
}