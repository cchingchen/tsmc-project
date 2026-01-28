export function StatItem({ label, value, isWarning = false }: { label: string; value: number; isWarning?: boolean }) {
    return (
        <div className="relative group">
            <div className="text-sm text-gray-400 mb-2">{label}</div>
            <div className={`text-4xl font-black tracking-tight ${isWarning ? 'text-red-500' : 'text-gray-100'}`}>
                {value.toLocaleString()}
            </div>
            <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></div>
        </div>
    );
}