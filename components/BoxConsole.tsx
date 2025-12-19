import React, { useState, useEffect } from 'react';
import { Ticket, MAX_BOXES } from '../types';
import { Monitor, ArrowRight, UserCheck, Clock } from 'lucide-react';

// Reemplaza con tu URL real
const API_URL = "https://script.google.com/macros/s/AKfycbweqXCiIR8joddOa0rGZwQ4NPCMtn47clC89um3HIYLBC_amJOe7tQwKX4cs_5PugdF/exec";

interface BoxConsoleProps {
  onBack: () => void;
}

const BoxConsole: React.FC<BoxConsoleProps> = ({ onBack }) => {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([]);
  const [isCalling, setIsCalling] = useState(false);

  // 1. Sincronizar la lista de espera con el Excel cada 5 segundos
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch(`${API_URL}?sheet=queue`);
        const data = await response.json();
        if (Array.isArray(data)) {
          // Filtramos solo los que están en estado 'espera'
          const pending = data
            .filter((item: any) => item.estado === 'espera')
            .map((item: any) => ({
              id: String(item.id),
              number: String(item.id),
              customerName: item.nombre,
              service: item.servicio,
              timestamp: item.created_at
            }));
          setWaitingTickets(pending);
        }
      } catch (error) {
        console.error("Error cargando cola:", error);
      }
    };

    if (selectedBox) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedBox]);

  // 2. Función para llamar al siguiente cliente
  const handleCallNext = async (boxId: number) => {
    if (waitingTickets.length === 0 || isCalling) return;

    setIsCalling(true);
    try {
      await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          action: 'CALL_NEXT',
          boxId: boxId
        })
      });
      
      // Pequeña pausa para que el Excel procese antes de refrescar la lista local
      setTimeout(() => setIsCalling(false), 2000);
    } catch (error) {
      console.error("Error al llamar:", error);
      setIsCalling(false);
    }
  };

  if (selectedBox === null) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <button onClick={onBack} className="mb-6 text-slate-500 hover:text-slate-900 font-bold">← Volver al Menú</button>
        <h1 className="text-3xl font-bold text-slate-800 mb-8 tracking-tight">Seleccione su Módulo de Atención</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: MAX_BOXES }, (_, i) => i + 1).map(boxId => (
            <button
              key={boxId}
              onClick={() => setSelectedBox(boxId)}
              className="aspect-square bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:scale-105 transition-all border-2 border-transparent hover:border-indigo-500 flex flex-col items-center justify-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                <Monitor className="w-10 h-10 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <span className="text-2xl font-black text-slate-700 group-hover:text-indigo-900">MÓDULO {boxId}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const nextTicket = waitingTickets[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-200">
            {selectedBox}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Consola de Operador</h2>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-slate-500 text-sm font-bold">Módulo {selectedBox} Activo</p>
            </div>
          </div>
        </div>
        <button onClick={() => setSelectedBox(null)} className="px-6 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold rounded-xl transition-colors">
          Cambiar Módulo
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        
        {/* Left: Action Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Panel de Control</h3>
            
            <div className="flex items-center justify-around mb-12">
              <div className="text-center">
                  <div className="text-6xl font-black text-indigo-600 mb-1">{waitingTickets.length}</div>
                  <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">En Espera</div>
              </div>
              <div className="h-16 w-px bg-slate-100"></div>
              <div className="text-center">
                  <div className="text-6xl font-black text-slate-800 mb-1">~{waitingTickets.length * 5}m</div>
                  <div className="text-slate-400 font-bold uppercase text-xs tracking-widest">Est. Espera</div>
              </div>
            </div>

            <button
              onClick={() => handleCallNext(selectedBox)}
              disabled={waitingTickets.length === 0 || isCalling}
              className={`w-full py-10 rounded-3xl flex items-center justify-center gap-6 text-4xl font-black transition-all transform active:scale-95 ${
                waitingTickets.length === 0 || isCalling
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-500/40'
              }`}
            >
              <span>{isCalling ? 'LLAMANDO...' : waitingTickets.length === 0 ? 'SIN CLIENTES' : 'SIGUIENTE'}</span>
              {!isCalling && <ArrowRight className="w-12 h-12" />}
            </button>
          </div>

          {/* Next Up Preview */}
          {nextTicket && (
            <div className="bg-white border-2 border-indigo-500/20 p-8 rounded-[2rem] flex justify-between items-center shadow-lg shadow-indigo-500/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                <div>
                  <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">Próximo en Fila</p>
                  <h4 className="text-3xl font-black text-slate-900 uppercase">{nextTicket.customerName}</h4>
                </div>
                <div className="text-5xl font-black text-indigo-100 tracking-tighter">
                  #{nextTicket.number}
                </div>
            </div>
          )}
        </div>

        {/* Right: Waiting List */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-[650px] overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-sm">Cola de Turnos</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
             {waitingTickets.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-300">
                 <UserCheck className="w-16 h-16 mb-4 opacity-10" />
                 <p className="font-bold uppercase text-xs tracking-widest">No hay pendientes</p>
               </div>
             ) : (
               waitingTickets.map((t, idx) => (
                 <div key={t.id} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-lg transition-all flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 font-black rounded-xl text-sm">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-black text-slate-900 text-lg tracking-tight">{t.number}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-32">{t.customerName}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${t.service === 'Commercial' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.service === 'Commercial' ? 'Comercial' : 'General'}
                    </span>
                 </div>
               ))
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default BoxConsole;
