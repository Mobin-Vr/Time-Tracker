import { useAppContext } from '@/context/AppContext';
import { DigitalClock } from './DigitalClock';

export function Header() {
   const { state } = useAppContext();

   const totalWorkSeconds = state.tasks.reduce(
      (sum, task) => sum + task.elapsedSeconds,
      0,
   );

   return (
      <header className='w-full'>
         <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 items-center justify-center'>
            <DigitalClock
               seconds={totalWorkSeconds}
               label='Total Work'
               className='bg-card border rounded-xl p-6 shadow-sm'
            />
            <DigitalClock
               seconds={state.breakSeconds}
               label='Total Break'
               className='bg-card border rounded-xl p-6 shadow-sm'
            />
         </div>
      </header>
   );
}
