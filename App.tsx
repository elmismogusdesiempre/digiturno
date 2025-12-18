
import React, { useState, useEffect } from 'react';
import { useQueue } from './hooks/useQueue';
import DisplayScreen from './components/DisplayScreen';
import RegistrationKiosk from './components/RegistrationKiosk';
import BoxConsole from './components/BoxConsole';
import AdminPanel from './components/AdminPanel';
import ExternalWindow from './components/ExternalWindow';
import { AppView } from './types';
import { Monitor, User, Settings, LayoutGrid, MonitorPlay, ChevronRight, Play, Sun, Moon } from 'lucide-react';

function App() {
  const { 
    state, addTicket, callNextTicket, updateTickerLine, updateTickerMode, updateRssFeed, updateClockConfig, updateSlides, addSlide, removeSlide, updateImagePlaylist, updateDisplayMap, updateVideoPlaylist, getWaitingList, getCalledList 
  } = useQueue();
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showExternalDisplay, setShowExternalDisplay] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Efecto para manejar la clase 'dark' en el HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const renderMainView = () => {
    switch (currentView) {
      case AppView.DISPLAY:
        return <DisplayScreen calledTickets={getCalledList()} tickerLines={state.tickerLines} tickerMode={state.tickerMode} slides={state.slides} rssFeeds={state.rssFeeds} clockConfig={state.clockConfig} imagePlaylist={state.imagePlaylist} displayMode={state.displayMode} mapUrl={state.mapUrl} videoPlaylist={state.videoPlaylist} onBack={() => setCurrentView(AppView.HOME)} />;
      case AppView.REGISTRATION:
        return <RegistrationKiosk onRegister={addTicket} onBack={() => setCurrentView(AppView.HOME)} />;
      case AppView.OPERATOR:
        return <BoxConsole waitingTickets={getWaitingList()} onCallNext={callNextTicket} onBack={() => setCurrentView(AppView.HOME)} />;
      case AppView.ADMIN:
        return <AdminPanel tickerLines={state.tickerLines} tickerMode={state.tickerMode} slides={state.slides} rssFeeds={state.rssFeeds} clockConfig={state.clockConfig} onUpdateTickerLine={updateTickerLine} onUpdateTickerMode={updateTickerMode} onUpdateRssFeed={updateRssFeed} onUpdateClockConfig={updateClockConfig} onUpdateSlides={updateSlides} onAddSlide={addSlide} onRemoveSlide={removeSlide} onUpdateImagePlaylist={updateImagePlaylist} onUpdateMap={updateDisplayMap} onUpdateVideoPlaylist={updateVideoPlaylist} onBack={() => setCurrentView(AppView.HOME)} />;
      default:
        return (
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans transition-colors duration-500">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-600/5 dark:bg-emerald-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Dark Mode Switch */}
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/50 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white hover:scale-110 transition-all shadow-lg"
            >
                {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            <div className="z-10 text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
                        <LayoutGrid className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-4 transition-colors">
                    DigiTurno<span className="text-indigo-600 dark:text-indigo-500">AI</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium transition-colors">
                    Sistema integral de gestión de turnos potenciado por Inteligencia Artificial.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                {/* Main Display Card */}
                <button 
                    onClick={() => setCurrentView(AppView.DISPLAY)} 
                    className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2rem] text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20 col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2 flex flex-col justify-between min-h-[320px] border border-white/10"
                >
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-white/10" />
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white border border-white/10 shadow-inner group-hover:bg-white/20 transition-all">
                            <Monitor className="w-7 h-7" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-3">Pantalla TV</h3>
                        <p className="text-indigo-100/80 font-medium leading-relaxed text-sm">
                            Vista principal para el público. Visualización de turnos, contenido multimedia y noticias en tiempo real.
                        </p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest bg-black/20 self-start px-4 py-2 rounded-full backdrop-blur-sm group-hover:bg-white/20 transition-all">
                        Abrir Vista <Play className="w-3 h-3 fill-current" />
                    </div>
                </button>

                {/* Lab Screen (External) */}
                <button 
                    onClick={() => setShowExternalDisplay(!showExternalDisplay)}
                    className={`group p-8 rounded-[2rem] border text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-full relative overflow-hidden ${
                        showExternalDisplay 
                        ? 'bg-emerald-600 dark:bg-emerald-900 border-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-800 shadow-lg shadow-emerald-500/20' 
                        : 'bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-emerald-900/40 dark:to-emerald-950/40 border-slate-200 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:from-emerald-900/60 dark:hover:to-emerald-800/60 dark:hover:border-emerald-500/40 shadow-sm hover:shadow-md'
                    }`}
                >
                    <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all border ${
                            showExternalDisplay 
                            ? 'bg-emerald-500 text-white shadow-lg border-emerald-400' 
                            : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                        }`}>
                            <MonitorPlay className="w-6 h-6" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${showExternalDisplay ? 'text-white' : 'text-slate-800 dark:text-white'}`}>Segunda Pantalla</h3>
                        <p className={`text-sm font-medium ${showExternalDisplay ? 'text-emerald-100' : 'text-slate-500 dark:text-emerald-100/60'}`}>
                            {showExternalDisplay ? 'Ventana externa activa.' : 'Abrir ventana emergente para monitores extendidos.'}
                        </p>
                    </div>
                    {showExternalDisplay && (
                        <div className="absolute top-6 right-6 flex items-center gap-2">
                             <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>
                    )}
                </button>

                {/* Operator Console */}
                <button 
                    onClick={() => setCurrentView(AppView.OPERATOR)} 
                    className="group p-8 rounded-[2rem] border border-slate-200 dark:border-violet-500/20 bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-violet-900/40 dark:to-violet-950/40 hover:border-violet-300 dark:hover:from-violet-900/60 dark:hover:to-violet-800/60 dark:hover:border-violet-500/40 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-full backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                    <div>
                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/50 rounded-2xl flex items-center justify-center mb-4 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-500/30 shadow-inner">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Consola Operador</h3>
                        <p className="text-slate-500 dark:text-violet-100/60 text-sm font-medium">
                            Panel de control para llamar turnos y gestionar la fila.
                        </p>
                    </div>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ChevronRight className="w-5 h-5 text-violet-500 dark:text-violet-300" />
                    </div>
                </button>

                {/* Registration Kiosk */}
                <button 
                    onClick={() => setCurrentView(AppView.REGISTRATION)} 
                    className="group p-8 rounded-[2rem] border border-slate-200 dark:border-pink-500/20 bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-pink-900/40 dark:to-pink-950/40 hover:border-pink-300 dark:hover:from-pink-900/60 dark:hover:to-pink-800/60 dark:hover:border-pink-500/40 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-full backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                    <div>
                        <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-2xl flex items-center justify-center mb-4 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-500/30 shadow-inner">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Kiosco Registro</h3>
                        <p className="text-slate-500 dark:text-pink-100/60 text-sm font-medium">
                            Interfaz táctil para auto-registro de clientes en la entrada.
                        </p>
                    </div>
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ChevronRight className="w-5 h-5 text-pink-500 dark:text-pink-300" />
                    </div>
                </button>

                {/* Admin Settings */}
                <button 
                    onClick={() => setCurrentView(AppView.ADMIN)} 
                    className="group p-8 rounded-[2rem] border border-slate-200 dark:border-cyan-500/20 bg-white dark:bg-transparent dark:bg-gradient-to-br dark:from-cyan-900/40 dark:to-cyan-950/40 hover:border-cyan-300 dark:hover:from-cyan-900/60 dark:hover:to-cyan-800/60 dark:hover:border-cyan-500/40 text-left transition-all hover:scale-[1.02] flex flex-col justify-between h-full backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-2xl flex items-center justify-center mb-4 text-cyan-600 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30 shadow-inner">
                                <Settings className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Configuración</h3>
                            <p className="text-slate-500 dark:text-cyan-100/60 text-sm font-medium">
                                Ajustes del sistema AI.
                            </p>
                        </div>
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 self-end">
                             <Settings className="w-5 h-5 text-cyan-500 dark:text-cyan-300" />
                        </div>
                    </div>
                </button>
            </div>

            <div className="mt-16 text-slate-500 dark:text-slate-600 text-xs font-bold uppercase tracking-widest animate-in fade-in duration-1000 delay-300 transition-colors">
                v3.0.0 • Powered by Google Gemini
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
          <DisplayScreen calledTickets={getCalledList()} tickerLines={state.tickerLines} tickerMode={state.tickerMode} slides={state.slides} rssFeeds={state.rssFeeds} clockConfig={state.clockConfig} imagePlaylist={state.imagePlaylist} displayMode={state.displayMode} mapUrl={state.mapUrl} videoPlaylist={state.videoPlaylist} onBack={() => setShowExternalDisplay(false)} />
        </ExternalWindow>
      )}
    </>
  );
}

export default App;
