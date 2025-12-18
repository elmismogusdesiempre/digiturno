
import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

interface ExternalWindowProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
}

const ExternalWindow: React.FC<ExternalWindowProps> = ({ children, onClose, title = 'Digiturno TV' }) => {
  const containerEl = useMemo(() => document.createElement('div'), []);
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);

  useEffect(() => {
    // Configuramos la ventana para que sea apta para pantallas de señalización digital
    const windowFeatures = 'width=1280,height=720,menubar=no,status=no,toolbar=no,location=no,resizable=yes';
    const newWindow = window.open('', 'DigiturnoPublicWindow', windowFeatures);

    if (newWindow) {
      setExternalWindow(newWindow);
      const doc = newWindow.document;

      // Resetear contenido si ya existía la ventana
      doc.body.innerHTML = '';
      doc.head.innerHTML = '';

      // 1. Estilos base críticos
      const style = doc.createElement('style');
      style.textContent = `
        html, body, #external-root {
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
          width: 100vw !important;
          overflow: hidden !important;
          background-color: #000; /* Fondo negro puro para pantallas */
        }
      `;
      doc.head.appendChild(style);
      doc.title = title;

      // 2. Cargar dependencias de UI (Tailwind y Fuentes)
      const tailwindScript = doc.createElement('script');
      tailwindScript.src = 'https://cdn.tailwindcss.com';
      doc.head.appendChild(tailwindScript);

      const googleFonts = doc.createElement('link');
      googleFonts.rel = 'stylesheet';
      googleFonts.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap';
      doc.head.appendChild(googleFonts);

      // Estilos personalizados para animaciones suaves
      const customStyles = doc.createElement('style');
      customStyles.textContent = `
        body { font-family: 'Inter', sans-serif; }
        .scrolling-text {
          animation: scroll-left 120s linear infinite;
          will-change: transform;
        }
        @keyframes scroll-left {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100%); }
        }
        iframe { pointer-events: none; } /* Evita interacción accidental en el monitor público */
      `;
      doc.head.appendChild(customStyles);

      // 3. Montar el contenedor raíz
      containerEl.id = 'external-root';
      doc.body.appendChild(containerEl);

      // 4. Gestión de eventos
      const handleUnload = () => {
        // Solo llamamos onClose si la ventana se cierra manualmente
        if (newWindow.closed) {
            onClose();
        }
      };
      newWindow.addEventListener('unload', handleUnload);

      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          clearInterval(checkClosed);
          onClose();
        }
      }, 1000);

      return () => {
        newWindow.removeEventListener('unload', handleUnload);
        clearInterval(checkClosed);
        // IMPORTANTE: NO llamamos a newWindow.close() aquí para que la ventana 
        // persista aunque el componente se remonte brevemente por el State
      };
    } else {
      alert('Por favor, permite las ventanas emergentes (Pop-ups) para abrir la pantalla externa.');
      onClose();
    }
  }, [containerEl, onClose, title]);

  return externalWindow ? createPortal(children, containerEl) : null;
};

export default ExternalWindow;
