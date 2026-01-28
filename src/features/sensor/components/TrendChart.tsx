import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface TrendChartProps {
    title: string;
    data: any[];
    dataKey: string;
    color: string;
    name: string;
    yAxisDomain?: [number, number];
    height?: number;
    tickFormatter?: (value: string) => string;
    isLoading?: boolean;
}

export function TrendChart({
    title,
    data,
    dataKey,
    color,
    name,
    yAxisDomain,
    height = 300,
    tickFormatter,
    isLoading = false,
}: TrendChartProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* 局部遮罩 */}
            {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/40 backdrop-blur-[1px] transition-all">
                    <div className="bg-gray-800/80 p-3 rounded-full border border-gray-700 shadow-2xl">
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                </div>
            )}

            <h3 className="text-lg font-semibold text-gray-200 mb-6">{title}</h3>
            
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="timestamp"
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={tickFormatter}
                        minTickGap={30}
                    />
                    <YAxis 
                        domain={yAxisDomain} 
                        stroke="#6b7280" 
                        fontSize={12}
                    />
                    <Tooltip
                        labelFormatter={(value) => {
                            try {
                                return format(new Date(value), 'MM/dd HH:mm:ss');
                            } catch {
                                return value;
                            }
                        }}
                        contentStyle={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '12px',
                            color: '#f3f4f6',
                        }}
                    />
                    <Legend 
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }} 
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        name={name}
                        dot={false}
                        strokeWidth={2}
                        isAnimationActive={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}