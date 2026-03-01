// 設定檔整合
export const QUERY_CONFIG = {
    REFETCH_INTERVAL_FAST: 5000,
    REFETCH_INTERVAL_SLOW: 10000,
    STALE_TIME: 2000,
} as const;

export const TIME_RANGE_MS = {
    '1h': 3600000,
    '6h': 21600000,
    '24h': 86400000,
} as const;

// thresholds
export const DEVICE_THRESHOLDS = {
    RSSI_WARNING: -80,
    VBAT_WARNING: 3.0,
    TILT_ANGLE_WARNING: 15,
} as const;
