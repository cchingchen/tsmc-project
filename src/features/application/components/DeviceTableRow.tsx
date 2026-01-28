import { memo, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Check, X, Edit2, Loader2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { DEVICE_THRESHOLDS } from '../../../constants/config';
import { type SensorData } from '../../../services/api';
import { useUpdateDevice } from '../../../hooks/useDevices';
import { ToastManager } from '../../../services/ToastManager';

const ThresholdCell = memo(({
    value,
    threshold,
    type = 'gt',
    decimals = 2
}: {
    value: number;
    threshold: number;
    type?: 'gt' | 'lt';
    decimals?: number
}) => {
    const isWarning = type === 'gt' ? value > threshold : value < threshold;
    return (
        <td className="px-6 py-4 text-sm">
            <span className={`${isWarning ? 'text-red-400 font-bold' : 'text-gray-200'} transition-colors`}>
                {value.toFixed(decimals)}
            </span>
        </td>
    );
});

interface DeviceTableRowProps {
    device: SensorData;
}

export const DeviceTableRow = memo(({ device }: DeviceTableRowProps) => {
    const navigate = useNavigate();
    const { mutate: updateDevice, isPending } = useUpdateDevice();
    
    const [isEditing, setIsEditing] = useState(false);
    const [tempSerial, setTempSerial] = useState(device.serial);

    const timeAgo = useMemo(() => {
        return formatDistanceToNow(new Date(device.lastUpdate), {
            addSuffix: true,
            locale: zhCN,
        });
    }, [device.lastUpdate]);

    const performSave = useCallback(() => {
        const trimmed = tempSerial.trim();
        if (!trimmed || trimmed === device.serial) {
            setIsEditing(false);
            setTempSerial(device.serial);
            return;
        }

        updateDevice(
            { id: device.id, updates: { serial: trimmed } },
            {
                onSuccess: () => {
                    ToastManager.success('序號更新成功');
                    setIsEditing(false);
                },
                onError: () => ToastManager.error('更新失敗')
            }
        );
    }, [tempSerial, device.id, device.serial, updateDevice]);

    const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') performSave();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setTempSerial(device.serial);
        }
    };

    return (
        <tr
            className="hover:bg-gray-700/50 transition-colors cursor-pointer group/row"
            onClick={() => !isEditing && navigate(`/sensor/${device.id}`)}
        >
            {/* 設備名稱編輯欄位 */}
            <td className="px-6 py-4 text-sm text-gray-200" onClick={isEditing ? stopPropagation : undefined}>
                {isEditing ? (
                    <div className="flex items-center justify-between group/cell">
                        <input
                            autoFocus
                            disabled={isPending}
                            className="bg-gray-800 text-white border border-blue-500/50 rounded px-2 py-1 text-sm w-36 outline-none ring-1 ring-blue-500/30"
                            value={tempSerial}
                            onChange={(e) => setTempSerial(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={performSave}
                            disabled={isPending}
                            className="p-1 text-green-400 hover:bg-green-400/10 rounded-md disabled:opacity-50 transition-all"
                        >
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="p-1 text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between group/cell">
                        <span className="font-mono tracking-tight">{device.serial}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="opacity-0 group-hover/row:opacity-100 text-gray-500 hover:text-blue-400 p-1 transition-all"
                        >
                            <Edit2 size={14} />
                        </button>
                    </div>
                )}
            </td>

            <td className="px-6 py-4 text-sm text-gray-500 font-mono">{device.id}</td>

            {/* 閾值數據判斷 */}
            <ThresholdCell value={device.rssi} threshold={DEVICE_THRESHOLDS.RSSI_WARNING} type="lt" decimals={1} />
            <ThresholdCell value={device.vbat} threshold={DEVICE_THRESHOLDS.VBAT_WARNING} type="lt" />
            <ThresholdCell value={device.tiltAngle} threshold={DEVICE_THRESHOLDS.TILT_ANGLE_WARNING} type="gt" />

            <td className="px-6 py-4 text-sm text-gray-400">{device.tiltAngleX.toFixed(2)}</td>
            <td className="px-6 py-4 text-sm text-gray-400">{device.tiltAngleY.toFixed(2)}</td>

            <td className="px-6 py-4 text-sm text-gray-400 italic">
                {timeAgo}
            </td>

            <td className="px-6 py-4">
                <StatusBadge status={device.status} />
            </td>
        </tr>
    );
});

DeviceTableRow.displayName = 'DeviceTableRow';