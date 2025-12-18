import React, { useState, useEffect } from 'react';
import { useQueue } from './hooks/useQueue';
import DisplayScreen from './components/DisplayScreen';
import RegistrationKiosk from './components/RegistrationKiosk';
import BoxConsole from './components/BoxConsole';
import AdminPanel from './components/AdminPanel';
import ExternalWindow from './components/ExternalWindow';
import { AppView } from './types';
import { Monitor, User, Settings, LayoutGrid, MonitorPlay, ChevronRight, Play, Sun, Moon, Shield } from 'lucide-react';

// 👉 Roles simples, sin backend ni auth (solo control de vistas)
export type Role = 'PUBLIC' | 'OPERATOR' | 'ADMIN';

function App() {
  const { 
    state, addTicket, callNextTicket, updateTickerLine, updateTickerMode, updateRssFeed,
    updateClockConfig, updateSlides, addSlide, removeSlide, updateImagePlaylist,
    updateDisplayMap, updateVideoPlaylist, getWaitingList, getCalledList 
  } = useQueue();

  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showExternalDisplay, setShowExternalDisplay] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [role, setRole] = useState<Role>('PUBLIC');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const canAccess = (view: AppView) => {
    if (view === AppView.ADMIN) return role === 'ADMIN';
    if (view === AppView.OPERATOR) return role === 'OPERATOR' || role === 'ADMIN';
    return true;
  };

  const safeSetView = (view: AppView) => {
    if (!canAccess(view)) {
      alert('No tienes permisos para acceder a esta vista.');
      return;
    }
    setCurrentView(view);
  };

  const renderMainView = () => {
    switch (currentView) {
      case AppView.DISPLAY:
        return (
          <DisplayScreen
            calledTickets={getCalledList()}
            tickerLines={state.tickerLines}
            tickerMode={state.tickerMode}
            slides={state.slides}
            rssFeeds={state.rssFeeds}
            clockConfig={state.clockConfig}
            imagePlaylist={state.imagePlaylist}
            displayMode={state.displayMode}
            mapUrl={state.mapUrl}
            videoPlaylist={state.videoPlaylist}
            onBack={() => setCurrentView(AppView.HOME)}
          />
        );

      case AppView.REGISTRATION:
        return (
          <RegistrationKiosk
            onRegister={addTicket}
            onBack={() => setCurrentView(AppView.HOME)}
          />
        );

      case AppView.OPERATOR:
        return (
          <BoxConsole
            waitingTickets={getWaitingList()}
            onCallNext={callNextTicket}
            onBack={() => setCurrentView(AppView.HOME)}
          />
        );

      case AppView.ADMIN:
        return (
          <AdminPanel
            tickerLines={state.tickerLines}
            tickerMode={state.tickerMode}
            slides={state.slides}
            rssFeeds={state.rssFeeds}
            clockConfig={state.clockConfig}
            onUpdateTickerLine={updateTickerLine}
            onUpdateTickerMode={updateTickerMode}
            onUpdateRssFeed={updateRssFeed}
            onUpdateClockConfig={updateClockConfig}
            onUpdateSlides={updateSlides}
            onAddSlide={addSlide}
            onRemoveSlide={removeSlide}
            onUpdateImagePlaylist={updateImagePlaylist}
            onUpdateMap={updateDisplayMap}
            onUpdateVideoPlaylist={updateVideoPlaylist}
            onBack={() => setCurrentView(AppView.HOME)}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/60 dark:bg-white/10"
            >
              {darkMode ? <Sun /> : <Moon />}
            </button>

            {/* Selector de rol (simple y explícito) */}
            <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/70 dark:bg-black/30 p-2 rounded-xl">
              <Shield className="w-4 h-4" />
              <select
                value={role}
                onChange={e => setRole(e.target.value as Role)}
                className="bg-transparent text-sm outline-none"
              >
                <option value="PUBLIC">Público</option>
                <option value="OPERATOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            <h1 className="text-5xl font-black mb-12">DigiTurno<span className="text-indigo-600">AI</span></h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">

              <button onClick={() => safeSetView(AppView.DISPLAY)} className="card">
                <Monitor /> Pantalla TV
              </button>

              <button onClick={() => safeSetView(AppView.REGISTRATION)} className="card">
                <User /> Kiosco Registro
              </button>

              <button onClick={() => safeSetView(AppView.OPERATOR)} className="card">
                <LayoutGrid /> Operador
              </button>

              <button onClick={() => safeSetView(AppView.ADMIN)} className="card">
                <Settings /> Administración
              </button>

              <button onClick={() => setShowExternalDisplay(!showExternalDisplay)} className="card">
                <MonitorPlay /> Segunda Pantalla
              </button>

            </div>
          </div>
        );
    }
  };

  return (
    <>
      {renderMainView()}

      {showExternalDisplay && (
        <ExternalWindow onClose={() => setShowExternalDisplay(false)}>
          <DisplayScreen
            calledTickets={getCalledList()}
            tickerLines={state.tickerLines}
            tickerMode={state.tickerMode}
            slides={state.slides}
            rssFeeds={state.rssFeeds}
            clockConfig={state.clockConfig}
            imagePlaylist={state.imagePlaylist}
            displayMode={state.displayMode}
            mapUrl={state.mapUrl}
            videoPlaylist={state.videoPlaylist}
            onBack={() => setShowExternalDisplay(false)}
          />
        </ExternalWindow>
      )}
    </>
  );
}

export default App;

