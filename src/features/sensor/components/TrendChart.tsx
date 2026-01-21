import { format } from 'date-fns';
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
}

export function TrendChart({
    title,
    data,
    dataKey,
    color,
    name,
    yAxisDomain,
    height = 300,
}: TrendChartProps) {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl text-gray-200 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(value) => format(new Date(value), 'HH:mm')}
                        stroke="#9ca3af"
                    />
                    <YAxis domain={yAxisDomain} stroke="#9ca3af" />
                    <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'HH:mm:ss')}
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            color: '#f3f4f6',
                        }}
                    />
                    <Legend wrapperStyle={{ color: '#9ca3af' }} />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        name={name}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
