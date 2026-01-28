import React from 'react';
import { StatusCard } from './StatusCard';

interface CategorySectionProps {
    title: string;
    accentColor: string;
    stats: { warning: number; normal: number; maintenance: number };
    category: 'motor' | 'pipe';
}

export const CategorySection = React.memo(({ title, accentColor, stats, category }: CategorySectionProps) => (
    <section className="mb-12">
        <h2 className="text-2xl text-gray-200 mb-6 flex items-center gap-2">
            <div className={`w-2 h-8 ${accentColor} rounded`}></div>
            {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatusCard title="警報" count={stats.warning} type="warning" category={category} />
            <StatusCard title="正常" count={stats.normal} type="normal" category={category} />
            <StatusCard title="維修" count={stats.maintenance} type="maintenance" category={category} />
        </div>
    </section>
));