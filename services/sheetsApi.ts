export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwe7ITluadbR-zkzaSivMoFL98nNDmQbUQd_s010hTmutTzIt-66YpPnz76FpyTrZAp/exec"; // Mantén las comillas
export const sheetsApi = {
  addTicket: async (nombre: string, servicio: string) => {
    // Construcción de URL ultra-simple para evitar errores de red
    const finalUrl = `${SCRIPT_URL}?action=addTicket&nombre=${encodeURIComponent(nombre)}&servicio=${encodeURIComponent(servicio)}`;
    
    console.log("Enviando petición a Google...");
    
    return fetch(finalUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache'
    });
  }
};
