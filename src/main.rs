use axum::{Router, routing::get};
use retro_inventory::adapter;
use tracing::info;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();

    init_logging("INFO".to_string(), "json".to_string());

    let app = Router::new()
    .route("/", get(crate::adapter::incoming::serve_frontend_index))
    .route("/{*path}", get(crate::adapter::incoming::serve_ui_assets));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await?;

    info!("Server running on 0.0.0.0:8080");
    
    axum::serve(listener, app).await?;
    Ok(())
}

fn init_logging(log_level: String, log_format: String) {
    let filter = tracing_subscriber::EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(log_level));

    if log_format.eq_ignore_ascii_case("json") {
        tracing_subscriber::fmt()
            .with_env_filter(filter)
            .json()
            .with_current_span(false)
            .init();
    } else {
        tracing_subscriber::fmt().with_env_filter(filter).init();
    }
}
