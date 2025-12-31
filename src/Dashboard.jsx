import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Droplets, Wind, ArrowLeft } from 'lucide-react';

const Dashboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState([]);

    useEffect(() => {
        setData([]);

        const fetchChartData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/chart-data');
                const newPoint = await response.json();

                setData(prevData => {
                    const newData = [...prevData, newPoint];
                    if (newData.length > 20) {
                        return newData.slice(newData.length - 20);
                    }
                    return newData;
                });
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            }
        };

        fetchChartData();

        const interval = setInterval(fetchChartData, 2000);

        return () => clearInterval(interval);
    }, [id]);

    const currentHumi = data.length > 0 ? data[data.length - 1].humi : '--';
    const currentCo2 = data.length > 0 ? data[data.length - 1].co2 : '--';

    return (
        <div className="min-h-screen w-full bg-gray-900 text-white p-8 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-100 tracking-tight">Environment Monitor</h1>
                        <p className="text-gray-400 font-mono mt-1">Device ID: <span className="text-blue-400">{id || 'Unknown'}</span></p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Humidity Card */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Current Humidity</p>
                        <div className="flex items-baseline mt-2">
                            <span className="text-4xl font-bold text-blue-400">{currentHumi}</span>
                            <span className="ml-1 text-xl text-gray-500">%</span>
                        </div>
                    </div>
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                        <Droplets className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                {/* CO2 Card */}
                <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Current CO2</p>
                        <div className="flex items-baseline mt-2">
                            <span className="text-4xl font-bold text-green-400">{currentCo2}</span>
                            <span className="ml-1 text-xl text-gray-500">ppm</span>
                        </div>
                    </div>
                    <div className="p-3 bg-green-900/30 rounded-lg">
                        <Wind className="w-8 h-8 text-green-400" />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h2 className="text-xl font-semibold text-gray-200 mb-6">Real-time Trends</h2>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="time"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="humi"
                                name="Humidity (%)"
                                stroke="#60A5FA"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="co2"
                                name="CO2 (ppm)"
                                stroke="#4ADE80"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
