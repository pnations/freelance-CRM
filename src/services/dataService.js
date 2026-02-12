import { supabase, isSupabaseConfigured } from './supabase';

// Simple in-memory demo data when Supabase is not configured.
const demoOrders = [
  {
    id: 'ord-1',
    clientName: 'Acme Corp',
    type: 'Web App',
    dateAccepted: '2024-05-01',
    status: 'In Progress',
    cost: 12000,
  },
  {
    id: 'ord-2',
    clientName: 'Globex',
    type: 'Design',
    dateAccepted: '2024-04-18',
    status: 'Pending',
    cost: 4500,
  },
];

const demoPayments = [
  {
    id: 'pay-1',
    orderId: 'ord-1',
    amount: 6000,
    date: '2024-05-10',
    method: 'Bank Transfer',
  },
];

const demoHours = [
  {
    id: 'hrs-1',
    orderId: 'ord-1',
    hours: 18,
    date: '2024-05-12',
    notes: 'Initial build + wireframes',
  },
];

const demoClients = [
  {
    id: 'cli-1',
    businessName: 'Acme Corp',
    contactPerson: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '555-0100',
    notes: 'Primary client, prefer email communication',
  },
  {
    id: 'cli-2',
    businessName: 'Globex',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@globex.com',
    phone: '555-0200',
    notes: 'Regular design work',
  },
];

const uid = () => `id-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

// Orders
export async function addOrder(clientName, type, dateAccepted, status, cost) {
  if (!isSupabaseConfigured) {
    const order = { id: uid(), clientName, type, dateAccepted, status, cost: Number(cost) };
    demoOrders.push(order);
    return order;
  }

  const { data, error } = await supabase
    .from('orders')
    .insert([{ clientName, type, dateAccepted, status, cost }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOrders() {
  if (!isSupabaseConfigured) {
    return [...demoOrders];
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function updateOrder(id, clientName, type, dateAccepted, status, cost) {
  if (!isSupabaseConfigured) {
    const idx = demoOrders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      demoOrders[idx] = { ...demoOrders[idx], clientName, type, dateAccepted, status, cost: Number(cost) };
    }
    return demoOrders[idx];
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ clientName, type, dateAccepted, status, cost })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOrder(id) {
  if (!isSupabaseConfigured) {
    const orderIdx = demoOrders.findIndex((o) => o.id === id);
    if (orderIdx !== -1) demoOrders.splice(orderIdx, 1);
    // Cascade delete related payments and hours
    for (let i = demoPayments.length - 1; i >= 0; i -= 1) {
      if (demoPayments[i].orderId === id) demoPayments.splice(i, 1);
    }
    for (let i = demoHours.length - 1; i >= 0; i -= 1) {
      if (demoHours[i].orderId === id) demoHours.splice(i, 1);
    }
    return;
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Payments
export async function addPayment(orderId, amount, date, method) {
  if (!isSupabaseConfigured) {
    const payment = { id: uid(), orderId, amount: Number(amount), date, method };
    demoPayments.push(payment);
    return payment;
  }

  const { data, error } = await supabase
    .from('payments')
    .insert([{ orderId, amount, date, method }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPayments() {
  if (!isSupabaseConfigured) {
    return [...demoPayments];
  }

  const { data, error } = await supabase
    .from('payments')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function deletePayment(id) {
  if (!isSupabaseConfigured) {
    const idx = demoPayments.findIndex((p) => p.id === id);
    if (idx !== -1) demoPayments.splice(idx, 1);
    return;
  }

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Hours
export async function addHours(orderId, hours, date, notes) {
  if (!isSupabaseConfigured) {
    const entry = { id: uid(), orderId, hours: Number(hours), date, notes };
    demoHours.push(entry);
    return entry;
  }

  const { data, error } = await supabase
    .from('hours')
    .insert([{ orderId, hours, date, notes }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHours() {
  if (!isSupabaseConfigured) {
    return [...demoHours];
  }

  const { data, error } = await supabase
    .from('hours')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function deleteHours(id) {
  if (!isSupabaseConfigured) {
    const idx = demoHours.findIndex((h) => h.id === id);
    if (idx !== -1) demoHours.splice(idx, 1);
    return;
  }

  const { error } = await supabase
    .from('hours')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// Clients
export async function addClient(businessName, contactPerson, email, phone, notes) {
  if (!isSupabaseConfigured) {
    const client = { id: uid(), businessName, contactPerson, email, phone, notes };
    demoClients.push(client);
    return client;
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([{ businessName, contactPerson, email, phone, notes }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getClients() {
  if (!isSupabaseConfigured) {
    return [...demoClients];
  }

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('businessName', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateClient(id, businessName, contactPerson, email, phone, notes) {
  if (!isSupabaseConfigured) {
    const idx = demoClients.findIndex((c) => c.id === id);
    if (idx !== -1) {
      demoClients[idx] = { ...demoClients[idx], businessName, contactPerson, email, phone, notes };
    }
    return demoClients[idx];
  }

  const { data, error } = await supabase
    .from('clients')
    .update({ businessName, contactPerson, email, phone, notes })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClient(id) {
  if (!isSupabaseConfigured) {
    const idx = demoClients.findIndex((c) => c.id === id);
    if (idx !== -1) demoClients.splice(idx, 1);
    return;
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
