import toast from 'react-hot-toast';
import { AlertTriangle, X, CheckCircle, Ban } from 'lucide-react';

export class ToastManager {
    /**
     * Display a custom alert toast for device warnings
     * @param data Device data including serial, message, and deviceId
     * @param navigate Function to navigate to device details
     */
    static alert(data: { serial: string; message: string; deviceId: string }, navigate: (path: string) => void) {
        toast.custom((t) => (
            <div
                onClick={() => navigate(`/sensor/${data.deviceId}`)}
                className={`${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } transition-all duration-500 max-w-md w-full bg-gray-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-red-500/50 p-4 border-l-4 border-red-500 cursor-pointer hover:bg-gray-750`}
            >
                <div className="flex-1 w-0">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-bold text-gray-100">設備異常警報</p>
                            <p className="mt-1 text-sm text-gray-400 font-mono text-xs">
                                [{data.serial}] {data.message}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.dismiss(t.id);
                        }}
                        className="text-gray-500 hover:text-gray-400 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    }

    /**
     * Display a success toast
     * @param message Success message
     */
    static success(message: string) {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } transition-all duration-500 flex items-center gap-3 bg-gray-800 border border-green-500/30 text-gray-100 px-4 py-3 rounded-xl shadow-lg ring-1 ring-green-500/20`}
            >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">{message}</span>
            </div>
        ));
    }

    /**
     * Display an error toast
     * @param message Error message
     */
    static error(message: string) {
        toast.custom((t) => (
            <div
                className={`${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    } transition-all duration-500 flex items-center gap-3 bg-gray-800 border border-red-500/30 text-gray-100 px-4 py-3 rounded-xl shadow-lg ring-1 ring-red-500/20`}
            >
                <Ban className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">{message}</span>
            </div>
        ));
    }
}
