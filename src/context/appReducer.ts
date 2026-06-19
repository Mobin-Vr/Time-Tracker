import type { AppState, Action, Task } from '@/types';
import { defaultState } from '@/types';
import { playWorkAlert, playBreakAlert } from '@/utils/sounds';

export function appReducer(state: AppState, action: Action): AppState {
   switch (action.type) {
      case 'ADD_TASK': {
         const newTask: Task = {
            id: crypto.randomUUID(),
            name: action.payload.name,
            elapsedSeconds: 0,
            status: 'idle',
         };
         return {
            ...state,
            tasks: [...state.tasks, newTask],
         };
      }

      case 'UPDATE_TASK_NAME': {
         const { taskId, name } = action.payload;
         return {
            ...state,
            tasks: state.tasks.map((t) =>
               t.id === taskId ? { ...t, name: name.slice(0, 50) } : t,
            ),
         };
      }

      case 'START_TASK': {
         const { taskId } = action.payload;
         const task = state.tasks.find((t) => t.id === taskId);
         if (!task || task.status === 'finished') return state;

         // Pause any currently running task
         const updatedTasks = state.tasks.map((t) => {
            if (t.status === 'running') {
               return { ...t, status: 'paused' as const };
            }
            return t;
         });

         // Reset work alert countdown so it starts fresh
         const workAlertRemaining =
            state.workAlertMinutes > 0 ? state.workAlertMinutes * 60 : 0;

         return {
            ...state,
            tasks: updatedTasks.map((t) =>
               t.id === taskId ? { ...t, status: 'running' as const } : t,
            ),
            activeTaskId: taskId,
            isBreakRunning: false,
            workAlertRemaining,
         };
      }

      case 'PAUSE_TASK': {
         const { taskId } = action.payload;
         if (taskId !== state.activeTaskId) return state;

         // Reset work alert to user's set value
         const workAlertRemaining =
            state.workAlertMinutes > 0 ? state.workAlertMinutes * 60 : 0;

         return {
            ...state,
            tasks: state.tasks.map((t) =>
               t.id === taskId ? { ...t, status: 'paused' as const } : t,
            ),
            activeTaskId: null,
            workAlertRemaining,
         };
      }

      case 'START_BREAK': {
         // The caller should have paused any running task first.
         // Enforce mutual exclusion by pausing any running task.
         const updatedTasks = state.tasks.map((t) => {
            if (t.status === 'running') {
               return { ...t, status: 'paused' as const };
            }
            return t;
         });

         // Reset work alert since work timer paused, reset break alert to start fresh
         const workAlertRemaining =
            state.workAlertMinutes > 0 ? state.workAlertMinutes * 60 : 0;
         const breakAlertRemaining =
            state.breakAlertMinutes > 0 ? state.breakAlertMinutes * 60 : 0;

         return {
            ...state,
            tasks: updatedTasks,
            activeTaskId: null,
            isBreakRunning: true,
            workAlertRemaining,
            breakAlertRemaining,
         };
      }

      case 'STOP_BREAK': {
         // Reset break alert to user's set value
         const breakAlertRemaining =
            state.breakAlertMinutes > 0 ? state.breakAlertMinutes * 60 : 0;

         return {
            ...state,
            isBreakRunning: false,
            breakAlertRemaining,
         };
      }

      case 'FINISH_TASK': {
         const { taskId } = action.payload;
         const task = state.tasks.find((t) => t.id === taskId);
         if (!task) return state;

         // Reset both alerts to user's set values
         const workAlertRemaining =
            state.workAlertMinutes > 0 ? state.workAlertMinutes * 60 : 0;
         const breakAlertRemaining =
            state.breakAlertMinutes > 0 ? state.breakAlertMinutes * 60 : 0;

         return {
            ...state,
            tasks: state.tasks.map((t) =>
               t.id === taskId ? { ...t, status: 'finished' as const } : t,
            ),
            activeTaskId:
               state.activeTaskId === taskId ? null : state.activeTaskId,
            isBreakRunning: state.isBreakRunning ? false : state.isBreakRunning,
            workAlertRemaining,
            breakAlertRemaining,
         };
      }

      case 'DELETE_TASK': {
         const { taskId } = action.payload;
         const task = state.tasks.find((t) => t.id === taskId);
         if (!task) return state;
         // Only allow deletion of idle or finished tasks
         if (task.status !== 'idle' && task.status !== 'finished') return state;

         return {
            ...state,
            tasks: state.tasks.filter((t) => t.id !== taskId),
            activeTaskId:
               state.activeTaskId === taskId ? null : state.activeTaskId,
         };
      }

      case 'TICK': {
         const isWorkTaskRunning =
            state.activeTaskId !== null &&
            state.tasks.some(
               (t) => t.id === state.activeTaskId && t.status === 'running',
            );

         let newState = { ...state };

         if (isWorkTaskRunning) {
            // Tick work elapsed time
            newState = {
               ...newState,
               tasks: state.tasks.map((t) =>
                  t.id === state.activeTaskId
                     ? { ...t, elapsedSeconds: t.elapsedSeconds + 1 }
                     : t,
               ),
            };
            // Tick work alert countdown
            if (state.workAlertMinutes > 0 && state.workAlertRemaining > 0) {
               const newRemaining = state.workAlertRemaining - 1;
               if (newRemaining <= 0) {
                  playWorkAlert();
               }
               newState = {
                  ...newState,
                  workAlertRemaining: Math.max(0, newRemaining),
               };
            }
         } else if (state.isBreakRunning) {
            // Tick break elapsed time
            newState = {
               ...newState,
               breakSeconds: state.breakSeconds + 1,
            };
            // Tick break alert countdown
            if (state.breakAlertMinutes > 0 && state.breakAlertRemaining > 0) {
               const newRemaining = state.breakAlertRemaining - 1;
               if (newRemaining <= 0) {
                  playBreakAlert();
               }
               newState = {
                  ...newState,
                  breakAlertRemaining: Math.max(0, newRemaining),
               };
            }
         }
         // else: no timer is running — neither countdown changes, nothing ticks

         return newState;
      }

      case 'SET_WORK_ALERT': {
         const minutes = Math.max(0, Math.floor(action.payload.minutes));
         return {
            ...state,
            workAlertMinutes: minutes,
            workAlertRemaining: minutes > 0 ? minutes * 60 : 0,
         };
      }

      case 'SET_BREAK_ALERT': {
         const minutes = Math.max(0, Math.floor(action.payload.minutes));
         return {
            ...state,
            breakAlertMinutes: minutes,
            breakAlertRemaining: minutes > 0 ? minutes * 60 : 0,
         };
      }

      case 'SET_WORK_ALERT_REMAINING': {
         return {
            ...state,
            workAlertRemaining: Math.max(0, Math.floor(action.payload.seconds)),
         };
      }

      case 'SET_BREAK_ALERT_REMAINING': {
         return {
            ...state,
            breakAlertRemaining: Math.max(0, Math.floor(action.payload.seconds)),
         };
      }

      case 'RESET_WORK_ALERT': {
         return {
            ...state,
            workAlertRemaining:
               state.workAlertMinutes > 0 ? state.workAlertMinutes * 60 : 0,
         };
      }

      case 'RESET_BREAK_ALERT': {
         return {
            ...state,
            breakAlertRemaining:
               state.breakAlertMinutes > 0 ? state.breakAlertMinutes * 60 : 0,
         };
      }

      case 'RESET_ALL': {
         return { ...defaultState };
      }

      default:
         return state;
   }
}