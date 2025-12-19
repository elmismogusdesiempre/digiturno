import { sheetsApi.ts } from '../services/sheetsApi';
import React, { useState, useEffect } from 'react';
import { useQueue } from './hooks/useQueue';
import DisplayScreen from './components/DisplayScreen';
import RegistrationKiosk from './components/RegistrationKiosk';
import BoxConsole from './components/BoxConsole';
import AdminPanel from './components/AdminPanel';
import ExternalWindow from './components/ExternalWindow';
import { AppView } from './types';
import { Monitor, MonitorPlay, User, Settings, LayoutGrid } from 'lucide-react';

function App() {
  const {
    state,
    addTicket,
    callNextTicket,
    updateTickerLine,
    updateTickerMode,
    updateRssFeed,
    updateClockConfig,
    updateSlides,
    addSlide,
    removeSlide,
    updateImagePlaylist,
    updateDisplayMap,
    updateVideoPlaylist,
    getWaitingList,
    getCalledList,
  } = useQueue();

  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showExternalDisplay, setShowExternalDisplay] = useState(false);

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
        return <RegistrationKiosk onRegister={addTicket} onBack={() => setCurrentView(AppView.HOME)} />;

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
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
            <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-10">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center">
                  <LayoutGrid className="text-white" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900">
                  DigiTurno<span className="text-indigo-600">AI</span>
                </h1>
                <p className="text-slate-500 mt-2">
                  Sistema integral de gestión de turnos potenciado por Inteligencia Artificial.
                </p>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pantalla TV */}
                <button
                  onClick={() => setCurrentView(AppView.DISPLAY)}
                  className="md:row-span-2 flex flex-col justify-between rounded-2xl p-8 text-left bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg hover:scale-[1.01] transition"
                >
                  <div>
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                      <Monitor />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pantalla TV</h3>
                    <p className="text-indigo-100 text-sm">
                      Vista principal para el público. Visualización de turnos, contenido multimedia y noticias.
                    </p>
                  </div>
                  <span className="mt-6 inline-block bg-white/20 px-4 py-2 rounded-full text-xs font-semibold">
                    Abrir vista
                  </span>
                </button>

                {/* Segunda pantalla */}
                <button
                  onClick={() => setShowExternalDisplay(true)}
                  className="rounded-2xl p-6 bg-slate-50 border hover:shadow-md transition text-left"
                >
                  <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                    <MonitorPlay />
                  </div>
                  <h3 className="font-semibold">Segunda Pantalla</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Abrir ventana emergente para monitores extendidos.
                  </p>
                </button>

                {/* Consola operador */}
                <button
                  onClick={() => setCurrentView(AppView.OPERATOR)}
                  className="rounded-2xl p-6 bg-slate-50 border hover:shadow-md transition text-left"
                >
                  <div className="w-9 h-9 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-3">
                    <LayoutGrid />
                  </div>
                  <h3 className="font-semibold">Consola Operador</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Panel de control para llamar turnos y gestionar la fila.
                  </p>
                </button>

                {/* Kiosco */}
                <button
                  onClick={() => setCurrentView(AppView.REGISTRATION)}
                  className="rounded-2xl p-6 bg-slate-50 border hover:shadow-md transition text-left"
                >
                  <div className="w-9 h-9 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-3">
                    <User />
                  </div>
                  <h3 className="font-semibold">Kiosco Registro</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Interfaz táctil para auto-registro de clientes.
                  </p>
                </button>

                {/* Configuración */}
                <button
                  onClick={() => setCurrentView(AppView.ADMIN)}
                  className="rounded-2xl p-6 bg-slate-50 border hover:shadow-md transition text-left"
                >
                  <div className="w-9 h-9 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-3">
                    <Settings />
                  </div>
                  <h3 className="font-semibold">Configuración</h3>
                  <p className="text-sm text-slate-500 mt-1">Ajustes del sistema AI.</p>
                </button>
              </div>
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
