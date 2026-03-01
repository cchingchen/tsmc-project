import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Activity, Battery, Signal, Loader2, Clock, Search } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { MetricCard } from '../features/sensor/components/MetricCard';
import { TrendChart } from '../features/sensor/components/TrendChart';
import { useDeviceDetail, useSensorHistory, useSensorFFT } from '../hooks/useDevices';
import { formatCSV, getXAxisTickFormatter } from '../utils/sensorHelpers';
import { RefreshCw } from 'lucide-react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';

const DATE_INPUT_FORMAT = "yyyy-MM-dd'T'HH:mm";

export default function SensorLevel() {
    const navigate = useNavigate();
    const { deviceId } = useParams<{ deviceId: string }>();

    // 狀態管理
    const [rangeMode, setRangeMode] = useState<'preset' | 'custom'>('preset');
    const [timeRange, setTimeRange] = useState('1h');
    const [tempDates, setTempDates] = useState({
        start: format(subDays(new Date(), 1), DATE_INPUT_FORMAT),
        end: format(new Date(), DATE_INPUT_FORMAT)
    });
    const [appliedCustomRange, setAppliedCustomRange] = useState<{ start: string, end: string } | undefined>();

    // fetch 後端資料
    const { data: device, isLoading: isDetailLoading } = useDeviceDetail(deviceId || '');
    const currentRange = rangeMode === 'preset' ? timeRange : 'custom';

    const {
        data: history = [],
        isFetching: isHistoryFetching,
        isLoading: isHistoryInitialLoading
    } = useSensorHistory(
        deviceId,
        currentRange,
        rangeMode === 'custom' ? appliedCustomRange : undefined
    );

    const { data: fftData = [], isFetching: isFftFetching } = useSensorFFT(deviceId);

    const xAxisFormatter = useMemo(() => getXAxisTickFormatter(currentRange), [currentRange]);

    const showChartOverlay = isHistoryInitialLoading || isHistoryFetching;

    // csv 下載事件
    const handleDownload = useCallback(() => {
        if (!device || history.length === 0) return;
        const blob = formatCSV(device.serial, history);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${device.serial}_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [device, history]);

    const handleApplyCustomRange = useCallback(() => {
        setAppliedCustomRange(tempDates);
    }, [tempDates]);

    // --- 渲染片段：局部遮罩 ---
    const renderLoadingOverlay = () => (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] rounded-2xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3 bg-gray-800 px-6 py-4 rounded-xl shadow-2xl border border-gray-700">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-sm font-medium">更新中...</span>
            </div>
        </div>
    );

    if (isDetailLoading && !device) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!device) return <div className="p-20 text-center">設備不存在</div>;

    const categoryName = device.type === 'motor' ? '馬達' : '水管';

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
            <Header username={'admin'} />
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            { label: '廠務層總覽', path: '/' },
                            { label: `應用層監控 - ${categoryName}`, path: `/application/${device.type}/?status=${device.status}` },
                            { label: `感測器詳情 - ${device.serial}` }
                        ]}
                    />

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h1 className="text-4xl text-gray-100">
                                        感測器詳情 - {device.serial}
                                    </h1>
                                </div>
                                <p className="text-gray-400">設備 ID: {device.id}</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]" />
                                    <span className="text-gray-400">系統已連線</span>
                                </div>
                                <div className="flex items-center gap-2 border-l border-gray-700 pl-3">
                                    <span>最後同步：{format(new Date(device.lastUpdate), 'HH:mm:ss')}</span>
                                    <div className="w-3">
                                        {isHistoryFetching && <RefreshCw className="w-3 h-3 animate-spin text-blue-500/70" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 各指標數值 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <MetricCard title="RSSI" value={`${device.rssi.toFixed(1)} dBm`} subtext="訊號強度" icon={<Signal className="text-blue-400" />} />
                        <MetricCard title="VBAT" value={`${device.vbat.toFixed(2)} V`} subtext="電池電壓" icon={<Battery className="text-green-400" />} />
                        <MetricCard title="Tilt Angle" value={`${device.tiltAngle.toFixed(2)}°`} subtext="主傾斜角" icon={<Activity className="text-orange-400" />} />
                        <MetricCard title="Tilt X" value={`${device.tiltAngleX.toFixed(2)}°`} subtext="X 軸偏移" icon={<Activity className="text-purple-400" />} />
                        <MetricCard title="Tilt Y" value={`${device.tiltAngleY.toFixed(2)}°`} subtext="Y 軸偏移" icon={<Activity className="text-pink-400" />} />
                    </div>

                    {/* 控制面板 */}
                    <div className="flex flex-wrap items-center gap-4 mb-8 bg-gray-800/40 p-4 rounded-3xl border border-gray-700/50 backdrop-blur-md">
                        <div className="flex bg-gray-950/50 p-1.5 rounded-2xl border border-gray-700">
                            {['1h', '6h', '24h'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => { setRangeMode('preset'); setTimeRange(range); }}
                                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${rangeMode === 'preset' && timeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    {range.toUpperCase()}
                                </button>
                            ))}
                            <button
                                onClick={() => setRangeMode('custom')}
                                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${rangeMode === 'custom' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                <Clock className="w-4 h-4" /> 自定義
                            </button>
                        </div>

                        {rangeMode === 'custom' && (
                            <div className="flex flex-wrap items-center gap-3 animate-in zoom-in-95 duration-200">
                                <input type="datetime-local" value={tempDates.start} onChange={(e) => setTempDates(p => ({ ...p, start: e.target.value }))} className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                                <span className="text-gray-600">—</span>
                                <input type="datetime-local" value={tempDates.end} onChange={(e) => setTempDates(p => ({ ...p, end: e.target.value }))} className="bg-gray-950 border border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                                <button onClick={handleApplyCustomRange} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
                                    <Search className="w-4 h-4" /> 查詢
                                </button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button onClick={handleDownload} className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95">
                                <Download className="w-5 h-5" /> 匯出 CSV
                            </button>
                        </div>
                    </div>

                    {/* 圖表網格 */}
                    <div className="relative">
                        {showChartOverlay && renderLoadingOverlay()}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <TrendChart title="傾斜角度趨勢" data={history} dataKey="tiltAngle" color="#fb923c" name="角度 (°)" tickFormatter={xAxisFormatter} isLoading={false} />

                            {/* XY 軸 */}
                            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
                                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                    <p>XY 軸動態分佈</p>
                                </h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer>
                                        <LineChart data={history}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                            <XAxis dataKey="timestamp" tickFormatter={xAxisFormatter} stroke="#6b7280" fontSize={11} minTickGap={30} />
                                            <YAxis stroke="#6b7280" fontSize={11} />
                                            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
                                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                            <Line type="monotone" dataKey="tiltAngleX" stroke="#a78bfa" strokeWidth={2.5} dot={false} isAnimationActive={false} name="X軸偏移" />
                                            <Line type="monotone" dataKey="tiltAngleY" stroke="#f472b6" strokeWidth={2.5} dot={false} isAnimationActive={false} name="Y軸偏移" />
                                        </LineChart>
                                    </ResponsiveContainer>

                                </div>
                            </div>

                            {/* RSSI & VBAT */}
                            <TrendChart title="訊號強度 (RSSI)" data={history} dataKey="rssi" color="#3b82f6" name="dBm" tickFormatter={xAxisFormatter} isLoading={false} />
                            <TrendChart title="電池電壓 (VBAT)" data={history} dataKey="vbat" color="#10b981" name="V" yAxisDomain={[2.5, 4.2]} tickFormatter={xAxisFormatter} isLoading={false} />

                            {/* FFT 分析 */}
                            <div className="bg-gray-800/80 border border-gray-700 rounded-2xl p-6 shadow-xl lg:col-span-2 relative min-h-[400px]">
                                {isFftFetching && renderLoadingOverlay()}
                                <h3 className="text-lg font-semibold mb-6">FFT 頻譜分析 (動態振幅)</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={fftData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                        <XAxis dataKey="frequency" stroke="#6b7280" fontSize={11} label={{ value: 'Hz', position: 'insideBottom', offset: -5, fill: '#4b5563' }} />
                                        <YAxis stroke="#6b7280" fontSize={11} />
                                        <Tooltip cursor={{ fill: '#374151', opacity: 0.4 }} contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }} />
                                        <Bar dataKey="magnitude" fill="url(#colorBar)" radius={[4, 4, 0, 0]} name="振幅">
                                            <defs>
                                                <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                </linearGradient>
                                            </defs>
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}