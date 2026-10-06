import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import IconButton from './IconButton';

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return <IconButton icon={dark ? Sun : Moon} label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleTheme} className={className} />;
}
