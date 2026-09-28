pub mod web_frontend;
pub mod backend_api;

pub use web_frontend::serve_frontend_index;
pub use web_frontend::serve_ui_assets;
pub use backend_api::list_games;
pub use backend_api::list_consoles;
pub use backend_api::list_price_history;
pub use backend_api::create_game;
pub use backend_api::create_console;