
export interface SensorData {
    serial: string;
    id: string;
    rssi: number;
    vbat: number;
    tiltAngle: number;
    tiltAngleX: number;
    tiltAngleY: number;
    lastUpdate: string;
    status: 'normal' | 'warning' | 'maintenance' | 'offline';
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

const API_BASE_URL = 'http://localhost:5001/api';

export const api = {
    searchDevices: async (filters: { type?: 'motor' | 'pipe'; status?: string }): Promise<SensorData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
            });
            const data = await response.json();

            return data.map((d: any) => ({
                ...d,
                status: d.status === 'active' ? 'normal' : d.status
            }));
        } catch (error) {
            console.error('Error searching devices:', error);
            return [];
        }
    },

    getDeviceDetails: async (id: string): Promise<SensorData | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices`);
            const data = await response.json();
            return data.find((d: any) => d.id === id) || null;
        } catch (error) {
            console.error('Error fetching device details:', error);
            return null;
        }
    },

    getDeviceHistory: async (id: string): Promise<HistoricalData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices/${id}/history`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching history:', error);
            return [];
        }
    },

    getDeviceFFT: async (id: string): Promise<FFTData[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/devices/${id}/fft`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching FFT:', error);
            return [];
        }
    }
};
