import { z } from "zod";

export const SensorDataSchema = z.object({
    serial: z.string(),
    id: z.string(),
    type: z.enum(['motor', 'pipe']).default('motor'),
    rssi: z.number(),
    vbat: z.number(),
    tiltAngle: z.number(),
    tiltAngleX: z.number(),
    tiltAngleY: z.number(),
    lastUpdate: z.string(),
    status: z.preprocess(
        (val) => (val === 'active' ? 'normal' : val),
        z.enum(['normal', 'warning', 'maintenance'])
    ),
});

export const HistoricalDataSchema = z.object({
    timestamp: z.string(),
    rssi: z.number(),
    vbat: z.number(),
    tiltAngle: z.number(),
    tiltAngleX: z.number(),
    tiltAngleY: z.number(),
});

export const FFTDataSchema = z.object({
    frequency: z.number(),
    magnitude: z.number(),
});

export const LoginDataSchema = z.object({
    token: z.string(),
    username: z.string(),
});

export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        code: z.number(),
        message: z.string(),
        data: dataSchema.optional(), 
        trace_id: z.string(),
    });

export type SensorData = z.infer<typeof SensorDataSchema>;
export type HistoricalData = z.infer<typeof HistoricalDataSchema>;
export type FFTData = z.infer<typeof FFTDataSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;
export type ApiResponse<T> = {
    code: number;
    message: string;
    data?: T;
    trace_id: string;
};


const API_BASE_URL = '/api';

async function handleFetch<T>(
    request: Promise<Response>,
    schema: z.ZodType<T>
): Promise<T> {
    const response = await request;
    const json = await response.json();

    const envelopeSchema = createApiResponseSchema(schema);
    const result = envelopeSchema.safeParse(json);
    console.log(result);

    if (!result.success) {
        console.error("Zod Validation Error:", result.error.format());
        throw new Error("伺服器資料格式錯誤");
    }

    const { code, data, message, trace_id } = result.data;

    if (!response.ok || code !== 200) {
        const error: any = new Error(message || "請求失敗");
        error.trace_id = trace_id;
        error.code = code;
        throw error;
    }

    return data as T;
}

export const api = {
    // 搜尋設備
    searchDevices: async (filters: { type?: 'motor' | 'pipe'; status?: string }): Promise<SensorData[]> => {
        return handleFetch(
            fetch(`${API_BASE_URL}/devices/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
            }),
            z.array(SensorDataSchema)
        );
    },

    // 取得單一設備
    getDeviceDetails: async (id: string | undefined): Promise<SensorData | null> => {
        if (!id) return null;
        try {
            return await handleFetch(
                fetch(`${API_BASE_URL}/devices/${id}`),
                SensorDataSchema
            );
        } catch (error) {
            console.warn(`Fallback: Device ${id} fetch failed, trying full list.`);
            const all = await api.searchDevices({});
            return all.find(d => d.id === id) || null;
        }
    },

    // 歷史數據
    getDeviceHistory: async (id: string, customRange?: { start: string; end: string }): Promise<HistoricalData[]> => {
        const query = customRange ? `?${new URLSearchParams(customRange)}` : '';
        return handleFetch(
            fetch(`${API_BASE_URL}/devices/${id}/history${query}`),
            z.array(HistoricalDataSchema)
        ).catch(() => []); // 歷史資料失敗回傳空陣列
    },

    // FFT 資料
    getDeviceFFT: async (id: string): Promise<FFTData[]> => {
        return handleFetch(
            fetch(`${API_BASE_URL}/devices/${id}/fft`),
            z.array(FFTDataSchema)
        ).catch(() => []);
    },

    // 更新設備
    updateDevice: async (id: string, updates: Partial<SensorData>): Promise<SensorData> => {
        return handleFetch(
            fetch(`${API_BASE_URL}/devices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            }),
            SensorDataSchema
        );
    },

    // 登入
    login: async (username: string, password: string): Promise<LoginData> => {
        return handleFetch(
            fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            }),
            LoginDataSchema
        );
    }
};