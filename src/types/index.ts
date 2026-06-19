export type TaskStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface Task {
   id: string;
   name: string;
   elapsedSeconds: number;
   status: TaskStatus;
}

export interface AppState {
   tasks: Task[];
   activeTaskId: string | null;
   breakSeconds: number;
   isBreakRunning: boolean;
   workAlertMinutes: number;
   breakAlertMinutes: number;
   workAlertRemaining: number; // seconds remaining in countdown
   breakAlertRemaining: number; // seconds remaining in countdown
}

export const STORAGE_KEY = 'timeTrackerState';

export const defaultState: AppState = {
   tasks: [],
   activeTaskId: null,
   breakSeconds: 0,
   isBreakRunning: false,
   workAlertMinutes: 0,
   breakAlertMinutes: 0,
   workAlertRemaining: 0,
   breakAlertRemaining: 0,
};

export type Action =
   | { type: 'ADD_TASK'; payload: { name: string } }
   | { type: 'UPDATE_TASK_NAME'; payload: { taskId: string; name: string } }
   | { type: 'START_TASK'; payload: { taskId: string } }
   | { type: 'PAUSE_TASK'; payload: { taskId: string } }
   | { type: 'START_BREAK' }
   | { type: 'STOP_BREAK' }
   | { type: 'FINISH_TASK'; payload: { taskId: string } }
   | { type: 'DELETE_TASK'; payload: { taskId: string } }
   | { type: 'TICK' }
   | { type: 'RESET_ALL' }
   | { type: 'SET_WORK_ALERT'; payload: { minutes: number } }
   | { type: 'SET_BREAK_ALERT'; payload: { minutes: number } }
   | { type: 'SET_WORK_ALERT_REMAINING'; payload: { seconds: number } }
   | { type: 'SET_BREAK_ALERT_REMAINING'; payload: { seconds: number } }
   | { type: 'RESET_WORK_ALERT' }
   | { type: 'RESET_BREAK_ALERT' };
