export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwe7ITluadbR-zkzaSivMoFL98nNDmQbUQd_s010hTmutTzIt-66YpPnz76FpyTrZAp/exec"; // Mantén las comillas
export const sheetsApi = {
  addTicket: async (nombre: string, servicio: string) => {
    // Esto es lo que funcionó en tu navegador. Lo replicamos exacto.
    const url = `${SCRIPT_URL}?action=addTicket&nombre=${encodeURIComponent(nombre)}&servicio=${encodeURIComponent(servicio)}`;
    
    // El 'no-cors' hace que Vercel envíe la orden y se olvide, 
    // evitando que Google bloquee la petición por seguridad.
    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache'
    });
  }
};
