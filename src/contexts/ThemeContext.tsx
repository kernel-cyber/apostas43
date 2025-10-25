import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'dark' | 'light' | 'racing-yellow' | 'neon-green' | 'red-hot' | 'blue-ice' | 'purple-galaxy';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // Carregar tema do usuário
    const loadTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', user.id)
          .single();
        
        if (data?.theme_preference) {
          setThemeState(data.theme_preference as Theme);
        }
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    // Aplicar tema ao documento
    const root = document.documentElement;
    root.className = theme;
    
    // Definir variáveis CSS baseado no tema
    const themes: Record<Theme, any> = {
      dark: {
        '--background': '222 47% 11%',
        '--foreground': '213 31% 91%',
        '--primary': '47 84% 58%',
      },
      light: {
        '--background': '0 0% 100%',
        '--foreground': '222 47% 11%',
        '--primary': '47 84% 48%',
      },
      'racing-yellow': {
        '--background': '222 47% 11%',
        '--foreground': '213 31% 91%',
        '--primary': '47 100% 50%',
        '--accent': '47 84% 58%',
      },
      'neon-green': {
        '--background': '222 47% 11%',
        '--foreground': '213 31% 91%',
        '--primary': '142 76% 36%',
        '--accent': '142 71% 45%',
      },
      'red-hot': {
        '--background': '222 47% 11%',
        '--foreground': '213 31% 91%',
        '--primary': '0 72% 51%',
        '--accent': '0 84% 60%',
      },
      'blue-ice': {
        '--background': '222 47% 11%',
        '--foreground': '213 31% 91%',
        '--primary': '199 89% 48%',
        '--accent': '199 89% 58%',
      },
      'purple-galaxy': {
        '--background': '222 47% 11%',
        '--foreground': '213 31% 91%',
        '--primary': '271 91% 65%',
        '--accent': '271 81% 75%',
      }
    };

    const themeVars = themes[theme];
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Salvar no perfil do usuário
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newTheme })
        .eq('id', user.id);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
