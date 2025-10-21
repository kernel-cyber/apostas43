import { useToast } from '@/hooks/use-toast';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

const notificationStyles = {
  success: {
    className: 'bg-green-500/90 text-white border-green-600',
    icon: '✅',
    duration: 5000
  },
  error: {
    className: 'bg-red-500/90 text-white border-red-600',
    icon: '❌',
    duration: 7000
  },
  warning: {
    className: 'bg-yellow-500/90 text-black border-yellow-600',
    icon: '⚠️',
    duration: 6000
  },
  info: {
    className: 'bg-blue-500/90 text-white border-blue-600',
    icon: 'ℹ️',
    duration: 5000
  }
};

export const useStandardNotification = () => {
  const { toast } = useToast();

  const notify = (type: NotificationType, title: string, description: string) => {
    const style = notificationStyles[type];
    toast({
      title: `${style.icon} ${title}`,
      description,
      className: style.className,
      duration: style.duration,
    });
  };

  return {
    success: (title: string, desc: string) => notify('success', title, desc),
    error: (title: string, desc: string) => notify('error', title, desc),
    warning: (title: string, desc: string) => notify('warning', title, desc),
    info: (title: string, desc: string) => notify('info', title, desc),
  };
};
