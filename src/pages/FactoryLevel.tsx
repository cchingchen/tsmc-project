import { StatusCard } from '../features/factory/components/StatusCard';
import { Factory, Loader2 } from 'lucide-react';
import { useFactoryStats } from '../hooks/useDevices';

export default function FactoryLevel() {
    const { data: stats, isLoading } = useFactoryStats();

    if (isLoading || !stats) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Factory className="w-10 h-10 text-blue-400" />
                        <h1 className="text-4xl font-bold text-gray-100">廠務層總覽</h1>
                    </div>
                    <p className="text-gray-400 ml-13">工廠設備監控系統 - 實時狀態監測</p>
                </div>

                {/* 馬達監控區塊 */}
                <section className="mb-12">
                    <h2 className="text-2xl text-gray-200 mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-blue-500 rounded"></div>
                        馬達監控
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatusCard title="警報" count={stats.motorStats.warning} type="warning" category="motor" />
                        <StatusCard title="正常" count={stats.motorStats.normal} type="normal" category="motor" />
                        <StatusCard title="維修" count={stats.motorStats.maintenance} type="maintenance" category="motor" />
                    </div>
                </section>

                {/* 水管監控區塊 */}
                <section className="mb-12">
                    <h2 className="text-2xl text-gray-200 mb-6 flex items-center gap-2">
                        <div className="w-2 h-8 bg-cyan-500 rounded"></div>
                        水管監控
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatusCard title="警報" count={stats.pipeStats.warning} type="warning" category="pipe" />
                        <StatusCard title="正常" count={stats.pipeStats.normal} type="normal" category="pipe" />
                        <StatusCard title="維修" count={stats.pipeStats.maintenance} type="maintenance" category="pipe" />
                    </div>
                </section>

                {/* 系統統計摘要 */}
                <div className="mt-12 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl">
                    <h3 className="text-xl font-semibold text-gray-200 mb-6">系統統計</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <StatItem label="總設備數" value={stats.totalCount} />
                        <StatItem label="馬達數量" value={stats.motorStats.total} />
                        <StatItem label="水管數量" value={stats.pipeStats.total} />
                        <StatItem label="總警報數" value={stats.totalWarning} isWarning />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatItem({ label, value, isWarning = false }: { label: string; value: number; isWarning?: boolean }) {
    return (
        <div>
            <div className="text-sm text-gray-400 mb-2">{label}</div>
            <div className={`text-3xl font-bold ${isWarning ? 'text-red-400' : 'text-gray-100'}`}>
                {value}
            </div>
        </div>
    );
}