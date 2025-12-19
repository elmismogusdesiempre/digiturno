const API_URL = "https://script.google.com/macros/s/AKfycbweqXCiIR8joddOa0rGZwQ4NPCMtn47clC89um3HIYLBC_amJOe7tQwKX4cs_5PugdF/exec";
import React, { useState, useRef, useEffect } from 'react';
import { ServiceType } from '../types';
import { UserPlus, ClipboardList, Delete, X, ChevronLeft, User, Hash } from 'lucide-react';

interface RegistrationKioskProps {
  onRegister: (name: string, service: ServiceType, idNum: string) => void;
  onBack: () => void;
}

const RegistrationKiosk: React.FC<RegistrationKioskProps> = ({ onRegister, onBack }) => {
  const [name, setName] = useState('');
  const [idNum, setIdNum] = useState('');
  const [service, setService] = useState<ServiceType>('General');
  const [submitted, setSubmitted] = useState<string | null>(null);
  
  // Estado para saber qué campo se está editando ('id' o 'name') para mostrar el teclado correcto
  const [activeField, setActiveField] = useState<'id' | 'name'>('id');
  
  // Referencias para manejar el foco
  const idInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Auto-foco inicial
  useEffect(() => {
    if (idInputRef.current) {
        idInputRef.current.focus();
    }
  }, []);

  const [isRegistering, setIsRegistering] = useState(false); // Nuevo estado



  
const handleSubmit = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  if (!name || !idNum || isRegistering) return;

  setIsRegistering(true); // Bloqueamos el botón

  try {
    // 1. Enviamos los datos al Excel
    const response = await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors', // Importante para evitar bloqueos de CORS en el envío
      body: JSON.stringify({
        action: 'REGISTER_CLIENT',
        data: {
          nombre: name,
          servicio: service,
          tipo: 'Normal' // Puedes cambiarlo si manejas prioridades
        }
      })
    });

    // 2. Dado que 'no-cors' no nos permite leer la respuesta directamente por seguridad,
    // vamos a pedir el ID actualizado haciendo un pequeño fetch rápido o calculándolo.
    // OPTIMIZACIÓN: Como el Excel es la fuente de verdad, la pantalla mostrará el número real.
    
    // Por ahora, simularemos el éxito para la UI del cliente:
    setSubmitted("PROCESANDO..."); 

    // 3. Ejecutamos la función original de props por si acaso
    onRegister(name, service, idNum);

    // Resetear después del éxito
    setTimeout(() => {
      setSubmitted(null);
      setName('');
      setIdNum('');
      setService('General');
      setActiveField('id');
      setIsRegistering(false);
      setTimeout(() => {
        if (idInputRef.current) idInputRef.current.focus();
      }, 100);
    }, 4000);

  } catch (error) {
    console.error("Error al registrar:", error);
    alert("Hubo un problema de conexión. Intente nuevamente.");
    setIsRegistering(false);
  }
};


  

  const handleVirtualKey = (key: string) => {
    if (activeField === 'id') {
        if (key === 'DEL') setIdNum(prev => prev.slice(0, -1));
        else if (key === 'CLR') setIdNum('');
        else if (idNum.length < 15) setIdNum(prev => prev + key);
        // Mantener foco
        idInputRef.current?.focus();
    } else {
        if (key === 'DEL') setName(prev => prev.slice(0, -1));
        else if (key === 'SPACE') setName(prev => prev + ' ');
        else setName(prev => prev + key);
        // Mantener foco
        nameInputRef.current?.focus();
    }
  };

  // Teclados Virtuales
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
          <p className="text-3xl font-medium text-emerald-700/80 mb-8">Por favor tome asiento.</p>
          <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500 animate-[width_3s_linear_forwards]" style={{width: '0%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header Simplificado */}
      <div className="bg-white px-8 py-4 shadow-sm flex items-center justify-between z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all font-bold text-lg">
            <ChevronLeft className="w-5 h-5" /> Volver
        </button>
        <div className="flex items-center gap-2 text-indigo-600">
            <UserPlus className="w-6 h-6" />
            <span className="text-xl font-black tracking-tight uppercase">AUTO REGISTRO</span>
        </div>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      <div className="flex-1 flex gap-6 p-6 overflow-hidden h-[calc(100vh-80px)]">
        
        {/* LADO IZQUIERDO: FORMULARIO */}
        <div className="w-1/2 bg-white rounded-[2rem] shadow-xl border border-slate-200 p-8 flex flex-col overflow-y-auto relative">
            <div className="flex-1 flex flex-col gap-6">
                
                {/* Campo Identificación */}
                <div 
                    className={`transition-all duration-200 p-6 rounded-2xl border-2 cursor-pointer ${activeField === 'id' ? 'bg-indigo-50/50 border-indigo-500 shadow-lg ring-4 ring-indigo-50' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    onClick={() => { setActiveField('id'); idInputRef.current?.focus(); }}
                >
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">1. Número de Identificación</label>
                    <input 
                        ref={idInputRef}
                        type="text" 
                        value={idNum} 
                        onChange={e => setIdNum(e.target.value)}
                        onFocus={() => setActiveField('id')}
                        className="w-full bg-transparent text-6xl font-black text-slate-900 outline-none placeholder:text-slate-200 tracking-wider"
                        placeholder="123"
                        readOnly={true} 
                    />
                </div>
                
                {/* Campo Nombre */}
                <div 
                    className={`transition-all duration-200 p-6 rounded-2xl border-2 cursor-pointer ${activeField === 'name' ? 'bg-indigo-50/50 border-indigo-500 shadow-lg ring-4 ring-indigo-50' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                    onClick={() => { setActiveField('name'); nameInputRef.current?.focus(); }}
                >
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">2. Nombre Completo</label>
                    <input 
                        ref={nameInputRef}
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        onFocus={() => setActiveField('name')}
                        className="w-full bg-transparent text-5xl font-black text-slate-900 outline-none placeholder:text-slate-200 uppercase truncate"
                        placeholder="SU NOMBRE"
                        readOnly={true}
                    />
                </div>

                {/* Selección Servicio */}
                <div className="flex-1">
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">3. Tipo de Servicio</label>
                    <div className="flex flex-col gap-4">
                        <button
                        type="button"
                        onClick={() => setService('General')}
                        className={`rounded-2xl border-2 font-bold text-2xl p-6 transition-all flex items-center justify-start shadow-sm ${service === 'General' ? 'border-indigo-600 bg-indigo-600 text-white shadow-indigo-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                        Consulta General
                        </button>
                        <button
                        type="button"
                        onClick={() => setService('Commercial')}
                        className={`rounded-2xl border-2 font-bold text-2xl p-6 transition-all flex items-center justify-start shadow-sm ${service === 'Commercial' ? 'border-indigo-600 bg-indigo-600 text-white shadow-indigo-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                        Asesor Comercial
                        </button>
                    </div>
                </div>
            </div>

            <button 
            type="submit" 
            onClick={() => handleSubmit()}
            disabled={!name || !idNum}
            className={`w-full py-6 mt-4 rounded-2xl font-black text-3xl uppercase tracking-widest transition-all shadow-xl ${(!name || !idNum) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-[1.02] hover:shadow-emerald-500/50'}`}
            >

              <button 
  type="submit" 
  onClick={() => handleSubmit()}
  disabled={!name || !idNum || isRegistering} // Añadido isRegistering
  className={`w-full py-6 mt-4 rounded-2xl font-black text-3xl uppercase tracking-widest transition-all shadow-xl ${
    (!name || !idNum || isRegistering) 
      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
      : 'bg-emerald-500 text-white shadow-emerald-500/30 hover:bg-emerald-600'
  }`}
>
  {isRegistering ? 'REGISTRANDO...' : 'OBTENER TURNO'}
</button>
              
              
              OBTENER TURNO
            </button>
        </div>

        {/* LADO DERECHO: VISUAL + TECLADO */}
        <div className="w-1/2 bg-slate-200 rounded-[2rem] p-6 flex flex-col shadow-inner border border-white/50 relative overflow-hidden">
            
            {/* ÁREA SUPERIOR: ICONO GIGANTE */}
            <div className="flex-1 flex items-center justify-center relative min-h-0">
                 {/* Fondo decorativo sutil */}
                 <div className="absolute w-[120%] h-[120%] bg-white/20 blur-3xl rounded-full pointer-events-none"></div>

                 {activeField === 'name' ? (
                     <User className="w-48 h-48 text-slate-400/80 drop-shadow-sm animate-in zoom-in duration-300 relative z-10" strokeWidth={1} />
                 ) : (
                     <Hash className="w-48 h-48 text-slate-400/80 drop-shadow-sm animate-in zoom-in duration-300 relative z-10" strokeWidth={1} />
                 )}
                 
                 <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">
                        Teclado Virtual {activeField === 'id' ? 'Numérico' : 'Alfabético'}
                    </span>
                 </div>
            </div>

            {/* ÁREA INFERIOR: TECLADO */}
            <div className="mt-4 z-20">
                {activeField === 'id' ? (
                    // TECLADO NUMÉRICO - MÁS GRANDE
                    <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                        {numPad.map((key) => (
                            <button
                                key={key}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleVirtualKey(key)}
                                className={`h-32 rounded-3xl shadow-[0_6px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[6px] border-b-[8px] text-6xl font-black transition-all flex items-center justify-center
                                    ${key === 'DEL' ? 'bg-red-50 text-red-500 border-red-200' : 
                                    key === 'CLR' ? 'bg-orange-50 text-orange-500 border-orange-200' : 
                                    'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                            >
                                {key === 'DEL' ? <Delete className="w-14 h-14" /> : key}
                            </button>
                        ))}
                    </div>
                ) : (
                    // TECLADO ALFABÉTICO (QWERTY) - MÁS GRANDE
                    <div className="flex flex-col gap-3">
                        {alphaRows.map((row, i) => (
                            <div key={i} className="flex gap-3 justify-center w-full">
                                {row.map(char => (
                                    <button
                                        key={char}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handleVirtualKey(char)}
                                        className="flex-1 h-24 bg-white rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[5px] border-b-[6px] border-slate-200 text-4xl font-black text-slate-700 hover:bg-slate-50 transition-all min-w-[3rem]"
                                    >
                                        {char}
                                    </button>
                                ))}
                            </div>
                        ))}
                        <div className="flex gap-3 w-full mt-2 px-4">
                             <button 
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleVirtualKey('SPACE')}
                                className="flex-[4] h-24 bg-white rounded-2xl shadow-[0_5px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[5px] border-b-[6px] border-slate-200 text-2xl font-black text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest"
                             >
                                ESPACIO
                             </button>
                             <button 
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleVirtualKey('DEL')}
                                className="flex-1 h-24 bg-red-100 rounded-2xl shadow-[0_5px_0_0_rgba(254,202,202,1)] active:shadow-none active:translate-y-[5px] border-b-[6px] border-red-200 flex items-center justify-center text-red-500 hover:bg-red-200 transition-all"
                             >
                                <Delete className="w-10 h-10" />
                             </button>
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
