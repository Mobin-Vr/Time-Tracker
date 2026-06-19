# TimeTracker – Complete Build Specification (Single‑Phase)

## 1. Application Overview & Core Behaviour

You are building a **single‑page, local‑first time tracking application** named **TimeTracker**.  
It helps users log time spent on various tasks, with an integrated global break timer.  
The app is entirely client‑side: all data is stored in the browser's `localStorage` – no backend, no authentication, no external APIs.

### Core Features (What the App Does)

1. **Task Management**
   - Users can create multiple named tasks (e.g., "Coding", "Meeting", "Design").
   - Each task has a custom name that can be edited at any time.
   - Tasks can be in one of four states: `idle`, `running`, `paused`, `finished`.

2. **Time Tracking**
   - Only **one task can run at a time**.
   - When a task is started:
      - If another task was running, it is automatically paused.
      - If the global break timer was running, it is stopped.
      - The selected task becomes `running` and its elapsed time increments every second.
   - The user can **pause** a running task (e.g., to take a break) – this stops the task timer and starts the global break timer.

3. **Global Break Timer**
   - The break timer is **global** – it accumulates across all tasks and sessions.
   - It runs independently of tasks, but **never simultaneously** with any task.
   - When a task is running, break is paused; when break is running, no task runs.
   - The break timer **never resets** unless the user explicitly performs a "Reset All" action. This allows breaks to accumulate over a whole workday.

4. **Finish a Task**
   - Clicking **Finish** on a running or paused task:
      - Marks the task as `finished` (read‑only, no further actions).
      - Stops the break timer if it was running.
      - The task's elapsed time becomes final and is included in total work time.
   - Finished tasks remain in the list for reference but cannot be started or paused again.

5. **Total Work & Total Break Clocks**
   - The header displays two large digital clocks:
      - **Total Work Time** – sum of all tasks' `elapsedSeconds` (including finished ones).
      - **Total Break Time** – the global `breakSeconds` counter.
   - Both clocks update every second and persist across page refreshes.

6. **Delete Tasks**
   - Finished or idle tasks can be deleted (with a confirmation dialog).
   - Running or paused tasks cannot be deleted directly – they must be finished or paused first.

7. **Reset All (New Day / Fresh Start)**
   - A prominent **Reset All** button (with double confirmation) clears **all** tasks and resets the break timer to zero.
   - This is intended for starting a new day or a fresh session – the user does not want previous day's numbers to carry over.

8. **Persistence**
   - The entire application state is saved to `localStorage` on every change.
   - On page load, the state is restored, so the user can continue where they left off (unless they reset).
   - The break timer and task elapsed times are preserved across browser sessions.

9. **Alert Timers (Work & Break Alerts)**
   - Two numeric inputs in the header allow setting work and break alert durations (in minutes).
   - When the corresponding timer runs, the input shows remaining time instead of the set value.
   - When the countdown reaches 0, a distinct sound plays via Web Audio API.
   - Countdown resets to the user's set value when the related timer stops/pauses/finishes.
   - Value 0 means no alert (disabled).
   - Two distinct sounds: work alert (sharp beeps), break alert (soft mellow tone).
   - Values persist in localStorage alongside the rest of state.

---

## 2. Technical Stack (Exact)

| Area                     | Technology                                    | Version / Notes                           |
| ------------------------ | --------------------------------------------- | ----------------------------------------- |
| **Language**             | TypeScript                                    | 5.x, strict mode, no `any`                |
| **Build tool**           | Vite                                          | Latest                                    |
| **UI Framework**         | React                                         | 18+, functional components + hooks        |
| **UI Component Library** | shadcn/ui                                     | Based on Radix UI + Tailwind CSS          |
| **Styling**              | Tailwind CSS                                  | 3.x, with custom theme for digital clocks |
| **State Management**     | React Context + useReducer                    | Single global store                       |
| **Persistence**          | `localStorage`                                | Debounced writes (500ms)                  |
| **ID generation**        | `crypto.randomUUID()`                         | Built‑in                                  |
| **Time formatting**      | Custom `formatTime(seconds)` → `HH:MM:SS`     | Always pad to 2 digits                    |
| **Font**                 | Monospace (e.g., JetBrains Mono, Roboto Mono) | For digital clock look                    |
| **Sound**                | Web Audio API (programmatic tone generation)  | No audio files needed                     |

---

## 3. Critical Constraints (Hard Rules)

- **No backend** – all logic runs in the browser.
- **Single source of truth** – the Redux‑like state is the only source; `localStorage` is a mirror.
- **One interval** – a single `setInterval` (1 second) dispatches a `TICK` action. Never create multiple timers.
- **Mutual exclusion** – at any moment, either:
   - exactly one task is `running`, **or**
   - the break timer is `running`, **or**
   - nothing is running (all tasks paused/idle/finished and break stopped).
- **Break timer is global** – `breakSeconds` **never resets** except by an explicit "Reset All". It accumulates across all tasks and sessions.
- **Task statuses** – `idle`, `running`, `paused`, `finished`.
   - `finished` tasks are immutable (no start/pause/break, but renaming is allowed).
- **Persistence** – the entire state object is written to `localStorage` on every change (debounced). On page load, the state is restored from `localStorage`; if missing, a default state is used.
- **UI responsiveness** – digital clocks must update every second without blocking the main thread.
- **Alert timers are independent** – they do NOT control the main timers. They are simple countdowns that trigger sounds.
- **Sound via Web Audio API** – no audio files. Handle browser autoplay restrictions gracefully.
- **No external libraries** for time handling – use native `Date` or plain arithmetic.

---

## 4. Data Model (TypeScript Definitions)

```typescript
// src/types/index.ts

export type TaskStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface Task {
   id: string; // UUID v4
   name: string; // max 50 characters, editable
   elapsedSeconds: number; // total seconds spent on this task
   status: TaskStatus;
}

export interface AppState {
   tasks: Task[];
   activeTaskId: string | null; // ID of the currently running task (if any)
   breakSeconds: number; // total break seconds (global, persistent)
   isBreakRunning: boolean; // true when break timer is active
   workAlertMinutes: number; // user-set minutes for work alert
   breakAlertMinutes: number; // user-set minutes for break alert
   workAlertRemaining: number; // seconds remaining in work alert countdown
   breakAlertRemaining: number; // seconds remaining in break alert countdown
}
```

**Default state:**

```typescript
const defaultState: AppState = {
   tasks: [],
   activeTaskId: null,
   breakSeconds: 0,
   isBreakRunning: false,
   workAlertMinutes: 0,
   breakAlertMinutes: 0,
   workAlertRemaining: 0,
   breakAlertRemaining: 0,
};
```

**localStorage key:** `'timeTrackerState'`

---

## 5. State Transitions (Reducer Actions)

The reducer must handle the following actions. All actions are dispatched from UI components.

| Action             | Payload                            | Behaviour                                                                                                                                                                                 |
| ------------------ | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ADD_TASK`         | `{ name: string }`                 | Creates a new task with `id = crypto.randomUUID()`, `elapsedSeconds = 0`, `status = 'idle'`.                                                                                              |
| `UPDATE_TASK_NAME` | `{ taskId: string, name: string }` | Updates the name of the task (any status allowed).                                                                                                                                        |
| `START_TASK`       | `{ taskId: string }`               | - If another task is `running`, set it to `paused`.<br>- If `isBreakRunning` is true, set it to `false`.<br>- Set the target task to `running`.<br>- Set `activeTaskId = taskId`.<br>- Reset workAlertRemaining to `workAlertMinutes * 60`. |
| `PAUSE_TASK`       | `{ taskId: string }`               | (Only valid if `taskId === activeTaskId` and task is `running`). Set task status to `paused`, clear `activeTaskId`.<br>- Reset workAlertRemaining to `workAlertMinutes * 60`.             |
| `START_BREAK`      | –                                  | - If any task is `running`, it must be paused first (caller's responsibility).<br>- Set `isBreakRunning = true`.<br>- Clear `activeTaskId`.<br>- Reset both workAlertRemaining and breakAlertRemaining to their set values. |
| `STOP_BREAK`       | –                                  | Set `isBreakRunning = false`.<br>- Reset breakAlertRemaining to `breakAlertMinutes * 60`.                                                                                                  |
| `FINISH_TASK`      | `{ taskId: string }`               | - Set task status to `finished`.<br>- If this task was `activeTaskId`, clear `activeTaskId`.<br>- If `isBreakRunning` is true, set it to `false`.<br>- Reset both alert countdowns.       |
| `DELETE_TASK`      | `{ taskId: string }`               | Remove the task from `tasks` array. Only allowed if task status is `finished` or `idle` (enforced by UI).                                                                                 |
| `TICK`             | –                                  | - If `activeTaskId` is not null and that task is `running`, increment its `elapsedSeconds` by 1.<br>- Else if `isBreakRunning` is true, increment `breakSeconds` by 1.<br>- Decrement `workAlertRemaining` if >0 and work alert active; play sound on reaching 0.<br>- Decrement `breakAlertRemaining` if >0 and break alert active; play sound on reaching 0. |
| `RESET_ALL`        | –                                  | Reset to default state (clears all tasks, resets breakSeconds to 0, clears activeTaskId and isBreakRunning, resets all alerts). Requires double confirmation.                             |
| `SET_WORK_ALERT`   | `{ minutes: number }`              | Sets `workAlertMinutes` and resets `workAlertRemaining` to `minutes * 60` (or 0 if minutes is 0).                                                                                         |
| `SET_BREAK_ALERT`  | `{ minutes: number }`              | Sets `breakAlertMinutes` and resets `breakAlertRemaining` to `minutes * 60` (or 0 if minutes is 0).                                                                                       |
| `SET_WORK_ALERT_REMAINING` | `{ seconds: number }`     | Manually set `workAlertRemaining` (used for mid-countdown edits).                                                                                                                         |
| `SET_BREAK_ALERT_REMAINING` | `{ seconds: number }`    | Manually set `breakAlertRemaining`.                                                                                                                                                       |
| `RESET_WORK_ALERT`  | –                               | Resets `workAlertRemaining` to `workAlertMinutes * 60` (or 0).                                                                                                                            |
| `RESET_BREAK_ALERT` | –                               | Resets `breakAlertRemaining` to `breakAlertMinutes * 60` (or 0).                                                                                                                          |

---

## 6. Timer Engine Implementation

- In the root component (`App.tsx`), use `useEffect` to start a `setInterval` that dispatches `TICK` every 1000 ms.
- The interval must be cleaned up on unmount.
- To avoid memory leaks, the interval callback should reference the dispatch function via `useCallback` or stable ref.
- The `TICK` handler in the reducer also decrements alert countdowns and plays sounds when they reach 0.

**Pseudo‑code:**

```tsx
useEffect(() => {
   const interval = setInterval(() => {
      dispatch({ type: 'TICK' });
   }, 1000);
   return () => clearInterval(interval);
}, [dispatch]);
```

---

## 7. UI Components & Layout

### 7.1. Header (Two Digital Clocks + Alert Inputs)

- **Left:** "Total Work" – displays sum of all tasks' `elapsedSeconds`.
- **Right:** "Total Break" – displays `breakSeconds`.
- Both use the `DigitalClock` component (large, mono font, `HH:MM:SS`).
- Below the clocks, right-aligned: two **AlertTimerInput** components (Work alert, Break alert).
  - Each shows a label, a numeric input (minutes), and a "min" suffix.
  - When the corresponding timer runs, the input shows remaining minutes instead of the set value.
  - A pulsing dot indicator appears when counting down.
  - Tooltip on hover explains the functionality.

### 7.2. AlertTimerInput Component

- **Props:** `label`, `minutes`, `remaining`, `isRunning`, `onSetMinutes`.
- **States:**
  - **Idle** (timer not running): shows the set value in a normal input. Editable on click.
  - **Counting down** (timer running, remaining > 0): shows remaining minutes with a pulsing ring animation and a pulsing dot indicator.
  - **Alert triggered** (timer running, remaining === 0): shows 0 with red border/background.
- **Interaction:** Clicking the input makes it editable. Changing the value resets the countdown to the new value. Press Enter to confirm, Escape to cancel.
- **Edge cases:** Value 0 means no alert (treat as off). Changing value mid-countdown resets to new value.

### 7.3. Task List

- Renders all tasks in a vertical list (or grid) using shadcn/ui `Card`.
- Each `TaskItem` shows:
   - Task name (editable via `Input` – always enabled).
   - Task's own `elapsedSeconds` (smaller clock, but still digital style).
   - Action buttons (conditional):
      - `idle` / `paused` → **Start** (primary button).
      - `running` → **Break** (outline) and **Finish** (destructive).
      - `finished` → no action buttons; show a "Completed" badge (shadcn `Badge`).
   - A **Delete** button (trash icon) – visible only for `finished` or `idle` tasks; triggers an `AlertDialog` confirmation before deleting.

### 7.4. Add Task Button

- A floating or fixed button at the bottom of the task list: **+ Add Task**.
- On click, dispatches `ADD_TASK` with name "Task X" (where X is the next number).
- Immediately after adding, the new task appears in the list with an editable input (so the user can rename it).

### 7.5. Reset All Button

- A prominent button (e.g., in the header or a dedicated footer) labelled **Reset All** (or **New Day**).
- Opens a confirmation dialog (`AlertDialog`) with a warning that **all tasks and break time will be permanently deleted**.
- On confirm, dispatches `RESET_ALL` which resets the entire state to default (empty tasks, breakSeconds = 0, no active task, break not running, alerts reset).
- This action is intended for starting a fresh session (e.g., the next day).

---

## 8. Detailed Interaction Scenarios (Step‑by‑Step)

### Scenario 1: Start first task

1. User adds a task "Coding".
2. Task status is `idle`, elapsed 00:00.
3. User clicks **Start**.
4. Task becomes `running`, header clock starts ticking.
5. Active task is "Coding".
6. If work alert is set (e.g., 30 min), the alert input starts counting down from 30.

### Scenario 2: Start second task while first is running

1. "Coding" is running.
2. User adds "Meeting" and clicks **Start** on it.
3. "Coding" is automatically paused (status `paused`, its elapsed stops).
4. "Meeting" becomes `running`; header clock now shows accumulated time of both (but only "Meeting" increments).
5. Work alert countdown resets to the user's set value.

### Scenario 3: Take a break

1. "Meeting" is running.
2. User clicks **Break**.
3. "Meeting" becomes `paused`, `isBreakRunning = true`.
4. Header's **Total Break** clock starts ticking (from its previous value).
5. Total Work clock stops increasing (since no task is running).
6. Work alert resets to set value. Break alert starts counting down from set value (if set).

### Scenario 4: Resume work after break

1. Break is running (e.g., breakSeconds = 5:00).
2. User clicks **Start** on "Meeting" (which is paused).
3. Break stops (`isBreakRunning = false`).
4. "Meeting" resumes running; its elapsed continues.
5. BreakSeconds remains at 5:00 (it does not reset).
6. Break alert resets to set value. Work alert starts counting down from set value.

### Scenario 5: Finish a task

1. "Meeting" is running (or paused).
2. User clicks **Finish**.
3. "Meeting" status becomes `finished`.
4. If it was running, it stops; if break was running, it stops.
5. Both alert countdowns reset.
6. The task can no longer be started or paused. It shows a "Completed" badge.
7. The total work clock still includes its elapsed time.

### Scenario 6: Delete a finished task

1. "Meeting" is finished.
2. User clicks the trash icon on that task.
3. A confirmation dialog appears: "Delete this task permanently?"
4. On confirm, the task is removed from the list.
5. Total work clock updates accordingly.

### Scenario 7: Reset All (New Day)

1. User has several tasks and break time accumulated.
2. User clicks **Reset All**.
3. Confirmation dialog: "This will delete all tasks and reset break time to zero. Continue?"
4. On confirm, the state returns to default: empty task list, breakSeconds = 0, no active task, alerts reset.
5. All data is cleared from localStorage.
6. The user can now start a fresh day without any previous numbers interfering.

---

## 9. Digital Clock Formatting

```typescript
// src/utils/time.ts
export function formatTime(seconds: number): string {
   const h = Math.floor(seconds / 3600);
   const m = Math.floor((seconds % 3600) / 60);
   const s = seconds % 60;
   return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
```

**Styling:** Use a monospaced font, large font size (e.g., `text-6xl` for header, `text-2xl` for task clocks), and a subtle background/glow to mimic a digital display.

---

## 10. Sound System

```typescript
// src/utils/sounds.ts
import { playWorkAlert, playBreakAlert } from '@/utils/sounds';
```

- Uses Web Audio API to generate tones programmatically (no audio files).
- `playWorkAlert()`: Two short sharp square-wave beeps (880Hz, 1100Hz) with a fade-out tail (~1.5s total).
- `playBreakAlert()`: Two gentle sine-wave pulses (440Hz, 550Hz) with slow attack/release (~2.5s total).
- Handles browser autoplay restrictions by resuming `AudioContext` if suspended.
- Silent exception handling if audio is unavailable.

---

## 11. Code Structure (Folder & File Organisation)

```
src/
├── components/
│   ├── ui/                (shadcn/ui generated components – Button, Card, Input, Tooltip, etc.)
│   ├── AlertTimerInput.tsx
│   ├── DigitalClock.tsx
│   ├── TaskItem.tsx
│   ├── TaskList.tsx
│   ├── Header.tsx
│   └── ThemeToggle.tsx
├── context/
│   ├── AppContext.tsx     (Context provider + useAppContext hook)
│   └── appReducer.ts      (reducer function and action types)
├── hooks/
│   ├── useLocalStorage.ts (sync state with localStorage)
│   └── useTheme.ts        (theme management)
├── types/
│   └── index.ts           (Task, AppState, and action types)
├── utils/
│   ├── sounds.ts          (Web Audio API sound generation)
│   └── time.ts            (formatTime)
├── App.tsx                (root component, sets up Context and interval)
└── main.tsx               (entry point)
```

---

## 12. Coding Standards (Enforced)

- **TypeScript strict**: Enable `strict: true` in `tsconfig.json`. No `any` – use `unknown` if necessary.
- **Component props**: Define explicit interfaces for all props.
- **Reducer actions**: Use a discriminated union for actions.
- **Immutability**: Use the spread operator or `immer` (optional) inside the reducer; never mutate state directly.
- **LocalStorage sync**: Write to `localStorage` only after each state change, but debounce to avoid performance issues. Use `setTimeout` or `lodash.debounce`.
- **Confirmation dialogs**: Use shadcn's `AlertDialog` for destructive actions (delete, reset).
- **Accessibility**: All buttons must have `aria-label` if they contain only icons; use semantic HTML.
- **CSS**: Prefer Tailwind utility classes. Use `cn()` helper from `@/lib/utils` for conditional classes.

---

## 13. Edge Cases to Handle

- **Empty task list** – Show a placeholder: "No tasks yet. Click 'Add Task' to start."
- **Task name too long** – Truncate with `text-ellipsis` and `max-w-[200px]`.
- **Rapid clicks** – Disable buttons while actions are in progress (optional, but good UX).
- **Page refresh** – State must be fully restored from `localStorage`; timers should resume correctly (if a task was running, it should continue after refresh – note that `setInterval` resets on refresh; the TICK will continue from the saved `elapsedSeconds`, so the clock will appear to jump forward by the time spent refreshing. This is acceptable).
- **LocalStorage full** – Catch and display an error if write fails (very rare).
- **Alert value 0** – Means no alert (treat as disabled/off).
- **Changing alert value mid-countdown** – Resets countdown to new value.
- **Finishing a task before alert triggers** – Resets countdown.
- **On reload** – Persisted values restore correctly.

---

## 14. Complete Implementation in One Phase

You are expected to implement **all** of the above in a single cohesive build. Do not split into phases. The final deliverable is a fully functional, polished TimeTracker application that meets every requirement listed here. The code must be clean, well‑commented, and production‑ready.

---

## 15. Final Deliverable Checklist

- [ ] Project initialised with Vite + React + TypeScript.
- [ ] Tailwind CSS and shadcn/ui correctly installed and configured.
- [ ] All types defined as per the data model.
- [ ] Reducer with all actions implemented and tested manually.
- [ ] Context provider wraps the entire app.
- [ ] `useLocalStorage` hook reads/writes state.
- [ ] Global `setInterval` dispatches `TICK` every second.
- [ ] Header displays total work and total break digital clocks.
- [ ] Alert timer inputs with countdown display, pulsing animation, tooltips.
- [ ] Two distinct sound alerts via Web Audio API.
- [ ] Task list renders all tasks with correct status‑based buttons.
- [ ] Start, Break, Finish, Delete, Add, Rename, and Reset All all work as specified.
- [ ] Mutual exclusion between task and break is enforced.
- [ ] Break timer accumulates globally and never resets except via Reset All.
- [ ] UI is clean, modern, and uses digital clock styling.
- [ ] Confirmation dialogs appear for destructive actions.
- [ ] State survives page refresh (including alert values).
- [ ] No errors or warnings in console.

---

**This specification is complete and ready to be used by an AI agent (Cursor, Cline, etc.) to generate the entire application.**

```