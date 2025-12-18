const BASE_URL = 'https://script.google.com/macros/s/AKfycbz9pDbzhpZ4YvpssB6oWUXscLlX505cHvSuDQpROURbNjKPwCNa7bWb5IJ8Sq4dZxdp/exec';

async function post(data: any) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getState() {
  const res = await fetch(`${BASE_URL}?action=getState`);
  return res.json();
}

export async function addTicket(payload: {
  nombre: string;
  servicio: string;
  tipo: string;
}) {
  return post({
    action: 'addTicket',
    ...payload
  });
}

export async function callNext(box: number) {
  return post({
    action: 'callNext',
    box
  });
}
