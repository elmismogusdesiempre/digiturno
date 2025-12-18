import React, { useState } from 'react';
import { Ticket, MAX_BOXES } from '../types';
import { Monitor, ArrowRight, UserCheck, Clock } from 'lucide-react';

interface BoxConsoleProps {
  waitingTickets: Ticket[];
  onCallNext: (boxId: number) => void;
  onBack: () => void;
}

const BoxConsole: React.FC<BoxConsoleProps> = ({ waitingTickets, onCallNext, onBack }) => {
  const [selectedBox, setSelectedBox] = useState<number | null>(null);

  if (selectedBox === null) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <button onClick={onBack} className="mb-6 text-slate-500 hover:text-slate-900">← Volver al Menú</button>
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Seleccione su Módulo</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: MAX_BOXES }, (_, i) => i + 1).map(boxId => (
            <button
              key={boxId}
              onClick={() => setSelectedBox(boxId)}
              className="aspect-square bg-white rounded-2xl shadow-sm hover:shadow-xl hover:scale-105 transition-all border border-slate-200 flex flex-col items-center justify-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                <Monitor className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <span className="text-xl font-bold text-slate-600 group-hover:text-indigo-900">MÓDULO {boxId}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const nextTicket = waitingTickets[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            {selectedBox}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Consola de Operador</h2>
            <p className="text-slate-500 text-xs">Conectado en Módulo {selectedBox}</p>
          </div>
        </div>
        <button onClick={() => setSelectedBox(null)} className="text-sm text-red-500 hover:text-red-700 font-medium">
          Cerrar Sesión
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        
        {/* Left: Action Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Estado de la Fila</h3>
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">{waitingTickets.length}</div>
                  <div className="text-slate-500 text-sm">Clientes en Espera</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">~5m</div>
                  <div className="text-slate-500 text-sm">Tiempo Promedio</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onCallNext(selectedBox)}
              disabled={waitingTickets.length === 0}
              className={`w-full py-6 rounded-xl flex items-center justify-center gap-4 text-2xl font-bold transition-all ${
                waitingTickets.length === 0 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
              }`}
            >
              <span>{waitingTickets.length === 0 ? 'Fila Vacía' : 'Llamar Siguiente'}</span>
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>

          {/* Next Up Preview */}
          {nextTicket && (
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl flex justify-between items-center">
               <div>
                 <p className="text-indigo-600 font-medium text-sm mb-1">Siguiente</p>
                 <h4 className="text-xl font-bold text-indigo-900">{nextTicket.customerName}</h4>
                 <span className="inline-block mt-2 px-2 py-1 bg-white text-indigo-600 text-xs font-bold rounded">
                    {nextTicket.service === 'Commercial' ? 'Asesor Comercial' : 'Consulta General'}
                 </span>
               </div>
               <div className="text-3xl font-black text-indigo-300">
                 {nextTicket.number}
               </div>
            </div>
          )}
        </div>

        {/* Right: Waiting List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Lista de Espera (FIFO)</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {waitingTickets.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <UserCheck className="w-12 h-12 mb-2 opacity-20" />
                 <p>No hay clientes en espera</p>
               </div>
             ) : (
               waitingTickets.map((t, idx) => (
                 <div key={t.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-600 font-bold rounded-full text-xs">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-800">{t.number}</p>
                        <p className="text-xs text-slate-500">{t.customerName}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${t.service === 'Commercial' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
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