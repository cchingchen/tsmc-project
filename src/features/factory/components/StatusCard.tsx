import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Wrench } from 'lucide-react';

interface StatusCardProps {
  title: string;
  count: number;
  type: 'warning' | 'normal' | 'maintenance';
  category: 'motor' | 'pipe';
}

export function StatusCard({ title, count, type, category }: StatusCardProps) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-8 h-8" />;
      case 'normal':
        return <CheckCircle className="w-8 h-8" />;
      case 'maintenance':
        return <Wrench className="w-8 h-8" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-red-900/30 hover:bg-red-900/50 border-red-800',
          text: 'text-red-400',
          border: 'border-red-800',
        };
      case 'normal':
        return {
          bg: 'bg-green-900/30 hover:bg-green-900/50 border-green-800',
          text: 'text-green-400',
          border: 'border-green-800',
        };
      case 'maintenance':
        return {
          bg: 'bg-orange-900/30 hover:bg-orange-900/50 border-orange-800',
          text: 'text-orange-400',
          border: 'border-orange-800',
        };
    }
  };

  const colors = getColors();

  const handleClick = () => {
    navigate(`/application/${category}?status=${type}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6 transition-all duration-200 transform hover:scale-105 cursor-pointer w-full text-left`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg ${colors.text}`}>{title}</h3>
        <div className={colors.text}>{getIcon()}</div>
      </div>
      <div className={`text-4xl ${colors.text}`}>{count}</div>
      <div className="text-sm text-gray-400 mt-2">點擊查看詳情</div>
    </button>
  );
}