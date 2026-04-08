import { getSupabaseClient } from './supabase';

function formatDbError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  return error.message || fallbackMessage;
}

// Deals
export async function addDeal(
  clientName,
  clientContactPerson,
  clientEmail,
  clientPhone,
  clientNotes,
  type,
  dateAccepted,
  status,
  cost
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        clientName,
        clientContactPerson,
        clientEmail,
        clientPhone,
        clientNotes,
        type,
        dateAccepted,
        status,
        cost,
      },
    ])
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to create deal.'));
  return data;
}

export async function getDeals() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .select('*');
  if (error) throw new Error(formatDbError(error, 'Failed to load deals.'));
  return data || [];
}

export async function updateDeal(
  id,
  clientName,
  clientContactPerson,
  clientEmail,
  clientPhone,
  clientNotes,
  type,
  dateAccepted,
  status,
  cost
) {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('orders')
    .update({
      clientName,
      clientContactPerson,
      clientEmail,
      clientPhone,
      clientNotes,
      type,
      dateAccepted,
      status,
      cost,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to update deal.'));
  return data;
}

export async function deleteDeal(id) {
  const supabase = getSupabaseClient();

  // Keep application-level cascade explicit for reliability across environments.
  const { error: paymentError } = await supabase
    .from('payments')
    .delete()
    .eq('orderId', id);
  if (paymentError) throw new Error(formatDbError(paymentError, 'Failed to remove related payments.'));

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete deal.'));
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

export async function updatePayment(id, orderId, amount, date, method, options = {}) {
  const supabase = getSupabaseClient();

  const { hours, comment } = options;
  const normalizedHours = Number(hours);
  const shouldStoreHours = Number.isFinite(normalizedHours) && normalizedHours > 0;

  const paymentUpdate = { orderId, amount, date, method, comment: null, hours: null };
  if (typeof comment === 'string' && comment.trim()) {
    paymentUpdate.comment = comment.trim();
  }
  if (shouldStoreHours) {
    paymentUpdate.hours = normalizedHours;
  }

  const { data, error } = await supabase
    .from('payments')
    .update(paymentUpdate)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to update payment.'));

  return data;
}

export async function deletePayment(id) {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete payment.'));
}
