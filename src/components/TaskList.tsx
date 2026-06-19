import { useAppContext } from '@/context/AppContext';
import { TaskItem } from './TaskItem';
import { AlertTimerInput } from './AlertTimerInput';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
   AlertDialog,
   AlertDialogTrigger,
   AlertDialogContent,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogAction,
   AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export function TaskList() {
   const { state, dispatch } = useAppContext();

   const handleAddTask = () => {
      const taskNumber = state.tasks.length + 1;
      dispatch({ type: 'ADD_TASK', payload: { name: `Task ${taskNumber}` } });
   };

   const handleResetAll = () => {
      dispatch({ type: 'RESET_ALL' });
   };

   const handleWorkAlert = (minutes: number) => {
      dispatch({ type: 'SET_WORK_ALERT', payload: { minutes } });
   };

   const handleBreakAlert = (minutes: number) => {
      dispatch({ type: 'SET_BREAK_ALERT', payload: { minutes } });
   };

   const isWorkRunning = state.tasks.some(
      (t) => t.id === state.activeTaskId && t.status === 'running',
   );

   return (
      <div className='w-full space-y-4'>
         {/* Task List */}
         <div className='space-y-3'>
            {state.tasks.length === 0 ? (
               <div className='text-center py-12 text-muted-foreground'>
                  <p className='text-lg'>No tasks yet.</p>
                  <p className='text-sm'>Click 'Add Task' to start.</p>
               </div>
            ) : (
               state.tasks.map((task) => <TaskItem key={task.id} task={task} />)
            )}
         </div>

         {/* Action Buttons & Theme Toggle */}
         <div className='flex items-center justify-between pt-4'>
            <div className='flex gap-3'>
               <Button onClick={handleAddTask} className='gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Task
               </Button>

               {state.tasks.length > 0 && (
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <Button variant='destructive' className='gap-2'>
                           Reset All
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                        <AlertDialogHeader>
                           <AlertDialogTitle>Reset All Data</AlertDialogTitle>
                           <AlertDialogDescription>
                              This will delete all tasks and reset break time to
                              zero. This action cannot be undone. Continue?
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={handleResetAll}>
                              Yes, Reset All
                           </AlertDialogAction>
                        </AlertDialogFooter>
                     </AlertDialogContent>
                  </AlertDialog>
               )}
            </div>

            <div className='flex items-center gap-4'>
               <AlertTimerInput
                  label='Work alert'
                  minutes={state.workAlertMinutes}
                  remaining={state.workAlertRemaining}
                  isRunning={isWorkRunning}
                  onSetMinutes={handleWorkAlert}
               />
               <AlertTimerInput
                  label='Break alert'
                  minutes={state.breakAlertMinutes}
                  remaining={state.breakAlertRemaining}
                  isRunning={state.isBreakRunning}
                  onSetMinutes={handleBreakAlert}
               />
            </div>
         </div>
      </div>
   );
}
