import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuTrigger,
   DropdownMenuContent,
   DropdownMenuRadioGroup,
   DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';

const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
   { value: 'light', label: 'Light', icon: Sun },
   { value: 'dark', label: 'Dark', icon: Moon },
   { value: 'system', label: 'System', icon: Monitor },
];

export function ThemeToggle() {
   const { theme, setTheme, resolvedTheme } = useTheme();

   const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button
               variant='ghost'
               size='icon'
               className='titlebar-btn h-9 w-9 border-0 outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
            >
               <CurrentIcon className='h-4 w-4' />
               <span className='sr-only'>Toggle theme</span>
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align='end' sideOffset={4}>
            <DropdownMenuRadioGroup
               value={theme}
               onValueChange={(value) => setTheme(value as Theme)}
            >
               {themeOptions.map(({ value, label, icon: Icon }) => (
                  <DropdownMenuRadioItem
                     key={value}
                     value={value}
                     className='cursor-pointer'
                  >
                     <Icon className='h-4 w-4 mr-2' />
                     {label}
                  </DropdownMenuRadioItem>
               ))}
            </DropdownMenuRadioGroup>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}