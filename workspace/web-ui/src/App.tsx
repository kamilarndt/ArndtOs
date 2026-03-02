import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import './App.css'

type ModuleType = 'status' | 'dashboard' | 'console' | 'settings' | null;

interface ModuleConfig {
  id: ModuleType;
  label: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const modules: ModuleConfig[] = [
  {
    id: 'status',
    label: 'Status Systemu',
    icon: <Activity className="w-5 h-5" />,
    enabled: true,
  },
  {
    id: 'dashboard',
    label: 'Dashboard Główny',
    icon: <LayoutDashboard className="w-5 h-5" />,
    enabled: true,
  },
  {
    id: 'console',
    label: 'Konsola Agenta',
    icon: <Terminal className="w-5 h-5" />,
    enabled: true,
  },
  {
    id: 'settings',
    label: 'Ustawienia',
    icon: <Settings className="w-5 h-5" />,
    enabled: false,
  },
];

export function App() {
  const [activeModule, setActiveModule] = useState<ModuleType>(null);

  // Initialize WebSocket connection on app mount
  useEffect(() => {
    wsClient.connect();
    return () => {
      wsClient.disconnect();
    };
  }, []);

  const renderModule = () => {
    switch (activeModule) {
      case 'status':
        return <StatusModule />;
      case 'dashboard':
        return <DashboardModule />;
      case 'console':
        return <ConsoleModule />;
      case 'settings':
        return (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Ustawienia</h2>
              <p className="text-xl text-muted-foreground">
                Moduł w przygotowaniu...
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Menu boczne */}
      <aside className="w-64 border-r bg-card">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Wspaniale AI</h1>
          <p className="text-sm text-muted-foreground">Architektura Rdzenia</p>
        </div>
        <nav className="space-y-2 p-4">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.enabled ? module.id : null)}
              className={`w-full rounded-lg px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                activeModule === module.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              } ${!module.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!module.enabled}
            >
              {module.icon}
              <span>{module.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Główna zawartość */}
      <main className="flex-1 overflow-auto">
        {activeModule === null && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Witaj w Wspaniale AI</h2>
              <p className="text-xl text-muted-foreground">
                Wybierz moduł z menu bocznego, aby rozpocząć
              </p>
            </div>
          </div>
        )}

        {activeModule !== null && renderModule()}
      </main>
    </div>
  );
}
