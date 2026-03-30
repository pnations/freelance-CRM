import { getSupabaseClient } from './supabase';

function formatDbError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  return error.message || fallbackMessage;
}

// Orders
export async function addOrder(clientName, type, dateAccepted, status, cost) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .insert([{ clientName, type, dateAccepted, status, cost }])
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to create order.'));
  return data;
}

export async function getOrders() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*');
  if (error) throw new Error(formatDbError(error, 'Failed to load orders.'));
  return data || [];
}

export async function updateOrder(id, clientName, type, dateAccepted, status, cost) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ clientName, type, dateAccepted, status, cost })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to update order.'));
  return data;
}

export async function deleteOrder(id) {
  const supabase = getSupabaseClient();

  // Keep application-level cascade explicit for reliability across environments.
  const { error: paymentError } = await supabase
    .from('payments')
    .delete()
    .eq('orderId', id);
  if (paymentError) throw new Error(formatDbError(paymentError, 'Failed to remove related payments.'));

  const { error: hoursError } = await supabase
    .from('hours')
    .delete()
    .eq('orderId', id);
  // Some environments no longer include the legacy hours table.
  if (hoursError && hoursError.code !== '42P01') {
    throw new Error(formatDbError(hoursError, 'Failed to remove related hours entries.'));
  }

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete order.'));
}

// Payments
export async function addPayment(orderId, amount, date, method, options = {}) {
  const supabase = getSupabaseClient();

  const { hours, comment } = options;
  const normalizedHours = Number(hours);
  const shouldStoreHours = Number.isFinite(normalizedHours) && normalizedHours > 0;

  const paymentInsert = { orderId, amount, date, method };
  if (typeof comment === 'string' && comment.trim()) {
    paymentInsert.comment = comment.trim();
  }
  if (shouldStoreHours) {
    paymentInsert.hours = normalizedHours;
  }

  const { data, error } = await supabase
    .from('payments')
    .insert([paymentInsert])
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to log payment.'));

  return data;
}

export async function getPayments() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('payments')
    .select('*');
  if (error) throw new Error(formatDbError(error, 'Failed to load payments.'));
  return data || [];
}

export async function deletePayment(id) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete payment.'));
}

// Clients
export async function addClient(businessName, contactPerson, email, phone, notes) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .insert([{ businessName, contactPerson, email, phone, notes }])
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to create client.'));
  return data;
}

export async function getClients() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('businessName', { ascending: true });
  if (error) throw new Error(formatDbError(error, 'Failed to load clients.'));
  return data || [];
}

export async function updateClient(id, businessName, contactPerson, email, phone, notes) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('clients')
    .update({ businessName, contactPerson, email, phone, notes })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to update client.'));
  return data;
}

export async function deleteClient(id) {
  const supabase = getSupabaseClient();

  const { data: client, error: clientLookupError } = await supabase
    .from('clients')
    .select('businessName')
    .eq('id', id)
    .single();
  if (clientLookupError) {
    throw new Error(formatDbError(clientLookupError, 'Failed to verify client before delete.'));
  }

  const { data: relatedOrders, error: relatedOrdersError } = await supabase
    .from('orders')
    .select('id', { count: 'exact' })
    .eq('clientName', client.businessName);
  if (relatedOrdersError) {
    throw new Error(formatDbError(relatedOrdersError, 'Failed to check client orders before delete.'));
  }

  const relatedOrderCount = relatedOrders?.length || 0;
  if (relatedOrderCount > 0) {
    throw new Error(`Cannot delete this client because ${relatedOrderCount} related order${relatedOrderCount === 1 ? '' : 's'} still exist.`);
  }

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete client.'));
}
