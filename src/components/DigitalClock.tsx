import { formatTime } from '@/utils/time';
import { cn } from '@/lib/utils';

interface DigitalClockProps {
   seconds: number;
   label?: string;
   className?: string;
   size?: 'sm' | 'lg';
}

export function DigitalClock({
   seconds,
   label,
   className,
   size = 'lg',
}: DigitalClockProps) {
   return (
      <div className={cn('flex flex-col items-center font-mono', className)}>
         {label && (
            <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1'>
               {label}
            </span>
         )}
         <div
            className={cn(
               'tabular-nums tracking-wider text-foreground',
               size === 'lg'
                  ? 'text-5xl sm:text-6xl font-bold'
                  : 'text-2xl font-semibold',
            )}
         >
            {formatTime(seconds)}
         </div>
      </div>
   );
}
