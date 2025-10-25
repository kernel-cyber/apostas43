import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'dark', label: 'Escuro', icon: '🌙' },
    { value: 'light', label: 'Claro', icon: '☀️' },
    { value: 'racing-yellow', label: 'Racing Yellow', icon: '🏁' },
    { value: 'neon-green', label: 'Neon Green', icon: '💚' },
    { value: 'red-hot', label: 'Red Hot', icon: '🔥' },
    { value: 'blue-ice', label: 'Blue Ice', icon: '❄️' },
    { value: 'purple-galaxy', label: 'Purple Galaxy', icon: '🌌' },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={theme === t.value ? 'bg-accent' : ''}
          >
            <span className="mr-2">{t.icon}</span>
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
