import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Activity, Battery, Signal, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { MetricCard } from '../features/sensor/components/MetricCard';
import { TrendChart } from '../features/sensor/components/TrendChart';
import { useSensorDetail, useSensorHistory, useSensorFFT } from '../hooks/useDevices';

export default function SensorLevel() {
    const navigate = useNavigate();
    const { deviceId } = useParams<{ deviceId: string }>();
    const [timeRange, setTimeRange] = useState('1h');

    const { data: device, isLoading: isDetailLoading } = useSensorDetail(deviceId);
    const { data: history = [], isLoading: isHistoryLoading } = useSensorHistory(deviceId, timeRange);
    const { data: fftData = [], isLoading: isFftLoading } = useSensorFFT(deviceId);

    const isLoading = isDetailLoading || isHistoryLoading || isFftLoading;

    const handleDownload = () => {
        if (!device || history.length === 0) return;
        const csv = [
            ['Timestamp', 'RSSI', 'VBAT', 'Tilt Angle', 'Tilt Angle X', 'Tilt Angle Y'],
            ...history.map((d) => [d.timestamp, d.rssi, d.vbat, d.tiltAngle, d.tiltAngleX, d.tiltAngleY]),
        ].map((row) => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${device.serial}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!device) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl text-gray-100 mb-4">找不到設備資料</h2>
                    <button onClick={() => navigate('/')} className="text-blue-400 flex items-center gap-2 mx-auto">
                        <ArrowLeft className="w-4 h-4" /> 返回首頁
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors">
                        <ArrowLeft className="w-5 h-5" /> 返回上一頁
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">感測器詳情 - {device.serial}</h1>
                            <p className="text-gray-400 font-mono">ID: {device.id}</p>
                        </div>
                        <button onClick={handleDownload} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95">
                            <Download className="w-5 h-5" /> 下載歷史報表 (.csv)
                        </button>
                    </div>
                </header>

                {/* Real-time Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <MetricCard title="RSSI" value={`${device.rssi.toFixed(1)} dBm`} subtext="訊號強度" icon={<Signal className="text-blue-400" />} />
                    <MetricCard title="VBAT" value={`${device.vbat.toFixed(2)} V`} subtext="電池電壓" icon={<Battery className="text-green-400" />} />
                    <MetricCard title="Tilt Angle" value={`${device.tiltAngle.toFixed(2)}°`} subtext="主傾斜角" icon={<Activity className="text-orange-400" />} />
                    <MetricCard title="Tilt X" value={`${device.tiltAngleX.toFixed(2)}°`} subtext="X 軸偏移" icon={<Activity className="text-purple-400" />} />
                    <MetricCard title="Tilt Y" value={`${device.tiltAngleY.toFixed(2)}°`} subtext="Y 軸偏移" icon={<Activity className="text-pink-400" />} />
                    <MetricCard title="最後更新" value={format(new Date(device.lastUpdate), 'HH:mm:ss')} subtext={format(new Date(device.lastUpdate), 'yyyy/MM/dd')} icon={<Calendar className="text-gray-400" />} />
                </div>

                {/* Control Panel: Time Range */}
                <div className="bg-gray-800/50 border border-gray-700 p-2 rounded-2xl mb-8 flex items-center gap-2 w-fit">
                    {['1h', '6h', '24h'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                            {range === '1h' ? '1小時' : range === '6h' ? '6小時' : '24小時'}
                        </button>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <TrendChart title="主傾斜角度趨勢" data={history} dataKey="tiltAngle" color="#fb923c" name="角度 (°)" />

                    {/* XY Axis Combined Chart */}
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-semibold mb-6">XY 軸傾斜分佈</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={history}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="timestamp" tickFormatter={(t) => format(new Date(t), 'HH:mm')} stroke="#6b7280" fontSize={12} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
                                <Legend />
                                <Line type="monotone" dataKey="tiltAngleX" stroke="#a78bfa" strokeWidth={2} name="X軸" dot={false} />
                                <Line type="monotone" dataKey="tiltAngleY" stroke="#f472b6" strokeWidth={2} name="Y軸" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <TrendChart title="訊號強度 (RSSI)" data={history} dataKey="rssi" color="#3b82f6" name="dBm" />
                    <TrendChart title="電池電壓 (VBAT)" data={history} dataKey="vbat" color="#10b981" name="V" yAxisDomain={[2.5, 4.2]} />

                    {/* Spectrum Analysis FFT */}
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-6">FFT 頻譜分析 (實時振幅)</h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={fftData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="frequency" stroke="#6b7280" fontSize={12} label={{ value: 'Hz', position: 'insideBottom', offset: -5, fill: '#6b7280' }} />
                                <YAxis stroke="#6b7280" fontSize={12} />
                                <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
                                <Bar dataKey="magnitude" fill="#06b6d4" radius={[4, 4, 0, 0]} name="振幅" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}