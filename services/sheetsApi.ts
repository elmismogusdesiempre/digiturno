export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6aKydOyH8QyvrAmlrKN1uZSGltkMU8nD0G26OYKhLShEmn63xe3h43JL51t0PoLuR/exec"; // Mantén las comillas
export const sheetsAPI = {
  // Función para agregar ticket
  async addTicket(nombre: string, servicio: string) {
    try {
      // Usamos un formato de URL que Google entiende sin problemas de seguridad (CORS)
      const urlConDatos = `${SCRIPT_URL}?action=addTicket&nombre=${encodeURIComponent(nombre)}&servicio=${encodeURIComponent(servicio)}`;
      
      await fetch(urlConDatos, {
        method: 'POST',
        mode: 'no-cors'
      });
      
      console.log("Petición enviada a Google para:", nombre);
      return { success: true };
    } catch (error) {
      console.error("Error en sheetsAPI.addTicket:", error);
      return { success: false };
    }
  },

  // Función para llamar siguiente
  async callNext(box_id: string | number) {
    try {
      const urlConDatos = `${SCRIPT_URL}?action=callNext&box_id=${encodeURIComponent(box_id)}`;
      
      await fetch(urlConDatos, {
        method: 'POST',
        mode: 'no-cors'
      });
      
      return { success: true };
    } catch (error) {
      console.error("Error en sheetsAPI.callNext:", error);
      return { success: false };
    }
  }
};
