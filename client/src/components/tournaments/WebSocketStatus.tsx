import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WebSocketStatusProps {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
  className?: string;
  showText?: boolean;
}

export function WebSocketStatus({ 
  connected, 
  reconnecting, 
  error,
  className,
  showText = true 
}: WebSocketStatusProps) {
  const getStatusColor = () => {
    if (reconnecting) return 'text-yellow-500';
    if (connected) return 'text-green-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (reconnecting) return 'Reconnecting...';
    if (connected) return 'Live';
    if (error) return `Offline: ${error}`;
    return 'Disconnected';
  };

  const getIcon = () => {
    if (reconnecting) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (connected) {
      return <Wifi className="h-4 w-4" />;
    }
    return <WifiOff className="h-4 w-4" />;
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border',
        connected && 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
        reconnecting && 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
        !connected && !reconnecting && 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
        className
      )}
      title={error || getStatusText()}
    >
      <div className={getStatusColor()}>
        {getIcon()}
      </div>
      {showText && (
        <span className={cn('text-sm font-medium', getStatusColor())}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
}
