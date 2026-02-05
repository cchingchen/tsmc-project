import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, SensorData, LoginData } from '../services/api';
import { QUERY_CONFIG, TIME_RANGE_MS } from '../constants/config';

export interface LoginCredentials {
    username: string;
    password: string;
}

export const useDevices = (category?: 'motor' | 'pipe', status?: string | null) => {
    return useQuery({
        queryKey: ['devices', { category, status }],
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
        queryKey: ['devices', { category: undefined, status: undefined }],
        queryFn: () => api.searchDevices({}),
        refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL_FAST,
        select: (allDevices) => {
            console.log(allDevices);
            const stats = {
                motorDevices: [] as SensorData[],
                pipeDevices: [] as SensorData[],
                motorStats: { warning: 0, normal: 0, maintenance: 0, total: 0 },
                pipeStats: { warning: 0, normal: 0, maintenance: 0, total: 0 },
            };

            allDevices.forEach(device => {
                const isMotor = device.type === 'motor';
                const group = isMotor ? 'motor' : 'pipe';
                
                stats[`${group}Devices`].push(device);
                stats[`${group}Stats`].total++;
                stats[`${group}Stats`][device.status]++;
            });
            console.log(stats);

            return {
                ...stats,
                totalCount: allDevices.length,
                totalWarning: stats.motorStats.warning + stats.pipeStats.warning
            };
        }
    });
};

export const useSensorHistory = (
    deviceId: string | undefined,
    timeRange: string,
    customRange?: { start: string, end: string }
) => {
    return useQuery({
        queryKey: ['sensor', 'history', deviceId, timeRange, customRange],
        queryFn: () => {
            let range = customRange;
            
            // 如果不是自定義，則自動計算 start/end 給後端，減少傳輸量
            if (timeRange !== 'custom') {
                const ms = TIME_RANGE_MS[timeRange as keyof typeof TIME_RANGE_MS] || TIME_RANGE_MS['1h'];
                range = {
                    start: new Date(Date.now() - ms).toISOString(),
                    end: new Date().toISOString()
                };
            }
            
            return api.getDeviceHistory(deviceId!, range);
        },
        enabled: !!deviceId,
        refetchInterval: timeRange === 'custom' ? false : QUERY_CONFIG.REFETCH_INTERVAL_SLOW,
    });
};

// 更新設備名稱
export const useUpdateDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<SensorData> }) =>
            api.updateDevice(id, updates),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['device', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['devices'] });
        },
    });
};

// 登入
export const useLogin = () => {
    return useMutation<LoginData, any, LoginCredentials>({
        mutationFn: (credentials) => api.login(credentials.username, credentials.password),
        onSuccess: (data) => {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
        },
        onError: (error) => {
            console.error(`Login Error [${error.trace_id}]:`, error.message);
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
export const useSensorFFT = (deviceId: string | undefined) => {
    return useQuery({
        queryKey: ['sensor', 'fft', deviceId],
        queryFn: () => api.getDeviceFFT(deviceId!),
        enabled: !!deviceId,
        refetchInterval: QUERY_CONFIG.REFETCH_INTERVAL_SLOW,
    });
};