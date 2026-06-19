import { Minus, Square, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function TitleBar() {
  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div className='titlebar flex items-center justify-between h-9 select-none'>
      {/* Left: empty draggable spacer */}
      <div className='titlebar-drag flex-1 min-w-0' />

      {/* Right: Theme toggle + Window controls */}
      <div className='flex items-center h-full'>
        <div className='titlebar-btn flex items-center h-full -ml-5 mr-[10px]'>
          <ThemeToggle />
        </div>
        <div className='flex h-full'>
          <button
            onClick={handleMinimize}
            className='titlebar-btn h-full px-3 flex items-center justify-center hover:bg-accent transition-colors'
            aria-label='Minimize'
            tabIndex={-1}
          >
            <Minus className='h-3.5 w-3.5' />
          </button>
          <button
            onClick={handleMaximize}
            className='titlebar-btn h-full px-3 flex items-center justify-center hover:bg-accent transition-colors'
            aria-label='Maximize'
            tabIndex={-1}
          >
            <Square className='h-3 w-3' />
          </button>
          <button
            onClick={handleClose}
            className='titlebar-btn h-full px-3 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors'
            aria-label='Close'
            tabIndex={-1}
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
}