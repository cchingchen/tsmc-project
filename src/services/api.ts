
export interface SensorData {
    serial: string;
    id: string;
    type: 'motor' | 'pipe';
    rssi: number;
    vbat: number;
    tiltAngle: number;
    tiltAngleX: number;
    tiltAngleY: number;
    lastUpdate: string;
    status: 'normal' | 'warning' | 'maintenance';
}

export interface HistoricalData {
    timestamp: string;
    rssi: number;
    vbat: number;
    tiltAngle: number;
    tiltAngleX: number;
    tiltAngleY: number;
}

export interface FFTData {
    frequency: number;
    magnitude: number;
}

const API_BASE_URL = '/api';

const transformDeviceData = (d: any): SensorData => ({
    ...d,
    status: d.status === 'active' ? 'normal' : d.status,
    type: d.type || (d.id.startsWith('motor') ? 'motor' : 'pipe'),
});

export const api = {
    // 搜尋與篩選列設備列表
    searchDevices: async (filters: { type?: 'motor' | 'pipe'; status?: string }): Promise<SensorData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
            });
            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            return data.map(transformDeviceData);
        } catch (error) {
            console.error('Error searching devices:', error);
            return [];
        }
    },

    // 取得單一設備
    getDeviceDetails: async (id: string | undefined): Promise<SensorData | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices/${id}`);
            if (!response.ok) {
                throw new Error(`Device ${id} not found`);
            }
            const data = await response.json();
            return transformDeviceData(data);
        } catch (error) {
            console.warn('Fallback: Fetching all devices to find one. Please implement GET /api/devices/:id');
            // （optional）單一設備 API 失敗，改抓全部設備
            const response = await fetch(`${API_BASE_URL}/devices`);
            const data = await response.json();
            const found = data.find((d: any) => d.id === id);
            return found ? transformDeviceData(found) : null;
        }
    },

    // 抓設備圖表用的歷史數據
    getDeviceHistory: async (id: string, customRange?: { start: string; end: string }): Promise<HistoricalData[]> => {
        try {
            let url = `${API_BASE_URL}/devices/${id}/history`;

            if (customRange) {
                const params = new URLSearchParams({
                    start: customRange.start,
                    end: customRange.end
                });
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    },

    // 抓設備 FFT 資料
    getDeviceFFT: async (id: string): Promise<FFTData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices/${id}/fft`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error fetching FFT:', error);
            return [];
        }
    },

    // 用於設備更新名稱
    updateDevice: async (id: string, updates: Partial<SensorData>): Promise<SensorData | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (!response.ok) throw new Error('Update failed');
            return await response.json();
        } catch (error) {
            console.error('Error updating device:', error);
            return null;
        }
    }
};