import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, SensorData } from '../services/api';
import { QUERY_CONFIG, TIME_RANGE_MS } from '../constants/config';

export const useDevices = (category?: 'motor' | 'pipe', status?: string | null) => {
    return useQuery({
        queryKey: ['devices', category, status],
        queryFn: () => api.searchDevices({
            type: category,
            status: status || undefined
        }),
        refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL_FAST,
        staleTime: QUERY_CONFIG.STALE_TIME,
    });
};

export const useFactoryStats = () => {
    return useQuery({
        queryKey: ['devices', 'all'],
        queryFn: () => api.searchDevices({}),
        refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL_FAST,
        select: (allDevices: SensorData[]) => {
            const initialStats = { warning: 0, normal: 0, maintenance: 0, total: 0 };

            const result = allDevices.reduce((acc, device) => {
                const isMotor = device.type === 'motor';
                const targetList = isMotor ? acc.motorDevices : acc.pipeDevices;
                const targetStats = isMotor ? acc.motorStats : acc.pipeStats;

                targetList.push(device);

                targetStats.total++;

                const statusKey = device.status;

                targetStats[statusKey]++;

                return acc;
            }, {
                motorDevices: [] as SensorData[],
                pipeDevices: [] as SensorData[],
                motorStats: { ...initialStats },
                pipeStats: { ...initialStats },
            });

            return {
                ...result,
                totalCount: allDevices.length,
                totalWarning: result.motorStats.warning + result.pipeStats.warning
            };
        }
    });
};

export const useDeviceDetail = (id: string | undefined) => {
    return useQuery({
        queryKey: ['device', id],
        queryFn: () => api.getDeviceDetails(id),
        enabled: !!id,
        refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL_FAST,
    });
};

export const useSensorHistory = (
    deviceId: string | undefined,
    timeRange: string,
    customRange?: { start: string, end: string }
) => {
    return useQuery({
        // timeRange 或是 customRange 改變，Query 會重新抓取
        queryKey: ['sensor', 'history', deviceId, timeRange, customRange?.start, customRange?.end],
        queryFn: () => api.getDeviceHistory(deviceId!, customRange),
        enabled: !!deviceId,
        // 自定義範圍，關閉自動刷新
        refetchInterval: timeRange === 'custom' ? false : QUERY_CONFIG.REFETCH_INTERVAL_SLOW,
        select: (data) => {
            if (timeRange === 'custom') return data;

            const now = new Date().getTime();
            const ms = TIME_RANGE_MS[timeRange as keyof typeof TIME_RANGE_MS] || TIME_RANGE_MS['1h'];
            const startTime = now - ms;
            return data.filter(d => new Date(d.timestamp).getTime() >= startTime);
        }
    });
};
export const useSensorFFT = (deviceId: string | undefined) => {
    return useQuery({
        queryKey: ['sensor', 'fft', deviceId],
        queryFn: () => api.getDeviceFFT(deviceId!),
        enabled: !!deviceId,
        refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL_SLOW,
    });
};

export const useUpdateDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<SensorData> }) =>
            api.updateDevice(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        },
    });
};