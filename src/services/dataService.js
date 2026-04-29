import { getSupabaseClient } from './supabase';

const TABLES = {
  DEALS: 'orders',
  PAYMENTS: 'payments',
};

function formatDbError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  return error.message || fallbackMessage;
}

function buildDealPayload(
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
  return {
    clientName,
    clientContactPerson,
    clientEmail,
    clientPhone,
    clientNotes,
    type,
    dateAccepted,
    status,
    cost,
  };
}

function buildPaymentPayload(orderId, amount, date, method, options = {}) {
  const payload = { orderId, amount, date, method };
  const { hours, comment } = options;
  const normalizedHours = Number(hours);
  const shouldStoreHours = Number.isFinite(normalizedHours) && normalizedHours > 0;

  if (typeof comment === 'string' && comment.trim()) {
    payload.comment = comment.trim();
  }

  if (shouldStoreHours) {
    payload.hours = normalizedHours;
  }

  return payload;
}

// Deal CRUD
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
    .from(TABLES.DEALS)
    .insert([buildDealPayload(
      clientName,
      clientContactPerson,
      clientEmail,
      clientPhone,
      clientNotes,
      type,
      dateAccepted,
      status,
      cost,
    )])
    .select()
    .single();

  if (error) throw new Error(formatDbError(error, 'Failed to create deal.'));
  return data;
}

export async function getDeals() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLES.DEALS)
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
    .from(TABLES.DEALS)
    .update(buildDealPayload(
      clientName,
      clientContactPerson,
      clientEmail,
      clientPhone,
      clientNotes,
      type,
      dateAccepted,
      status,
      cost,
    ))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(formatDbError(error, 'Failed to update deal.'));
  return data;
}

export async function deleteDeal(id) {
  const supabase = getSupabaseClient();

  // Explicitly remove related payments first so deal deletion remains reliable.
  const { error: paymentError } = await supabase
    .from(TABLES.PAYMENTS)
    .delete()
    .eq('orderId', id);
  if (paymentError) throw new Error(formatDbError(paymentError, 'Failed to remove related payments.'));

  const { error } = await supabase
    .from(TABLES.DEALS)
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete deal.'));
}

// Payment CRUD
export async function addPayment(orderId, amount, date, method, options = {}) {
  const supabase = getSupabaseClient();
  const paymentInsert = buildPaymentPayload(orderId, amount, date, method, options);

  const { data, error } = await supabase
    .from(TABLES.PAYMENTS)
    .insert([paymentInsert])
    .select()
    .single();
  if (error) throw new Error(formatDbError(error, 'Failed to log payment.'));

  return data;
}

export async function getPayments() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLES.PAYMENTS)
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
    .from(TABLES.PAYMENTS)
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
    .from(TABLES.PAYMENTS)
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete payment.'));
}
