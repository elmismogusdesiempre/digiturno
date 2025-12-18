const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz6aKydOyH8QyvrAmlrKN1uZSGltkMU8nD0G26OYKhLShEmn63xe3h43JL51t0PoLuR/exec";

export const sheetsAPI = {
  // Obtener todos los datos
  async getState() {
    const res = await fetch(SCRIPT_URL);
    return await res.json();
  },

  // Crear un nuevo ticket
  async addTicket(nombre: string, servicio: string) {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Importante para evitar errores de CORS con Google
      body: JSON.stringify({
        action: 'addTicket',
        nombre,
        servicio
      })
    });
    return res;
  },

  // Llamar al siguiente turno (desde el panel del box)
  async callNext(box_id: string | number) {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({
        action: 'callNext',
        box_id
      })
    });
    return res;
  }
};
