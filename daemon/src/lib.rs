pub mod messages {
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Clone, Serialize, Deserialize)]
    #[serde(tag = "type", rename_all = "camelCase")]
    pub enum WebSocketMessage {
        Ping { timestamp: i64 },
        Pong { timestamp: i64 },
        Error { message: String },
    }

    impl WebSocketMessage {
        pub fn ping() -> Self {
            WebSocketMessage::Ping {
                timestamp: chrono::Utc::now().timestamp_millis(),
            }
        }
        pub fn pong(ts: i64) -> Self {
            WebSocketMessage::Pong { timestamp: ts }
        }
    }
}

pub mod auth {
    use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
    use serde::{Deserialize, Serialize};

    #[derive(Debug, Serialize, Deserialize)]
    pub struct Claims {
        pub sub: String,
        pub exp: usize,
        pub iat: usize,
    }

    pub fn generate_token(
        user_id: &str,
        secret: &[u8],
    ) -> Result<String, jsonwebtoken::errors::Error> {
        let now = chrono::Utc::now().timestamp() as usize;
        encode(
            &Header::default(),
            &Claims {
                sub: user_id.to_owned(),
                exp: now + 3600,
                iat: now,
            },
            &EncodingKey::from_secret(secret),
        )
    }

    pub fn validate_token(
        token: &str,
        secret: &[u8],
    ) -> Result<Claims, jsonwebtoken::errors::Error> {
        Ok(decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret),
            &Validation::new(Algorithm::HS256),
        )?
        .claims)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_ping() {
        assert!(serde_json::to_string(&messages::WebSocketMessage::ping())
            .unwrap()
            .contains("ping"));
    }
    #[test]
    fn test_jwt() {
        let secret = b"test";
        let token = auth::generate_token("user", secret).unwrap();
        assert_eq!(auth::validate_token(&token, secret).unwrap().sub, "user");
    }
}
