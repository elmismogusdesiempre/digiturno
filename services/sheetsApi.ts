const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6aKydOyH8QyvrAmlrKN1uZSGltkMU8nD0G26OYKhLShEmn63xe3h43JL51t0PoLuR/exec"; // Mantén las comillas
export const sheetsAPI = {
  async addTicket(nombre: string, servicio: string) {
    // Usaremos URLSearchParams para enviar datos como un formulario, 
    // que es más amigable para Google Apps Script
    const params = new URLSearchParams();
    params.append('action', 'addTicket');
    params.append('nombre', nombre);
    params.append('servicio', servicio);

    try {
      await fetch(`${SCRIPT_URL}?${params.toString()}`, {
        method: 'POST',
        mode: 'no-cors'
      });
      return { success: true };
    } catch (e) {
      console.error("Error enviando:", e);
      return { success: false };
    }
  }
};
