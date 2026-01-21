import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useDevices = (category?: 'motor' | 'pipe', status?: string | null) => {
    return useQuery({
        queryKey: ['devices', category, status],
        queryFn: () => api.searchDevices({
            type: category,
            status: status || undefined
        }),
        refetchInterval: 5000,
        staleTime: 2000,
    });
};

export const useDeviceDetail = (id: string) => {
    return useQuery({
        queryKey: ['device', id],
        queryFn: () => api.getDeviceDetails(id),
        enabled: !!id,
        refetchInterval: 5000,
    });
};

export const useFactoryStats = () => {
    return useQuery({
        queryKey: ['devices', 'all'],
        queryFn: () => api.searchDevices({}),
        refetchInterval: 5000,
        select: (allDevices) => {
            const motors = allDevices.filter(d => d.id.startsWith('motor') || (!d.id.startsWith('pipe') && allDevices.indexOf(d) % 2 === 0));
            const pipes = allDevices.filter(d => d.id.startsWith('pipe') || (!d.id.startsWith('motor') && allDevices.indexOf(d) % 2 !== 0));

            const getStats = (list: typeof allDevices) => ({
                warning: list.filter(d => d.status === 'warning').length,
                normal: list.filter(d => d.status === 'normal').length,
                maintenance: list.filter(d => d.status === 'maintenance').length,
                total: list.length
            });

            return {
                motorDevices: motors,
                pipeDevices: pipes,
                motorStats: getStats(motors),
                pipeStats: getStats(pipes),
                totalCount: allDevices.length,
                totalWarning: allDevices.filter(d => d.status === 'warning').length
            };
        }
    });
};

export const useSensorDetail = (deviceId: string | undefined) => {
    return useQuery({
        queryKey: ['sensor', 'detail', deviceId],
        queryFn: () => api.getDeviceDetails(deviceId!),
        enabled: !!deviceId,
        refetchInterval: 5000,
    });
};

export const useSensorHistory = (deviceId: string | undefined, timeRange: string) => {
    return useQuery({
        queryKey: ['sensor', 'history', deviceId, timeRange],
        queryFn: () => api.getDeviceHistory(deviceId!),
        enabled: !!deviceId,
        refetchInterval: 10000,
        select: (data) => {
            const now = new Date();
            const msMap: Record<string, number> = { '1h': 3600000, '6h': 21600000, '24h': 86400000 };
            const startTime = now.getTime() - (msMap[timeRange] || 3600000);
            return data.filter(d => new Date(d.timestamp).getTime() >= startTime);
        }
    });
};

export const useSensorFFT = (deviceId: string | undefined) => {
    return useQuery({
        queryKey: ['sensor', 'fft', deviceId],
        queryFn: () => api.getDeviceFFT(deviceId!),
        enabled: !!deviceId,
        refetchInterval: 10000,
    });
};