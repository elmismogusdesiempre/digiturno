export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwe7ITluadbR-zkzaSivMoFL98nNDmQbUQd_s010hTmutTzIt-66YpPnz76FpyTrZAp/exec"; // Mantén las comillas
export const sheetsAPI = {
  async addTicket(nombre: string, servicio: string) {
    try {
      const url = `${SCRIPT_URL}?action=addTicket&nombre=${encodeURIComponent(nombre)}&servicio=${encodeURIComponent(servicio)}`;
      
      // Usamos fetch en modo no-cors para evitar bloqueos
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error en la API:", error);
      return { success: false };
    }
  },

  async getState() {
    try {
      const response = await fetch(SCRIPT_URL);
      return await response.json();
    } catch (error) {
      console.error("Error obteniendo datos:", error);
      return null;
    }
  }
};
