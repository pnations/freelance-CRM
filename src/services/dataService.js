import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import {
  addDemoDeal,
  addDemoPayment,
  deleteDemoDeal,
  deleteDemoPayment,
  getDemoDeals,
  getDemoPayments,
  updateDemoDeal,
  updateDemoPayment,
} from './demoData';

// Table names in Supabase. Using constants prevents typos and makes renaming easier.
const TABLES = {
  DEALS: 'orders',
  PAYMENTS: 'payments',
};

// A configured but empty Supabase project is still a demo experience. Decide the
// data source once per session so every screen uses the same records.
let dataMode = isSupabaseConfigured ? 'unknown' : 'demo';

async function shouldUseDemoData() {
  if (dataMode !== 'unknown') {
    return dataMode === 'demo';
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from(TABLES.DEALS)
    .select('id')
    .limit(1);

  // This is a demo-first app: an unavailable Supabase project should never
  // leave the preview blank. Use the local sample workspace instead.
  if (error) {
    dataMode = 'demo';
    return true;
  }

  dataMode = data?.length ? 'supabase' : 'demo';
  return dataMode === 'demo';
}

/**
 * Formats Supabase errors into user-friendly messages.
 * Falls back to a default message if no error details are available.
 */
function formatDbError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  return error.message || fallbackMessage;
}

/**
 * Builds a standardized payload for deal insertions/updates.
 * Ensures all required fields are included and optional ones are handled.
 */
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

/**
 * Builds a payload for payment operations.
 * Normalizes optional hours (only stores if positive number) and trims comments.
 */
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

/**
 * Creates a new deal in the database.
 * Inserts into the 'orders' table and returns the created record.
 */
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
  if (await shouldUseDemoData()) {
    return addDemoDeal(buildDealPayload(
      clientName, clientContactPerson, clientEmail, clientPhone, clientNotes, type, dateAccepted, status, cost,
    ));
  }

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

/**
 * Retrieves all deals from the database.
 */
export async function getDeals() {
  if (await shouldUseDemoData()) return getDemoDeals();

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLES.DEALS)
    .select('*');
  if (error) throw new Error(formatDbError(error, 'Failed to load deals.'));
  return data || [];
}

/**
 * Updates an existing deal by ID.
 * Replaces all fields with the provided values.
 */
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
  if (await shouldUseDemoData()) {
    return updateDemoDeal(id, buildDealPayload(
      clientName, clientContactPerson, clientEmail, clientPhone, clientNotes, type, dateAccepted, status, cost,
    ));
  }

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

/**
 * Deletes a deal and its related payments.
 * 
 * This performs a cascade delete: payments linked to the deal (via orderId)
 * are removed first to maintain data integrity, since payments depend on deals.
 * If payment deletion fails, the deal is not deleted.
 */
export async function deleteDeal(id) {
  if (await shouldUseDemoData()) {
    deleteDemoDeal(id);
    return;
  }

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
/**
 * Logs a new payment for a deal.
 * Inserts into the 'payments' table with optional hours and comment.
 */
export async function addPayment(orderId, amount, date, method, options = {}) {
  if (await shouldUseDemoData()) {
    return addDemoPayment(buildPaymentPayload(orderId, amount, date, method, options));
  }

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

/**
 * Retrieves all payments from the database.
 * Returns an empty array if no payments exist.
 */
export async function getPayments() {
  if (await shouldUseDemoData()) return getDemoPayments();

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from(TABLES.PAYMENTS)
    .select('*');
  if (error) throw new Error(formatDbError(error, 'Failed to load payments.'));
  return data || [];
}

/**
 * Updates an existing payment by ID.
 * Resets hours/comment to null if not provided, to avoid stale data.
 */
export async function updatePayment(id, orderId, amount, date, method, options = {}) {
  if (await shouldUseDemoData()) {
    const paymentUpdate = { orderId, amount, date, method, comment: null, hours: null };
    const normalizedHours = Number(options.hours);
    if (typeof options.comment === 'string' && options.comment.trim()) paymentUpdate.comment = options.comment.trim();
    if (Number.isFinite(normalizedHours) && normalizedHours > 0) paymentUpdate.hours = normalizedHours;
    return updateDemoPayment(id, paymentUpdate);
  }

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

/**
 * Deletes a payment by ID.
 * No cascade needed since payments don't have dependents.
 */
export async function deletePayment(id) {
  if (await shouldUseDemoData()) {
    deleteDemoPayment(id);
    return;
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from(TABLES.PAYMENTS)
    .delete()
    .eq('id', id);
  if (error) throw new Error(formatDbError(error, 'Failed to delete payment.'));
}
