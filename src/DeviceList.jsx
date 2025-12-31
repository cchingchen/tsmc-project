import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Thermometer, Wind, AlertCircle, CheckCircle2 } from 'lucide-react';

const DeviceList = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/api/devices');
                const data = await response.json();
                setDevices(data);
            } catch (error) {
                console.error("Failed to fetch devices:", error);
            }
        };

        fetchDevices();
        const interval = setInterval(fetchDevices, 3000); // Poll every 3 seconds to update values
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            case 'offline': return <Activity className="w-5 h-5 text-gray-500" />;
            default: return <Activity className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-900 text-gray-100 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Device Management</h1>
                <p className="text-gray-400">Select a device to view real-time environment data.</p>
            </header>

            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-400 uppercase text-xs tracking-wider">
                                <th className="p-4 font-semibold">Device Name</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Live Snapshot</th>
                                <th className="p-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {devices.map((device) => (
                                <tr
                                    key={device.id}
                                    onClick={() => navigate(`/device/${device.id}`)}
                                    className="hover:bg-gray-700/50 transition-colors cursor-pointer group"
                                >
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{device.name}</span>
                                            <span className="text-xs text-gray-500 font-mono mt-1">{device.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-300">{device.location}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(device.status)}
                                            <span className={`text-sm capitalize ${device.status === 'active' ? 'text-green-400' :
                                                device.status === 'warning' ? 'text-yellow-400' : 'text-gray-400'
                                                }`}>
                                                {device.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-blue-300">
                                                <Thermometer className="w-4 h-4" />
                                                <span>{device.humi === '--' ? '--' : `${device.humi}%`}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-green-300">
                                                <Wind className="w-4 h-4" />
                                                <span>{device.co2 === '--' ? '--' : `${device.co2} ppm`}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-400/10 rounded-full border border-blue-400/20 group-hover:bg-blue-400/20 transition-all">
                                            View Dashboard
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DeviceList;
