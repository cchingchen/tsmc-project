import { useNavigate } from 'react-router-dom';
import { Factory, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  username?: string;
}

export function Header({ username }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-gray-100 font-semibold">
                工廠監控系統
              </h1>
              <p className="text-xs text-gray-400">Factory Monitoring System</p>
            </div>
          </div>

          {/* Right: User info and logout */}
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Hi, <span className="text-blue-400 font-medium">{username}</span>!
            </span>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-gray-100 hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
