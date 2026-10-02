pub mod backend_api;
pub mod web_frontend;

pub use backend_api::UpdateConsoleImageRequest;
pub use backend_api::UpdateGameCoverRequest;
pub use backend_api::create_console;
pub use backend_api::create_game;
pub use backend_api::list_consoles;
pub use backend_api::list_games;
pub use backend_api::list_price_history;
pub use backend_api::update_console_image;
pub use backend_api::update_game_cover;
pub use backend_api::delete_game;
pub use backend_api::delete_console;
pub use web_frontend::serve_frontend_index;
pub use web_frontend::serve_ui_assets;
