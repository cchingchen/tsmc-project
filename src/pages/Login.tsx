import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Factory } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // todo: login function
    if (username && password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      navigate('/');
    } else {
      setError('請輸入帳號和密碼');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <Factory className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl text-gray-100 mb-2">工廠監控系統</h1>
          <p className="text-gray-400">Factory Monitoring System</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-200">
                帳號
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="請輸入帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                密碼
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/30 border border-red-800 rounded p-3">
                {error}
              </div>
            )}

            <Button
              variant="outline"
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base"
            >
              登入
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>示範帳號：任意帳號密碼即可登入</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2026 工廠監控系統. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
