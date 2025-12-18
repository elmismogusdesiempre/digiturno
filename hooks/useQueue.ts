
import { useState, useEffect, useRef } from 'react';
import { Ticket, AppState, ServiceType, Slide, RssFeedConfig, ClockConfig, TickerLineConfig, PlaylistItem } from '../types';

const STORAGE_KEY = 'digiturno_state_v15';
const COUNTER_KEY = 'digiturno_counters_v1';
const BROADCAST_CHANNEL_NAME = 'digiturno_sync_channel';

const INITIAL_STATE: AppState = {
  lastUpdated: Date.now(),
  tickets: [],
  tickerMode: 'scrolling',
  tickerLines: [
    {
      id: 1,
      text: "Bienvenido a nuestro centro de servicios. | Por favor tenga su documento de identidad a la mano. | Horario de atención: Lunes a Viernes 8:00 AM - 5:00 PM",
      active: true,
      backgroundColor: '#ffffff',
      bgOpacity: 100,
      textColor: '#0f172a',
      fontSize: 'text-6xl',
      speed: 35
    },
    {
      id: 2,
      text: "Recuerde calificar nuestro servicio al finalizar.",
      active: true,
      backgroundColor: '#4f46e5',
      bgOpacity: 90,
      textColor: '#ffffff',
      fontSize: 'text-3xl',
      speed: 25
    },
    {
      id: 3,
      text: "",
      active: false,
      backgroundColor: '#000000',
      bgOpacity: 50,
      textColor: '#fbbf24',
      fontSize: 'text-xl',
      speed: 40
    }
  ],
  rssFeeds: [
    {
      id: 1,
      url: "https://news.google.com/rss/search?q=Colombia&hl=es-419&gl=CO&ceid=CO:es-419",
      label: "NACIONAL",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/1024px-Google_News_icon.svg.png",
      speed: 50,
      active: true,
      backgroundColor: '#ffffff',
      textColor: '#1e293b'
    },
    {
      id: 2,
      url: "https://www.eltiempo.com/rss/tecnologia.xml",
      label: "TECNOLOGÍA",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/3060/3060292.png",
      speed: 45,
      active: false,
      backgroundColor: '#0f172a',
      textColor: '#94a3b8'
    },
    {
      id: 3,
      url: "",
      label: "CORPORATIVO",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/4529/4529721.png",
      speed: 40,
      active: false,
      backgroundColor: '#4f46e5',
      textColor: '#ffffff'
    }
  ],
  clockConfig: {
    visible: true,
    position: 'top-right',
    showTime: true,
    showDate: true,
    textColor: '#ffffff',
    backgroundColor: '#000000',
    bgOpacity: 50,
    fontFamily: 'Inter',
    fontSize: 'lg'
  },
  slides: [
    {
      id: '1',
      headline: 'Horario Extendido',
      lines: ['Ahora atendemos hasta las 6:00 PM los fines de semana.', 'Visite nuestro sitio web para más información.'],
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400&h=400'
    }
  ],
  imagePlaylist: [{ url: "https://picsum.photos/1200/800", duration: 15 }], 
  displayMode: 'video', 
  videoPlaylist: [{ url: "https://vimeo.com/273603017", duration: 60 }] 
};

export const useQueue = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    const loadState = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                
                // MIGRATION LOGIC: Convert legacy string arrays to PlaylistItem arrays
                if (parsed.imagePlaylist && typeof parsed.imagePlaylist[0] === 'string') {
                    parsed.imagePlaylist = parsed.imagePlaylist.map((url: string) => ({ url, duration: 15 }));
                }
                if (parsed.videoPlaylist && typeof parsed.videoPlaylist[0] === 'string') {
                    parsed.videoPlaylist = parsed.videoPlaylist.map((url: string) => ({ url, duration: 60 }));
                }

                // Legacy single value checks (older versions)
                if (typeof parsed.displayImage === 'string') {
                    parsed.imagePlaylist = [{ url: parsed.displayImage, duration: 15 }];
                    delete parsed.displayImage;
                }
                if (typeof parsed.videoUrl === 'string') {
                    parsed.videoPlaylist = [{ url: parsed.videoUrl, duration: 60 }];
                    delete parsed.videoUrl;
                }

                setState(prev => (!prev || (parsed.lastUpdated > prev.lastUpdated)) ? parsed : prev);
            } catch (e) { console.error(e); }
        }
    };
    loadState();
    channelRef.current.onmessage = (event) => { if (event.data?.type === 'UPDATE') loadState(); };
    window.addEventListener('storage', (e) => { if (e.key === STORAGE_KEY) loadState(); });
    const poll = setInterval(loadState, 1500);
    return () => {
      if (channelRef.current) channelRef.current.close();
      clearInterval(poll);
    };
  }, []);

  const updateState = (updater: (prev: AppState) => AppState) => {
      setState(prev => {
          const newState = updater(prev);
          newState.lastUpdated = Date.now();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
          if (channelRef.current) channelRef.current.postMessage({ type: 'UPDATE', timestamp: newState.lastUpdated });
          return newState;
      });
  };

  const getNextSequentialNumber = (service: ServiceType): string => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(COUNTER_KEY);
    let counters = stored ? JSON.parse(stored) : { lastDate: today, general: 1, commercial: 1 };
    if (counters.lastDate !== today) counters = { lastDate: today, general: 1, commercial: 1 };
    const prefix = service === 'General' ? 'G' : 'C';
    const num = service === 'General' ? counters.general++ : counters.commercial++;
    localStorage.setItem(COUNTER_KEY, JSON.stringify(counters));
    return `${prefix}-${num.toString().padStart(3, '0')}`;
  };

  const addTicket = (customerName: string, service: ServiceType) => {
    updateState(prev => ({ ...prev, tickets: [...prev.tickets, { id: crypto.randomUUID(), number: getNextSequentialNumber(service), customerName, service, status: 'waiting', timestamp: Date.now() }] }));
  };

  const callNextTicket = (boxId: number) => {
    updateState(prev => {
      const idx = prev.tickets.findIndex(t => t.status === 'waiting');
      if (idx === -1) return prev;
      const tks = [...prev.tickets];
      const cur = tks.findIndex(t => t.boxId === boxId && t.status === 'called');
      if (cur !== -1) tks[cur].status = 'completed';
      tks[idx] = { ...tks[idx], status: 'called', boxId, timestamp: Date.now() };
      return { ...prev, tickets: tks };
    });
  };

  const updateTickerLine = (id: number, updates: Partial<TickerLineConfig>) => updateState(prev => ({ ...prev, tickerLines: prev.tickerLines.map(line => line.id === id ? { ...line, ...updates } : line) }));
  const updateTickerMode = (mode: 'scrolling' | 'slides' | 'rss') => updateState(prev => ({ ...prev, tickerMode: mode }));
  const updateRssFeed = (id: number, updates: Partial<RssFeedConfig>) => updateState(prev => ({ ...prev, rssFeeds: prev.rssFeeds.map(f => f.id === id ? { ...f, ...updates } : f) }));
  const updateClockConfig = (updates: Partial<ClockConfig>) => updateState(prev => ({ ...prev, clockConfig: { ...prev.clockConfig, ...updates } }));
  const updateSlides = (slides: Slide[]) => updateState(prev => ({ ...prev, slides }));
  const addSlide = (slide: Slide) => updateState(prev => ({ ...prev, slides: [...prev.slides, slide] }));
  const removeSlide = (id: string) => updateState(prev => ({ ...prev, slides: prev.slides.filter(s => s.id !== id) }));
  
  // Updated for Playlists with duration
  const updateImagePlaylist = (playlist: PlaylistItem[]) => updateState(prev => ({ ...prev, imagePlaylist: playlist, displayMode: 'image' }));
  const updateVideoPlaylist = (playlist: PlaylistItem[]) => updateState(prev => ({ ...prev, videoPlaylist: playlist, displayMode: 'video' }));
  const updateDisplayMap = (mapUrl: string) => updateState(prev => ({ ...prev, mapUrl, displayMode: 'map' }));

  return { state, addTicket, callNextTicket, updateTickerLine, updateTickerMode, updateRssFeed, updateClockConfig, updateSlides, addSlide, removeSlide, updateImagePlaylist, updateVideoPlaylist, updateDisplayMap, getWaitingList: () => state.tickets.filter(t => t.status === 'waiting'), getCalledList: () => state.tickets.filter(t => t.status === 'called').sort((a, b) => b.timestamp - a.timestamp) };
};
