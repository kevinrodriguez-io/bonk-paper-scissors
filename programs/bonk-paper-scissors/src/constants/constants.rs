pub const BPS: [u8; 3] = *b"bps";
pub const GAME: [u8; 4] = *b"game";
pub const ESCROW: [u8; 6] = *b"escrow";

#[deprecated(note = "Use BPS_SETTINGS_V2 onwards, this is only kept for compatibility.")]
pub const BPS_SETTINGS: [u8; 12] = *b"bps_settings";
pub const BPS_SETTINGS_V2: [u8; 15] = *b"bps_settings_v2";
pub const FIRST_PLAYER: [u8; 12] = *b"first_player";
pub const SECOND_PLAYER: [u8; 13] = *b"second_player";
