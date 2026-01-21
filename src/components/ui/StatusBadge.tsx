import { AlertTriangle, CheckCircle, Wrench, LucideIcon } from 'lucide-react';

export type StatusType = 'normal' | 'warning' | 'maintenance';

interface StatusConfig {
    label: string;
    icon: LucideIcon;
    className: string;
}

const statusMap: Record<StatusType, StatusConfig> = {
    normal: {
        label: '正常',
        icon: CheckCircle,
        className: 'text-green-400 bg-green-900/50',
    },
    warning: {
        label: '警報',
        icon: AlertTriangle,
        className: 'text-red-400 bg-red-900/50',
    },
    maintenance: {
        label: '維修',
        icon: Wrench,
        className: 'text-orange-400 bg-orange-900/50',
    },
};

interface StatusBadgeProps {
    status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusMap[status] || statusMap.normal;
    const Icon = config.icon;

    return (
        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm w-fit ${config.className}`}>
            <Icon className="w-4 h-4" />
            {config.label}
        </span>
    );
}