import React, { useMemo } from 'react';
import { Factory, Loader2, RefreshCw } from 'lucide-react';
import { useFactoryStats } from '../hooks/useDevices';
import { useEventNotifications } from '../hooks/useEventSource';
import { CategorySection } from '../features/factory/components/CategorySection';
import { StatItem } from '../features/factory/components/StatItem';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function FactoryLevel() {
    // SSE 監聽
    useEventNotifications();

    const { data: stats, isLoading, isFetching } = useFactoryStats();

    const lastUpdated = useMemo(() => new Date().toLocaleTimeString(), [stats]);

    if (isLoading && !stats) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-400 animate-pulse">正在連線至廠務系統...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
            <Header username={'admin'} />
            <div className="p-8">
                <div className="max-w-7xl mx-auto">
                    <Breadcrumbs
                        items={[
                            { label: '廠務層總覽' }
                        ]}
                    />

                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Factory className="w-10 h-10 text-blue-400" />
                            <h1 className="text-4xl text-gray-100">廠務層總覽</h1>
                        </div>
                        <p className="text-gray-400 ml-13">工廠設備監控系統 - 實時狀態監測</p>
                    </div>

                    {/* 各個監測的組件 */}
                    {stats && (
                        <>
                            <CategorySection
                                title="馬達監控"
                                accentColor="bg-blue-500"
                                category="motor"
                                stats={stats.motorStats}
                            />

                            <CategorySection
                                title="水管監控"
                                accentColor="bg-cyan-500"
                                category="pipe"
                                stats={stats.pipeStats}
                            />

                            {/* 系統統計摘要 */}
                            <section className="mt-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl transition-all hover:border-gray-600">
                                <h3 className="text-xl font-semibold text-gray-200 mb-8">系統統計摘要</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                                    <StatItem label="總設備數" value={stats.totalCount} />
                                    <StatItem label="馬達數量" value={stats.motorStats.total} />
                                    <StatItem label="水管數量" value={stats.pipeStats.total} />
                                    <StatItem label="總警報數" value={stats.totalWarning} isWarning />
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}
