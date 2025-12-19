import React, { useState, useRef, useEffect } from 'react';
import { sheetsApi } from './services/sheetsApi';
import { ServiceType } from '../types';
import { UserPlus, ClipboardList, Delete, ChevronLeft, User, Hash } from 'lucide-react';

interface RegistrationKioskProps {
  onRegister: (name: string, service: ServiceType, idNum: string) => void;
  onBack: () => void;
}

const RegistrationKiosk: React.FC<RegistrationKioskProps> = ({ onRegister, onBack }) => {
  const [name, setName] = useState('');
  const [idNum, setIdNum] = useState('');
  const [service, setService] = useState<ServiceType>('General');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<'id' | 'name'>('id');
  
  const idInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (idInputRef.current) {
      idInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async () => {
    if (!name || !idNum) return;

    // 1. Efecto visual inmediato para el usuario
    console.log("Iniciando registro para:", name);

    try {
      // 2. Envío a Google Sheets
      // Usamos el estado 'service' que el usuario eligió en los botones
      await sheetsApi.addTicket(name, service);
      
      // 3. Si llegamos aquí, mostramos pantalla de éxito
      setSubmitted(name);
      onRegister(name, service, idNum);

      // 4. Resetear el kiosko después de 3 segundos para el siguiente cliente
      setTimeout(() => {
        setSubmitted(null);
        setName('');
        setIdNum('');
        setService('General');
        setActiveField('id');
        setTimeout(() => {
          idInputRef.current?.focus();
        }, 100);
      }, 3000);

    } catch (error) {
      console.error("Error en el envío:", error);
      alert("Error de conexión. Por favor intente de nuevo.");
    }
  };

  const handleVirtualKey = (key: string) => {
    if (activeField === 'id') {
      if (key === 'DEL') setIdNum(prev => prev.slice(0, -1));
      else if (key === 'CLR') setIdNum('');
      else if (idNum.length < 15) setIdNum(prev => prev + key);
    } else {
      if (key === 'DEL') setName(prev => prev.slice(0, -1));
      else if (key === 'SPACE') setName(prev => prev + ' ');
      else setName(prev => (prev + key).toUpperCase());
    }
  };

  const numPad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'DEL'];
  const alphaRows = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L','Ñ'],
    ['Z','X','C','V','B','N','M']
  ];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-emerald-50 text-emerald-900 p-8 animate-in fade-in zoom-in duration-300">
        <div className="bg-white p-16 rounded-[3rem] shadow-2xl text-center border-4 border-emerald-100 max-w-2xl w-full">
          <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce">
            <ClipboardList className="w-16 h-16 text-emerald-600" />
          </div>
          <h2 className="text-5xl font-black mb-6 text-emerald-800">¡Registro Exitoso!</h2>
          <p className="text-3xl font-medium text-emerald-700/80 mb-8">Gracias {submitted}, tome su turno.</p>
          <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-[width_3s_linear_forwards]" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="bg-white px-8 py-4 shadow-sm flex items-center justify-between z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all font-bold text-lg">
          <ChevronLeft className="w-5 h-5" /> Volver
        </button>
        <div className="flex items-center gap-2 text-indigo-600">
          <UserPlus className="w-6 h-6" />
          <span className="text-xl font-black tracking-tight uppercase">AUTO REGISTRO</span>
        </div>
        <div className="w-24"></div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden h-[calc(100vh-80px)]">
        <div className="w-1/2 bg-white rounded-[2rem] shadow-xl border border-slate-200 p-8 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col gap-6">
            <div 
              className={`transition-all duration-200 p-6 rounded-2xl border-2 cursor-pointer ${activeField === 'id' ? 'bg-indigo-50/50 border-indigo-500 shadow-lg' : 'bg-white border-slate-200'}`}
              onClick={() => setActiveField('id')}
            >
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">1. Identificación</label>
              <input 
                ref={idInputRef}
                type="text" 
                value={idNum} 
                readOnly 
                className="w-full bg-transparent text-6xl font-black text-slate-900 outline-none"
                placeholder="---"
              />
            </div>
            
            <div 
              className={`transition-all duration-200 p-6 rounded-2xl border-2 cursor-pointer ${activeField === 'name' ? 'bg-indigo-50/50 border-indigo-500 shadow-lg' : 'bg-white border-slate-200'}`}
              onClick={() => setActiveField('name')}
            >
              <label className="block text-sm font-bold text-slate-500 uppercase mb-2">2. Nombre Completo</label>
              <input 
                ref={nameInputRef}
                type="text" 
                value={name} 
                readOnly 
                className="w-full bg-transparent text-5xl font-black text-slate-900 outline-none uppercase"
                placeholder="SU NOMBRE"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-500 uppercase mb-4">3. Servicio</label>
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setService('General')}
                  className={`rounded-2xl border-2 font-bold text-2xl p-6 transition-all ${service === 'General' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  Consulta General
                </button>
                <button
                  type="button"
                  onClick={() => setService('Commercial')}
                  className={`rounded-2xl border-2 font-bold text-2xl p-6 transition-all ${service === 'Commercial' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}
                >
                  Asesor Comercial
                </button>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!name || !idNum}
            className={`w-full py-8 mt-4 rounded-2xl font-black text-3xl uppercase transition-all shadow-xl ${(!name || !idNum) ? 'bg-slate-200 text-slate-400' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
          >
            OBTENER TURNO
          </button>
        </div>

        <div className="w-1/2 bg-slate-200 rounded-[2rem] p-6 flex flex-col shadow-inner">
          <div className="flex-1 flex items-center justify-center">
            {activeField === 'name' ? (
              <User className="w-48 h-48 text-slate-400" strokeWidth={1} />
            ) : (
              <Hash className="w-48 h-48 text-slate-400" strokeWidth={1} />
            )}
          </div>

          <div className="mt-4">
            {activeField === 'id' ? (
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                {numPad.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleVirtualKey(key)}
                    className="h-24 rounded-3xl bg-white shadow-md text-4xl font-black text-slate-700 hover:bg-slate-50 active:translate-y-1 transition-all"
                  >
                    {key === 'DEL' ? '←' : key}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alphaRows.map((row, i) => (
                  <div key={i} className="flex gap-2 justify-center">
                    {row.map(char => (
                      <button
                        key={char}
                        onClick={() => handleVirtualKey(char)}
                        className="flex-1 h-20 bg-white rounded-xl shadow-md text-3xl font-black text-slate-700 hover:bg-slate-50"
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="flex gap-3 mt-2">
                  <button onClick={() => handleVirtualKey('SPACE')} className="flex-[4] h-20 bg-white rounded-xl shadow-md text-xl font-bold text-slate-400">ESPACIO</button>
                  <button onClick={() => handleVirtualKey('DEL')} className="flex-1 h-20 bg-red-100 rounded-xl shadow-md text-red-500 font-bold">BORRAR</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationKiosk;
