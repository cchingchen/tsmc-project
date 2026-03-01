import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ToastManager } from '../services/ToastManager';

export const useEventNotifications = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    useEffect(() => {
        const eventSource = new EventSource('http://localhost:5001/api/events');

        eventSource.onmessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                console.log(data);

                if (data.type === 'STATUS_CHANGE') {
                    ToastManager.alert(data, navigate);
                    queryClient.invalidateQueries({ queryKey: ['devices', 'all'] });
                }
            } catch (error) {
                console.error("解析 SSE 數據失敗:", error);
            }
        };

        eventSource.onerror = (err) => {
            console.error("SSE 連線中斷或發生錯誤", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [queryClient]);
};