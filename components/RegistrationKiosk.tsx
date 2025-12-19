import React, { useState, useRef, useEffect } from 'react';
import { sheetsApi } from './services/sheetsApi';
import { UserPlus, ClipboardList, Delete, ChevronLeft, User, Hash } from 'lucide-react';

interface RegistrationKioskProps {
  onRegister: (name: string, service: any, idNum: string) => void;
  onBack: () => void;
}

const RegistrationKiosk: React.FC<RegistrationKioskProps> = ({ onRegister, onBack }) => {
  const [name, setName] = useState('');
  const [idNum, setIdNum] = useState('');
  const [service, setService] = useState('General');
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<'id' | 'name'>('id');
  
  const idInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    idInputRef.current?.focus();
  }, []);

  // FUNCIÓN DE ENVÍO CORREGIDA
  const ejecutarEnvio = async () => {
    console.log("Botón presionado. Datos:", { name, idNum, service });
    
    // Si los campos están vacíos por error de teclado, mandamos un genérico para probar
    const nombreFinal = name || "ANONIMO";
    const idFinal = idNum || "000";

    try {
      // Intentamos el envío
      await sheetsApi.addTicket(nombreFinal, service);
      
      // Si llegamos aquí, mostramos éxito en pantalla
      setSubmitted(nombreFinal);
      onRegister(nombreFinal, service as any, idFinal);

      // Reset automático en 3 segundos
      setTimeout(() => {
        setSubmitted(null);
        setName('');
        setIdNum('');
        setActiveField('id');
      }, 3000);

    } catch (error) {
      alert("Error enviando datos: " + error);
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
  const alphaRows = [['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L','Ñ'],['Z','X','C','V','B','N','M']];

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-emerald-50 p-8">
        <div className="bg-white p-16 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full">
          <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-10">
            <ClipboardList className="w-16 h-16 text-emerald-600" />
          </div>
          <h2 className="text-5xl font-black mb-6 text-emerald-800">¡REGISTRADO!</h2>
          <p className="text-2xl text-emerald-700">Espere su turno en la pantalla.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="bg-white px-8 py-4 shadow flex items-center justify-between">
        <button onClick={onBack} className="text-slate-500 font-bold flex items-center gap-2">
          <ChevronLeft /> Volver
        </button>
        <div className="flex items-center gap-2 text-indigo-600 font-black">
          <UserPlus /> AUTO REGISTRO
        </div>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* IZQUIERDA: FORMULARIO */}
        <div className="w-1/2 bg-white rounded-[2rem] p-8 shadow-xl flex flex-col">
          <div className="space-y-6 flex-1">
            <div onClick={() => setActiveField('id')} className={`p-6 rounded-2xl border-2 ${activeField === 'id' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100'}`}>
              <label className="text-xs font-bold text-slate-400 uppercase">1. Identificación</label>
              <input ref={idInputRef} value={idNum} readOnly className="w-full text-5xl font-black bg-transparent outline-none" />
            </div>

            <div onClick={() => setActiveField('name')} className={`p-6 rounded-2xl border-2 ${activeField === 'name' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100'}`}>
              <label className="text-xs font-bold text-slate-400 uppercase">2. Nombre</label>
              <input ref={nameInputRef} value={name} readOnly className="w-full text-4xl font-black bg-transparent outline-none uppercase" />
            </div>

            <div className="flex flex-col gap-4">
               <button onClick={() => setService('General')} className={`p-6 rounded-2xl font-bold text-xl border-2 ${service === 'General' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}>Consulta General</button>
               <button onClick={() => setService('Commercial')} className={`p-6 rounded-2xl font-bold text-xl border-2 ${service === 'Commercial' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white'}`}>Asesor Comercial</button>
            </div>
          </div>

          <button 
            type="button" 
            onClick={ejecutarEnvio}
            className="w-full py-8 mt-6 bg-emerald-500 text-white rounded-2xl font-black text-3xl shadow-lg hover:bg-emerald-600 active:scale-95 transition-all"
          >
            OBTENER TURNO
          </button>
        </div>

        {/* DERECHA: TECLADO */}
        <div className="w-1/2 bg-slate-200 rounded-[2rem] p-6 flex flex-col">
           <div className="flex-1 flex items-center justify-center text-slate-400">
              {activeField === 'id' ? <Hash size={100} /> : <User size={100} />}
           </div>
           <div className="grid grid-cols-3 gap-3">
              {activeField === 'id' ? 
                numPad.map(k => <button key={k} onClick={() => handleVirtualKey(k)} className="h-20 bg-white rounded-xl text-3xl font-black shadow-sm">{k}</button>) :
                <div className="col-span-3 flex flex-col gap-2">
                   {alphaRows.map((r, i) => <div key={i} className="flex gap-2 justify-center">{r.map(c => <button key={c} onClick={() => handleVirtualKey(c)} className="flex-1 h-16 bg-white rounded-lg font-bold">{c}</button>)}</div>)}
                   <div className="flex gap-2"><button onClick={() => handleVirtualKey('SPACE')} className="flex-[3] h-16 bg-white rounded-lg font-bold">ESPACIO</button><button onClick={() => handleVirtualKey('DEL')} className="flex-1 h-16 bg-red-100 text-red-500 rounded-lg font-bold">BORRAR</button></div>
                </div>
              }
           </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationKiosk;
