import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { DeviceTableRow } from '../features/application/components/DeviceTableRow';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Header } from '../components/Header';

export default function ApplicationLevel() {
    const navigate = useNavigate();
    const { category } = useParams<{ category: 'motor' | 'pipe' }>();
    const [searchParams] = useSearchParams();
    const statusFilter = searchParams.get('status');

    const { data: devices = [], isLoading } = useDevices(category, statusFilter);

    const categoryName = category === 'motor' ? '馬達' : '水管';

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">路由參數錯誤</h1>
                <p className="text-gray-400 mb-6">找不到對應的監控類別 (motor 或 pipe)</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                >
                    返回總覽
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">

            <Header username={'admin'} />
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            { label: '廠務層總覽', path: '/' },
                            { label: `應用層監控 - ${categoryName}` }
                        ]}
                    />

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl text-gray-100 mb-2">
                            應用層監控 - {categoryName}
                        </h1>
                        <p className="text-gray-400">
                            {statusFilter
                                ? `篩選條件：${statusFilter === 'warning' ? '警報' : statusFilter === 'normal' ? '正常' : '維修'} | `
                                : ''}
                            共 {devices.length} 個設備
                        </p>
                    </div>


                    {/* Table */}
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700/50 border-b border-gray-600">
                                    <tr>
                                        {['Serial', 'ID', 'RSSI (dBm)', 'VBAT (V)', 'Tilt Angle (°)', 'Tilt Angle X (°)', 'Tilt Angle Y (°)', 'Last Update', 'Info'].map((head) => (
                                            <th key={head} className="px-6 py-4 text-left text-sm text-gray-300 whitespace-nowrap">
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {devices.map((device) => (
                                        <DeviceTableRow key={device.id} device={device} />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty State */}
                        {devices.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                沒有找到符合條件的設備
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}