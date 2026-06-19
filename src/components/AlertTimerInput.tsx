import { useState, useRef, useEffect } from 'react';
import {
   Tooltip,
   TooltipTrigger,
   TooltipContent,
   TooltipProvider,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AlertTimerInputProps {
   label: string;
   minutes: number;
   remaining: number;
   isRunning: boolean;
   onSetMinutes: (minutes: number) => void;
}

export function AlertTimerInput({
   label,
   minutes,
   remaining,
   isRunning,
   onSetMinutes,
}: AlertTimerInputProps) {
   const [editingValue, setEditingValue] = useState<string>(
      String(minutes || ''),
   );
   const [isEditing, setIsEditing] = useState(false);
   const inputRef = useRef<HTMLInputElement>(null);

   // Sync editing value when not editing and minutes change externally
   useEffect(() => {
      if (!isEditing) {
         setEditingValue(String(minutes || ''));
      }
   }, [minutes, isEditing]);

   // Focus input when entering edit mode
   useEffect(() => {
      if (isEditing && inputRef.current) {
         inputRef.current.focus();
         inputRef.current.select();
      }
   }, [isEditing]);

   const showCountdown = isRunning && minutes > 0;

   // Determine display value
   let displayValue: string;
   if (isEditing) {
      displayValue = editingValue;
   } else if (showCountdown) {
      const minsRemaining = Math.ceil(remaining / 60);
      displayValue = String(minsRemaining);
   } else {
      displayValue = String(minutes || '');
   }

   const isCountingDown = showCountdown && remaining > 0;
   const isAlertTriggered = showCountdown && remaining === 0;

   const handleStartEditing = () => {
      if (isEditing) return;
      setEditingValue(String(minutes || ''));
      setIsEditing(true);
   };

   const handleBlur = () => {
      setIsEditing(false);
      const value = parseInt(editingValue, 10);
      if (!isNaN(value) && value >= 0) {
         onSetMinutes(Math.min(value, 999));
      } else {
         onSetMinutes(0);
      }
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
         inputRef.current?.blur();
      }
      if (e.key === 'Escape') {
         setEditingValue(String(minutes || ''));
         setIsEditing(false);
      }
   };

   return (
      <TooltipProvider delayDuration={300}>
         <Tooltip>
            <TooltipTrigger asChild>
               <div
                  className={cn(
                     'flex items-center gap-1.5 rounded-md border px-2.5 h-9 transition-all select-none',
                     isCountingDown &&
                        'border-primary/50 bg-primary/5 animate-pulse-ring',
                     isAlertTriggered && 'border-red-500 bg-red-500/10',
                     !isCountingDown && !isAlertTriggered && 'bg-card border',
                  )}
               >
                  <span className='text-[11px] text-muted-foreground whitespace-nowrap leading-none'>
                     {label}
                  </span>
                  <input
                     ref={inputRef}
                     type='text'
                     inputMode='numeric'
                     value={displayValue}
                     onChange={(e) => {
                        const val = e.target.value;
                        if (/^\d*$/.test(val)) {
                           setEditingValue(val);
                        }
                     }}
                     onFocus={handleStartEditing}
                     onBlur={handleBlur}
                     onKeyDown={handleKeyDown}
                     readOnly={!isEditing}
                     className={cn(
                        'w-8 bg-transparent text-xs text-center font-medium outline-none border-none p-0 m-0',
                        'focus:ring-0 focus-visible:ring-0 focus-visible:outline-none',
                     )}
                  />
               </div>
            </TooltipTrigger>
            <TooltipContent side='bottom' className='text-xs'>
               Set duration – notifies you when time's up!
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   );
}
