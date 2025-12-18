
import React, { useState, useEffect } from 'react';
import { Slide, RssFeedConfig, ClockConfig, TickerLineConfig, PlaylistItem } from '../types';
import { getQuotaUsage } from '../services/geminiService';
import { Image, Type, Trash2, Video, Rss, Settings2, RefreshCw, Palette, Clock, Layout, ListPlus, Plus, X, Timer, Monitor } from 'lucide-react';

interface AdminPanelProps {
  tickerLines: TickerLineConfig[];
  tickerMode: 'scrolling' | 'slides' | 'rss';
  slides: Slide[];
  rssFeeds: RssFeedConfig[];
  clockConfig: ClockConfig;
  onUpdateTickerLine: (id: number, updates: Partial<TickerLineConfig>) => void;
  onUpdateTickerMode: (mode: 'scrolling' | 'slides' | 'rss') => void;
  onUpdateRssFeed: (id: number, updates: Partial<RssFeedConfig>) => void;
  onUpdateClockConfig: (updates: Partial<ClockConfig>) => void;
  onUpdateSlides: (slides: Slide[]) => void;
  onAddSlide: (slide: Slide) => void;
  onRemoveSlide: (id: string) => void;
  onUpdateImagePlaylist: (playlist: PlaylistItem[]) => void;
  onUpdateMap: (url: string) => void;
  onUpdateVideoPlaylist: (playlist: PlaylistItem[]) => void;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  tickerLines, tickerMode, slides, rssFeeds, clockConfig, onUpdateTickerLine, onUpdateTickerMode, onUpdateRssFeed, onUpdateClockConfig, onUpdateSlides, onAddSlide, onRemoveSlide, onUpdateImagePlaylist, onUpdateMap, onUpdateVideoPlaylist, onBack 
}) => {
  const [imageInputs, setImageInputs] = useState<PlaylistItem[]>([{ url: '', duration: 15 }]);
  const [videoInputs, setVideoInputs] = useState<PlaylistItem[]>([{ url: '', duration: 60 }]);
  const [quota, setQuota] = useState(getQuotaUsage());
  
  // Estado para gestión de slides
  const [newSlide, setNewSlide] = useState({ headline: '', line1: '', imageUrl: '' });

  useEffect(() => {
    const int = setInterval(() => setQuota(getQuotaUsage()), 5000);
    return () => clearInterval(int);
  }, []);

  const handleManualAddSlide = () => {
      if (!newSlide.headline) return;
      onAddSlide({
          id: crypto.randomUUID(),
          headline: newSlide.headline,
          lines: [newSlide.line1],
          imageUrl: newSlide.imageUrl || "https://picsum.photos/400/400"
      });
      setNewSlide({ headline: '', line1: '', imageUrl: '' });
  };

  const updatePlaylistUrl = (setter: React.Dispatch<React.SetStateAction<PlaylistItem[]>>, current: PlaylistItem[], index: number, value: string) => {
    const newInputs = [...current];
    newInputs[index] = { ...newInputs[index], url: value };
    setter(newInputs);
  };

  const updatePlaylistDuration = (setter: React.Dispatch<React.SetStateAction<PlaylistItem[]>>, current: PlaylistItem[], index: number, value: string) => {
    const newInputs = [...current];
    const dur = parseInt(value) || 10;
    newInputs[index] = { ...newInputs[index], duration: dur };
    setter(newInputs);
  };

  const addPlaylistInput = (setter: React.Dispatch<React.SetStateAction<PlaylistItem[]>>, current: PlaylistItem[], defaultDuration: number) => {
    setter([...current, { url: '', duration: defaultDuration }]);
  };

  const removePlaylistInput = (setter: React.Dispatch<React.SetStateAction<PlaylistItem[]>>, current: PlaylistItem[], index: number, defaultDuration: number) => {
    if (current.length > 1) {
        setter(current.filter((_, i) => i !== index));
    } else {
        setter([{ url: '', duration: defaultDuration }]);
    }
  };

  const fontSizes = [
      { val: 'text-lg', label: 'Pequeño' },
      { val: 'text-xl', label: 'Mediano' },
      { val: 'text-2xl', label: 'Grande' },
      { val: 'text-3xl', label: 'XL' },
      { val: 'text-4xl', label: '2XL' },
      { val: 'text-5xl', label: '3XL' },
      { val: 'text-6xl', label: 'Gigante' },
  ];

  return (
    <div className="h-screen overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8">
            <button onClick={onBack} className="text-slate-500 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors">
              <Settings2 className="w-5 h-5" /> ← Panel de Control
            </button>
            <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border flex items-center gap-2 ${quota.remaining > 5 ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
              <RefreshCw className={`w-4 h-4 ${quota.remaining <= 5 ? 'animate-spin' : ''}`} /> Cuota IA: {quota.remaining}
            </div>
        </div>

        <div className="grid gap-8">

           {/* REGIÓN PRINCIPAL (Multimedia) */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3"><Monitor className="w-6 h-6 text-blue-500" />REGIÓN PRINCIPAL</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* FONDO PLAYLIST */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><Image className="w-5 h-5 text-pink-500" />FONDO (PLAYLIST)</h2>
                    <div className="space-y-2">
                        {imageInputs.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={item.url} 
                                    onChange={(e) => updatePlaylistUrl(setImageInputs, imageInputs, idx, e.target.value)} 
                                    placeholder="URL Imagen..." 
                                    className="flex-1 p-3 border border-slate-200 rounded-xl text-xs bg-white" 
                                />
                                <div className="relative w-24">
                                    <input 
                                        type="number" 
                                        value={item.duration} 
                                        onChange={(e) => updatePlaylistDuration(setImageInputs, imageInputs, idx, e.target.value)} 
                                        placeholder="Seg" 
                                        className="w-full p-3 pl-8 border border-slate-200 rounded-xl text-xs font-bold text-center bg-white" 
                                    />
                                    <Timer className="absolute left-2 top-3 w-4 h-4 text-slate-400" />
                                </div>
                                {imageInputs.length > 1 && (
                                    <button onClick={() => removePlaylistInput(setImageInputs, imageInputs, idx, 15)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => addPlaylistInput(setImageInputs, imageInputs, 15)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 hover:text-pink-600 transition-colors">
                            <Plus className="w-4 h-4" /> Agregar Imagen
                        </button>
                    </div>
                    <button onClick={() => onUpdateImagePlaylist(imageInputs.filter(u => u.url))} className="w-full bg-pink-600 text-white p-3 rounded-xl font-black uppercase text-[10px] shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all active:scale-[0.98]">
                        Establecer Playlist de Fondo
                    </button>
                </div>

                {/* VIDEO PLAYLIST */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest"><Video className="w-5 h-5 text-red-500" />VIDEO (PLAYLIST)</h2>
                    <div className="space-y-2">
                        {videoInputs.map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={item.url} 
                                    onChange={(e) => updatePlaylistUrl(setVideoInputs, videoInputs, idx, e.target.value)} 
                                    placeholder="URL Video..." 
                                    className="flex-1 p-3 border border-slate-200 rounded-xl text-xs bg-white" 
                                />
                                <div className="relative w-24">
                                    <input 
                                        type="number" 
                                        value={item.duration} 
                                        onChange={(e) => updatePlaylistDuration(setVideoInputs, videoInputs, idx, e.target.value)} 
                                        placeholder="Seg" 
                                        className="w-full p-3 pl-8 border border-slate-200 rounded-xl text-xs font-bold text-center bg-white" 
                                    />
                                    <Timer className="absolute left-2 top-3 w-4 h-4 text-slate-400" />
                                </div>
                                {videoInputs.length > 1 && (
                                    <button onClick={() => removePlaylistInput(setVideoInputs, videoInputs, idx, 60)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => addPlaylistInput(setVideoInputs, videoInputs, 60)} className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 hover:text-red-600 transition-colors">
                            <Plus className="w-4 h-4" /> Agregar Video
                        </button>
                    </div>
                    <button onClick={() => onUpdateVideoPlaylist(videoInputs.filter(u => u.url))} className="w-full bg-red-600 text-white p-3 rounded-xl font-black uppercase text-[10px] shadow-lg shadow-red-200 hover:shadow-red-300 transition-all active:scale-[0.98]">
                        Establecer Playlist de Video
                    </button>
                </div>
             </div>
           </div>

           {/* RELOJ */}
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3"><Clock className="w-6 h-6 text-indigo-500" />RELOJ Y FECHA</h2>
                <input type="checkbox" checked={clockConfig.visible} onChange={(e) => onUpdateClockConfig({ visible: e.target.checked })} className="w-6 h-6 rounded-lg text-indigo-600" />
             </div>
             {clockConfig.visible && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">Mostrar Hora</span>
                            <input type="checkbox" checked={clockConfig.showTime} onChange={e => onUpdateClockConfig({ showTime: e.target.checked })} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">Mostrar Fecha</span>
                            <input type="checkbox" checked={clockConfig.showDate} onChange={e => onUpdateClockConfig({ showDate: e.target.checked })} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Color Texto</label>
                                <input type="color" value={clockConfig.textColor} onChange={(e) => onUpdateClockConfig({ textColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Color Fondo</label>
                                <input type="color" value={clockConfig.backgroundColor} onChange={(e) => onUpdateClockConfig({ backgroundColor: e.target.value })} className="w-full h-10 rounded-xl cursor-pointer" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Opacidad Fondo ({clockConfig.bgOpacity}%)</label>
                            <input type="range" min="0" max="100" value={clockConfig.bgOpacity} onChange={(e) => onUpdateClockConfig({ bgOpacity: parseInt(e.target.value) })} className="w-full h-2 accent-indigo-600" />
                        </div>
                    </div>
                </div>
             )}
           </div>
          
           {/* REGIÓN INFERIOR */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-3"><Layout className="w-6 h-6 text-emerald-500" />REGIÓN INFERIOR</h2>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    {[{ id: 'scrolling', label: 'Texto', icon: Type }, { id: 'slides', label: 'Diapos', icon: RefreshCw }, { id: 'rss', label: 'RSS', icon: Rss }].map(mode => (
                      <button key={mode.id} onClick={() => onUpdateTickerMode(mode.id as any)} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${tickerMode === mode.id ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500'}`}><mode.icon className="w-4 h-4" />{mode.label}</button>
                    ))}
                </div>
             </div>

             {/* MODO TEXTO (3 LÍNEAS INDEPENDIENTES) */}
             {tickerMode === 'scrolling' && (
                <div className="space-y-8 animate-in fade-in">
                    {tickerLines.map((line) => (
                        <div key={line.id} className={`p-6 rounded-3xl border transition-all ${line.active ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 text-sm uppercase">Línea de Texto {line.id}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400">{line.active ? 'ACTIVO' : 'INACTIVO'}</span>
                                    <input type="checkbox" checked={line.active} onChange={e => onUpdateTickerLine(line.id, { active: e.target.checked })} className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" />
                                </div>
                             </div>

                             {line.active && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Contenido del Texto</label>
                                        <textarea value={line.text} onChange={(e) => onUpdateTickerLine(line.id, { text: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl h-20 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Fondo</label>
                                            <input type="color" value={line.backgroundColor} onChange={e => onUpdateTickerLine(line.id, { backgroundColor: e.target.value })} className="w-full h-10 rounded cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Transparencia Fondo</label>
                                            <input type="range" min="0" max="100" value={line.bgOpacity} onChange={e => onUpdateTickerLine(line.id, { bgOpacity: parseInt(e.target.value) })} className="w-full h-2 accent-indigo-600 mt-2" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Color Texto</label>
                                            <input type="color" value={line.textColor} onChange={e => onUpdateTickerLine(line.id, { textColor: e.target.value })} className="w-full h-10 rounded cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Velocidad (Seg)</label>
                                            <input type="number" value={line.speed} onChange={e => onUpdateTickerLine(line.id, { speed: parseInt(e.target.value) })} className="w-full p-2 border border-slate-200 rounded text-sm font-bold" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Tamaño Fuente</label>
                                            <select value={line.fontSize} onChange={e => onUpdateTickerLine(line.id, { fontSize: e.target.value as any })} className="w-full p-2 border border-slate-200 rounded text-sm bg-white">
                                                {fontSizes.map(f => <option key={f.val} value={f.val}>{f.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
             )}

             {/* MODO DIAPOSITIVAS (Restaurado Completo) */}
             {tickerMode === 'slides' && (
                <div className="space-y-8 animate-in fade-in">
                    
                    {/* Agregar Manual */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <input value={newSlide.headline} onChange={e => setNewSlide({...newSlide, headline: e.target.value})} placeholder="Título..." className="p-3 rounded-xl border border-slate-200 text-sm" />
                        <input value={newSlide.line1} onChange={e => setNewSlide({...newSlide, line1: e.target.value})} placeholder="Texto..." className="p-3 rounded-xl border border-slate-200 text-sm" />
                        <div className="flex gap-2">
                             <input value={newSlide.imageUrl} onChange={e => setNewSlide({...newSlide, imageUrl: e.target.value})} placeholder="URL Imagen..." className="flex-1 p-3 rounded-xl border border-slate-200 text-sm" />
                             <button onClick={handleManualAddSlide} className="bg-slate-900 text-white px-4 rounded-xl font-bold"><ListPlus className="w-4 h-4" /></button>
                        </div>
                    </div>

                    {/* Lista de Slides */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Diapositivas Activas ({slides.length})</label>
                        {slides.map((slide, idx) => (
                            <div key={slide.id} className="flex items-center gap-4 p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                <span className="font-bold text-slate-300 text-xs w-6">{idx + 1}</span>
                                <img src={slide.imageUrl} className="w-12 h-12 rounded object-cover bg-slate-100" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{slide.headline}</h4>
                                    <p className="text-xs text-slate-500 truncate">{slide.lines[0]}</p>
                                </div>
                                <button onClick={() => onRemoveSlide(slide.id)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>
             )}

             {/* MODO RSS (Restaurado Completo) */}
             {tickerMode === 'rss' && (
                <div className="grid grid-cols-1 gap-6 animate-in fade-in">
                    {rssFeeds.map((feed) => (
                        <div key={feed.id} className={`p-6 rounded-3xl border transition-all ${feed.active ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                        <span className="font-black text-slate-500">{feed.id}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-700 text-sm uppercase">Canal RSS {feed.id}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400">{feed.active ? 'ACTIVO' : 'INACTIVO'}</span>
                                    <input 
                                        type="checkbox" 
                                        checked={feed.active} 
                                        onChange={e => onUpdateRssFeed(feed.id, { active: e.target.checked })} 
                                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500" 
                                    />
                                </div>
                            </div>
                            
                            {feed.active && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">URL del Feed</label>
                                            <input type="text" value={feed.url} onChange={e => onUpdateRssFeed(feed.id, { url: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg text-xs" placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Etiqueta</label>
                                            <input type="text" value={feed.label} onChange={e => onUpdateRssFeed(feed.id, { label: e.target.value })} className="w-full p-2 border border-slate-200 rounded-lg text-xs" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Fondo</label>
                                            <input type="color" value={feed.backgroundColor} onChange={e => onUpdateRssFeed(feed.id, { backgroundColor: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Texto</label>
                                            <input type="color" value={feed.textColor} onChange={e => onUpdateRssFeed(feed.id, { textColor: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Velocidad</label>
                                            <input type="number" value={feed.speed} onChange={e => onUpdateRssFeed(feed.id, { speed: parseInt(e.target.value) })} className="w-full p-1.5 border border-slate-200 rounded text-xs font-bold" />
                                        </div>
                                        <div>
                                             <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">Logo URL</label>
                                             <input type="text" value={feed.logoUrl} onChange={e => onUpdateRssFeed(feed.id, { logoUrl: e.target.value })} className="w-full p-1.5 border border-slate-200 rounded text-xs" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
