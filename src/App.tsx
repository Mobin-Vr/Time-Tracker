import packageJson from '../package.json';
import { AppProvider } from '@/context/AppContext';
import { TitleBar } from '@/components/TitleBar';
import { Header } from '@/components/Header';
import { TaskList } from '@/components/TaskList';

function App() {
   return (
      <AppProvider>
         <div className='min-h-screen bg-background flex flex-col'>
            {window.electronAPI && <TitleBar />}
            <div className='max-w-3xl mx-auto px-4 py-8 space-y-8 flex-1'>
               <Header />
               <TaskList />
            </div>
            <p className='fixed bottom-2.5 left-4 text-[11px] text-muted-foreground/50 select-none pointer-events-none'>
               v{packageJson.version}
            </p>
         </div>
      </AppProvider>
   );
}

export default App;