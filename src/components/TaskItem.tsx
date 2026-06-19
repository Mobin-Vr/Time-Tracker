import { useState } from 'react';
import type { Task } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { DigitalClock } from './DigitalClock';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Trash2 } from 'lucide-react';

interface TaskItemProps {
   task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
   const { state, dispatch } = useAppContext();
   const [isEditingName, setIsEditingName] = useState(false);
   const [editName, setEditName] = useState(task.name);

   const isRunning = task.status === 'running';
   const isPaused = task.status === 'paused';
   const isFinished = task.status === 'finished';
   const isIdle = task.status === 'idle';
   const canDelete = isIdle || isFinished;

   const handleStart = () => {
      if (state.isBreakRunning) {
         dispatch({ type: 'STOP_BREAK' });
      }
      dispatch({ type: 'START_TASK', payload: { taskId: task.id } });
   };

   const handlePause = () => {
      // First pause the task, then start break
      dispatch({ type: 'PAUSE_TASK', payload: { taskId: task.id } });
      dispatch({ type: 'START_BREAK' });
   };

   const handleFinish = () => {
      dispatch({ type: 'FINISH_TASK', payload: { taskId: task.id } });
   };

   const handleDelete = () => {
      dispatch({ type: 'DELETE_TASK', payload: { taskId: task.id } });
   };

   const handleNameSubmit = () => {
      dispatch({
         type: 'UPDATE_TASK_NAME',
         payload: { taskId: task.id, name: editName },
      });
      setIsEditingName(false);
   };

   const handleNameKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
         handleNameSubmit();
      }
      if (e.key === 'Escape') {
         setEditName(task.name);
         setIsEditingName(false);
      }
   };

   return (
      <Card
         className={`transition-all ${
            isRunning ? 'ring-2 ring-primary ring-offset-2' : ''
         }`}
      >
         <CardContent className='p-4'>
            <div className='flex items-center gap-3 flex-wrap'>
               {/* Task Name */}
               <div className='flex-1 min-w-[150px]'>
                  {isEditingName ? (
                     <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={handleNameSubmit}
                        onKeyDown={handleNameKeyDown}
                        autoFocus
                        maxLength={50}
                        className='h-8 text-sm'
                     />
                  ) : (
                     <button
                        onClick={() => {
                           setEditName(task.name);
                           setIsEditingName(true);
                        }}
                        className='text-sm font-medium text-left hover:text-primary transition-colors truncate max-w-[200px] block'
                        title='Click to rename'
                     >
                        {task.name}
                     </button>
                  )}
               </div>

               {/* Task Timer */}
               <DigitalClock
                  seconds={task.elapsedSeconds}
                  size='sm'
                  className='min-w-[90px]'
               />

               {/* Status Badge / Action Buttons */}
               <div className='flex items-center gap-2'>
                  {isFinished && <Badge variant='secondary'>Completed</Badge>}

                  {isIdle && (
                     <Button size='sm' onClick={handleStart}>
                        Start
                     </Button>
                  )}

                  {isRunning && (
                     <>
                        <Button
                           size='sm'
                           variant='outline'
                           onClick={handlePause}
                        >
                           Break
                        </Button>
                        <Button
                           size='sm'
                           variant='destructive'
                           onClick={handleFinish}
                        >
                           Finish
                        </Button>
                     </>
                  )}

                  {isPaused && (
                     <>
                        <Button size='sm' onClick={handleStart}>
                           Start
                        </Button>
                        <Button
                           size='sm'
                           variant='destructive'
                           onClick={handleFinish}
                        >
                           Finish
                        </Button>
                     </>
                  )}

                  {/* Delete Button */}
                  {canDelete && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button
                              size='icon'
                              variant='ghost'
                              aria-label='Delete task'
                              className='text-muted-foreground hover:text-destructive'
                           >
                              <Trash2 className='h-4 w-4' />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                           <AlertDialogHeader>
                              <AlertDialogTitle>Delete Task</AlertDialogTitle>
                              <AlertDialogDescription>
                                 Are you sure you want to delete "{task.name}"?
                                 This action cannot be undone.
                              </AlertDialogDescription>
                           </AlertDialogHeader>
                           <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDelete}>
                                 Delete
                              </AlertDialogAction>
                           </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                  )}
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
