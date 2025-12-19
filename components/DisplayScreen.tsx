import React, { useEffect, useState, useRef } from 'react';
import { Ticket, Slide, RssFeedConfig, ClockConfig, TickerLineConfig, PlaylistItem } from '../types';
import { Megaphone, Home, Bell } from 'lucide-react';

interface DisplayScreenProps {
  calledTickets: Ticket[]; // Se mantiene por compatibilidad inicial
  tickerLines: TickerLineConfig[];
  tickerMode: 'scrolling' | 'slides' | 'rss';
  slides: Slide[];
  rssFeeds: RssFeedConfig[];
  clockConfig?: ClockConfig;
  imagePlaylist: PlaylistItem[];
  displayMode: 'image' | 'map' | 'video';
  mapUrl?: string;
  videoPlaylist: PlaylistItem[];
  onBack: () => void;
}

// URL DE TU BASE DE DATOS (GOOGLE APPS SCRIPT)
const API_URL = "https://script.google.com/macros/s/AKfycbweqXCiIR8joddOa0rGZwQ4NPCMtn47clC89um3HIYLBC_amJOe7tQwKX4cs_5PugdF/exec";

const getEmbedUrl = (url: string): string => {
  if (!url) return "";
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = "";
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=0&controls=0&modestbranding=1`;
  }
  if (url.includes('vimeo.com')) {
    const parts = url.split('/');
    const videoId = parts[parts.length - 1].split('?')[0];
    return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&background=1&badge=0&autopause=0&player_id=0&app_id=58479`;
  }
  return url;
};

const ClockWidget: React.FC<{ config: ClockConfig }> = ({ config }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!config.visible) return null;

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
    }

    const fontSizeMap = {
        'sm': 'text-lg', 'md': 'text-2xl', 'lg': 'text-3xl', 'xl': 'text-4xl', '2xl': 'text-5xl',
    };

    return (
        <div 
            className={`absolute z-40 p-5 backdrop-blur-md flex flex-col pointer-events-none ${
              config.position === 'top-left' ? 'top-0 left-0 text-left' :
              config.position === 'top-right' ? 'top-0 right-0 text-right' :
              config.position === 'bottom-left' ? 'bottom-0 left-0 text-left' : 'bottom-0 right-0 text-right'
            }`}
            style={{ 
                backgroundColor: `rgba(${hexToRgb(config.backgroundColor)}, ${config.bgOpacity / 100})`,
                color: config.textColor,
                fontFamily: config.fontFamily
            }}
        >
            {config.showTime && (
                <div className={`font-black leading-none tracking-tighter ${fontSizeMap[config.fontSize]}`}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
            )}
            {config.showDate && (
                <div className="text-[10px] opacity-80 mt-1 font-semibold uppercase tracking-[0.2em]">
                    {time.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                </div>
            )}
        </div>
    );
}

const cleanText = (text: string): string => {
  if (!text) return "";
  try {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || text;
  } catch (e) { return text; }
};

const RssRow: React.FC<{ feed: RssFeedConfig }> = ({ feed }) => {
  const [rssData, setRssData] = useState<string>("");
  useEffect(() => {
      const fetchRss = async () => {
        try {
          const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
          const data = await response.json();
          if (data.status === 'ok' && data.items) {
             setRssData(data.items.map((item: any) => cleanText(item.title)).join("  •  "));
          }
        } catch (error) { setRssData(`Conectando...`); }
      };
      fetchRss();
      const interval = setInterval(fetchRss, 300000);
      return () => clearInterval(interval);
  }, [feed.url]);

  const duration = Math.max((rssData.length * 60) / (feed.speed || 50), 40);

  return (
    <div className="flex-1 w-full relative overflow-hidden flex items-center border-t border-slate-100/10" style={{ backgroundColor: feed.backgroundColor }}>
        <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center pl-6 pr-4 min-w-[180px] shadow-2xl" style={{ backgroundColor: feed.backgroundColor }}>
            <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white rounded flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                    <img src={feed.logoUrl} className="w-full h-full object-contain p-0.5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate opacity-80" style={{ color: feed.textColor }}>
                    {feed.label}
                </span>
            </div>
        </div>
        <div className="whitespace-nowrap w-full flex items-center h-full pl-[190px]">
            <div className="scrolling-text text-xl font-bold px-4 flex gap-32" style={{ animationDuration: `${duration}s`, color: feed.textColor }}>
                <span>{rssData}</span><span>{rssData}</span>
            </div>
        </div>
    </div>
  )
}

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0,0,0';
}

const DisplayScreen: React.FC<DisplayScreenProps> = ({ 
  calledTickets: initialTickets, tickerLines, tickerMode, slides, rssFeeds, clockConfig, imagePlaylist, displayMode, mapUrl, videoPlaylist, onBack
}) => {
  // --- NUEVA LÓGICA DE SINCRONIZACIÓN ---
  const [liveTickets, setLiveTickets] = useState<Ticket[]>(initialTickets);
  const currentTicket = liveTickets.length > 0 ? liveTickets[0] : null;
  const historyTickets = liveTickets.slice(1, 4);

  const [flash, setFlash] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  // POLLING: Consultar la DB cada 3 segundos
  useEffect(() => {
   const syncWithDB = async () => {
  try {
    // Asegúrate de que API_URL empiece con https:// (SIN LA T)
    const response = await fetch(`${API_URL}?sheet=display`, {
      method: 'GET',
      redirect: 'follow'
    });
    
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      const formattedTickets = data.map((item: any) => ({
        id: String(item.ticket_id),
        number: String(item.ticket_id),
        customerName: String(item.nombre || 'En espera'),
        boxId: String(item.box || '-'),
        timestamp: String(item.called_at || '')
      }));

      setLiveTickets(formattedTickets);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  }
};

    
    const interval = setInterval(syncWithDB, 3000);
    return () => clearInterval(interval);
  }, []);
  // ---------------------------------------

  const speakFemaleVoice = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const preferredFemaleVoices = voices.filter(v => 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('femenina') || 
         v.name.toLowerCase().includes('monica') || 
         v.name.toLowerCase().includes('paulina') || 
         v.name.toLowerCase().includes('google español')) && 
         v.lang.startsWith('es')
    );
    
    if (preferredFemaleVoices.length > 0) {
        utterance.voice = preferredFemaleVoices[0];
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Disparar anuncio cuando cambia el ID del ticket actual
  useEffect(() => {
    if (currentTicket) {
      setFlash(true);
      try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch(() => {});
          
          setTimeout(() => {
            speakFemaleVoice(`${currentTicket.customerName}, pasar al módulo ${currentTicket.boxId}`);
          }, 1200);
      } catch (e) {}
      
      const timer = setTimeout(() => setFlash(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [currentTicket?.id]);

  useEffect(() => {
    if (tickerMode === 'slides' && slides.length > 1) {
      const interval = setInterval(() => setCurrentSlideIndex(p => (p + 1) % slides.length), 10000);
      return () => clearInterval(interval);
    }
  }, [tickerMode, slides.length]);

  useEffect(() => {
    if (displayMode === 'image' && imagePlaylist.length > 1) {
        const currentItem = imagePlaylist[currentImageIndex];
        const duration = (currentItem?.duration || 15) * 1000;
        const timer = setTimeout(() => {
            setCurrentImageIndex(prev => (prev + 1) % imagePlaylist.length);
        }, duration);
        return () => clearTimeout(timer);
    }
  }, [displayMode, imagePlaylist, currentImageIndex]);

  useEffect(() => {
    if (displayMode === 'video' && videoPlaylist.length > 1) {
        const currentItem = videoPlaylist[currentVideoIndex];
        const duration = (currentItem?.duration || 60) * 1000;
        const timer = setTimeout(() => {
            setCurrentVideoIndex(prev => (prev + 1) % videoPlaylist.length);
        }, duration);
        return () => clearTimeout(timer);
    }
  }, [displayMode, videoPlaylist, currentVideoIndex]);


  const handleMouseMove = () => {
    setShowControls(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setShowControls(false), 3000);
  };

  const currentSlide = slides[currentSlideIndex];
  const activeRssFeeds = rssFeeds.filter(f => f.active);

  const displayImageUrl = imagePlaylist.length > 0 && imagePlaylist[currentImageIndex] ? imagePlaylist[currentImageIndex].url : "";
  const displayVideoUrl = videoPlaylist.length > 0 && videoPlaylist[currentVideoIndex] ? videoPlaylist[currentVideoIndex].url : "";

  return (
    <div 
      className="fixed inset-0 w-screen h-screen flex flex-col bg-slate-900 text-white overflow-hidden select-none m-0 p-0"
      onMouseMove={handleMouseMove}
    >
      {/* PANTALLA DE LLAMADO (FLASH) */}
      {flash && currentTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-white rounded-[4rem] p-16 shadow-[0_0_150px_rgba(79,70,229,0.5)] border-[16px] border-indigo-600 flex flex-col items-center justify-center animate-in zoom-in duration-300 min-w-[45vw] text-center">
              <span className="text-indigo-600 font-black uppercase tracking-[0.5em] text-sm mb-12 opacity-80">Llamado de Turno</span>
              <div className="text-slate-900 text-[14rem] font-black leading-none tracking-tighter mb-10 drop-shadow-sm">
                {currentTicket.number}
              </div>
              <div className="bg-indigo-600 text-white px-16 py-6 rounded-full text-5xl font-black uppercase tracking-widest mb-12 shadow-xl">
                MÓDULO {currentTicket.boxId}
              </div>
              <div className="text-slate-400 text-3xl font-bold italic truncate max-w-[90%] px-6">
                {currentTicket.customerName}
              </div>
           </div>
        </div>
      )}

      <div className={`absolute top-6 left-6 z-50 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={onBack} className="bg-white/90 backdrop-blur text-slate-900 px-5 py-2.5 rounded-full font-black shadow-xl flex items-center gap-2 hover:bg-white transition-all text-sm">
          <Home className="w-4 h-4" /> SALIR
        </button>
      </div>

      <div className="flex w-full h-[70vh] bg-black overflow-hidden border-b border-indigo-600/20">
        
        <div className="w-[70vw] h-full relative border-r border-slate-800 bg-slate-950">
          {displayMode === 'image' && (
              <div key={displayImageUrl} className="w-full h-full animate-in fade-in duration-1000">
                 <img src={displayImageUrl} className="w-full h-full object-cover" />
              </div>
          )}
          {displayMode === 'video' && displayVideoUrl && (
            <div key={displayVideoUrl} className="w-full h-full animate-in fade-in duration-1000">
                <iframe 
                src={getEmbedUrl(displayVideoUrl)} 
                className="w-full h-full border-0" 
                allow="autoplay; fullscreen"
                title="Multimedia"
                />
            </div>
          )}
          {displayMode === 'map' && <iframe src={mapUrl} className="w-full h-full border-0 brightness-75" />}
          
          <div className="absolute top-5 left-5 bg-black/30 px-3 py-1.5 rounded border border-white/5 backdrop-blur-md z-30">
             <span className="text-[10px] font-black text-white/50 tracking-[0.4em] uppercase">Digiturno AI</span>
          </div>

          {clockConfig && <ClockWidget config={clockConfig} />}
        </div>

        <div className="w-[30vw] h-full flex flex-col bg-white overflow-hidden shadow-2xl z-10">
          
          <div className={`flex-[4] flex flex-col items-center justify-center p-8 transition-all duration-700 ${flash ? 'bg-indigo-600' : 'bg-white'}`}>
             <h2 className={`text-2xl font-black uppercase tracking-[0.2em] mb-10 flex items-center gap-3 ${flash ? 'text-white' : 'text-slate-800'}`}>
                <Bell className={`w-7 h-7 ${flash ? 'text-indigo-200' : 'text-indigo-500'}`} /> ATENDIENDO AHORA
             </h2>
             {currentTicket ? (
               <div className="text-center w-full flex flex-col items-center">
                 <div className={`text-8xl font-black leading-none mb-10 tracking-tighter ${flash ? 'text-white' : 'text-slate-900'} drop-shadow-sm`}>
                   {currentTicket.number}
                 </div>
                 <div className={`text-xl font-black uppercase tracking-[0.3em] py-3 px-10 rounded-full border ${flash ? 'text-white border-white/30 bg-white/10' : 'text-indigo-600 border-indigo-100 bg-indigo-50/30'}`}>
                   MÓD {currentTicket.boxId}
                 </div>
                 <div className={`text-lg font-bold mt-12 italic truncate w-full px-10 ${flash ? 'text-indigo-100' : 'text-slate-400'}`}>
                   {currentTicket.customerName}
                 </div>
               </div>
             ) : (
               <div className="text-slate-100 font-black uppercase tracking-widest animate-pulse text-xs">Sistema Iniciado</div>
             )}
          </div>

          <div className="flex-[4] bg-slate-50/40 p-8 border-t border-slate-100 overflow-hidden">
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <Megaphone className="w-7 h-7 text-indigo-500" /> HISTORIAL
             </h3>
             <div className="space-y-4">
               {historyTickets.map((t) => (
                 <div key={t.id} className="flex items-center p-4 bg-white rounded-3xl shadow-sm border border-slate-100 gap-4 hover:bg-slate-50 transition-all">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter shrink-0 w-24 text-center">{t.number}</span>
                    <div className="w-px h-10 bg-slate-200 shrink-0"></div>
                    <span className="flex-1 text-2xl font-black text-indigo-600 uppercase truncate text-center leading-none">
                        {t.customerName}
                    </span>
                    <div className="shrink-0">
                        <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200 whitespace-nowrap">
                            MÓD {t.boxId}
                        </span>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      <div className="h-[30vh] w-full bg-white flex flex-col overflow-hidden border-t-8 border-indigo-600">
        {tickerMode === 'scrolling' && (
           <div className="w-full h-full flex flex-col">
              {tickerLines.map((line) => (
                  line.active && (
                      <div 
                        key={line.id} 
                        className="w-full scrolling-container flex-1 border-b border-black/5" 
                        style={{ 
                            backgroundColor: `rgba(${hexToRgb(line.backgroundColor)}, ${line.bgOpacity / 100})` 
                        }}
                      >
                        <div 
                            className={`scrolling-text ${line.fontSize} font-black flex items-center gap-40 py-2 h-full`} 
                            style={{ 
                                whiteSpace: 'nowrap',
                                animationDuration: `${line.speed}s`,
                                color: line.textColor
                            }}
                        >
                            {line.text}
                        </div>
                      </div>
                  )
              ))}
           </div>
        )}

        {tickerMode === 'rss' && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            {activeRssFeeds.length > 0 ? (
                activeRssFeeds.map(feed => <RssRow key={feed.id} feed={feed} />)
            ) : (
                <div className="h-full flex items-center justify-center text-slate-100 font-black text-xl uppercase tracking-[1em]">Cargando Noticias</div>
            )}
          </div>
        )}

        {tickerMode === 'slides' && currentSlide && (
          <div className="w-full h-full flex animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="w-[20vw] h-full p-4">
              <img src={currentSlide.imageUrl} className="w-full h-full object-cover rounded-xl shadow-md border border-slate-100" />
            </div>
            <div className="w-[80vw] h-full p-10 flex flex-col justify-center bg-white">
              <h1 className="text-3xl font-black text-slate-800 mb-4 leading-tight tracking-tight uppercase truncate">{currentSlide.headline}</h1>
              <div className="space-y-1.5">
                {currentSlide.lines.map((l, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-indigo-500/50 rounded-full shrink-0" />
                    <p className="text-lg font-medium text-slate-400 truncate tracking-tight">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayScreen;
