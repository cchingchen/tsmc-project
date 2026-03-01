import { format } from 'date-fns';

const HEADERS = ['Timestamp', 'RSSI', 'VBAT', 'Tilt Angle', 'Tilt X', 'Tilt Y'];

export const formatCSV = (deviceSerial: string, history: any[]) => {
    const rows = history.map(d => [
        d.timestamp, d.rssi, d.vbat, d.tiltAngle, d.tiltAngleX, d.tiltAngleY
    ]);
    const csvContent = [HEADERS, ...rows].map(row => row.join(',')).join('\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};

export const getXAxisTickFormatter = (range: string) => (timestamp: string) => {
    const date = new Date(timestamp);
    if (['24h', '7d', 'custom'].includes(range)) {
        return format(date, 'MM/dd HH:mm');
    }
    return format(date, 'HH:mm');
};
