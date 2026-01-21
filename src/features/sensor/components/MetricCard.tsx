import { ReactNode } from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: ReactNode;
    valueColor?: string;
    titleColor?: string;
    subtextColor?: string;
}

export function MetricCard({
    title,
    value,
    subtext,
    icon,
    valueColor = 'text-gray-100',
    titleColor = 'text-gray-300',
    subtextColor = 'text-gray-400',
}: MetricCardProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className={titleColor}>{title}</h3>
                {icon}
            </div>
            <div className={`text-3xl mb-1 ${valueColor}`}>
                {value}
            </div>
            <div className={`text-sm ${subtextColor}`}>{subtext}</div>
        </div>
    );
}
