const DEMO_STORAGE_KEY = 'freelance-crm-demo-data';

const INITIAL_DEMO_DATA = {
  deals: [
    {
      id: 'demo-deal-1',
      clientName: 'Northstar Coffee Co.',
      clientContactPerson: 'Maya Chen',
      clientEmail: 'maya@northstarcoffee.example',
      clientPhone: '(512) 555-0142',
      clientNotes: 'Monthly design support and seasonal campaign work.',
      type: 'Brand Refresh',
      dateAccepted: '2026-09-12',
      status: 'In Progress',
      cost: 4800,
    },
    {
      id: 'demo-deal-2',
      clientName: 'Harbor & Pine',
      clientContactPerson: 'Jordan Blake',
      clientEmail: 'jordan@harborpine.example',
      clientPhone: '(773) 555-0188',
      clientNotes: 'E-commerce launch with product photography coordination.',
      type: 'E-commerce Website',
      dateAccepted: '2026-08-26',
      status: 'Invoiced',
      cost: 7200,
    },
    {
      id: 'demo-deal-3',
      clientName: 'Sagewell Studio',
      clientContactPerson: 'Elena Torres',
      clientEmail: 'elena@sagewell.example',
      clientPhone: '(312) 555-0169',
      clientNotes: 'Content strategy and a lightweight design system.',
      type: 'Content Strategy',
      dateAccepted: '2026-07-08',
      status: 'Paid',
      cost: 3600,
    },
    {
      id: 'demo-deal-4',
      clientName: 'Willow Financial',
      clientContactPerson: 'Noah Williams',
      clientEmail: 'noah@willowfinancial.example',
      clientPhone: '(469) 555-0127',
      clientNotes: 'Discovery is complete; proposal awaits approval.',
      type: 'Discovery Workshop',
      dateAccepted: '2026-10-02',
      status: 'Pending',
      cost: 1800,
    },
  ],
  payments: [
    {
      id: 'demo-payment-1',
      orderId: 'demo-deal-1',
      amount: 2400,
      date: '2026-09-15',
      method: 'Bank Transfer',
      hours: 18,
      comment: 'Project kickoff deposit received.',
    },
    {
      id: 'demo-payment-2',
      orderId: 'demo-deal-2',
      amount: 3600,
      date: '2026-09-01',
      method: 'Credit Card',
      hours: 24,
      comment: 'First milestone payment.',
    },
    {
      id: 'demo-payment-3',
      orderId: 'demo-deal-3',
      amount: 3600,
      date: '2026-08-04',
      method: 'Bank Transfer',
      hours: 21,
      comment: 'Final invoice paid in full.',
    },
  ],
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function loadDemoData() {
  try {
    const storedData = window.localStorage.getItem(DEMO_STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData.deals) && Array.isArray(parsedData.payments)) {
        return parsedData;
      }
    }
  } catch {
    // Fall back to the in-memory seed data when storage is unavailable.
  }

  const initialData = clone(INITIAL_DEMO_DATA);
  saveDemoData(initialData);
  return initialData;
}

function saveDemoData(data) {
  try {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // The demo remains usable for this session if the browser blocks storage.
  }
}

function nextId(collection, prefix) {
  const suffixes = collection
    .map((item) => Number(String(item.id).replace(`${prefix}-`, '')))
    .filter(Number.isFinite);

  return `${prefix}-${Math.max(0, ...suffixes) + 1}`;
}

export function getDemoDeals() {
  return clone(loadDemoData().deals);
}

export function getDemoPayments() {
  return clone(loadDemoData().payments);
}

export function addDemoDeal(deal) {
  const data = loadDemoData();
  const createdDeal = { id: nextId(data.deals, 'demo-deal'), ...deal };
  data.deals.push(createdDeal);
  saveDemoData(data);
  return clone(createdDeal);
}

export function updateDemoDeal(id, changes) {
  const data = loadDemoData();
  const index = data.deals.findIndex((deal) => String(deal.id) === String(id));
  if (index === -1) throw new Error('Deal not found.');

  data.deals[index] = { ...data.deals[index], ...changes };
  saveDemoData(data);
  return clone(data.deals[index]);
}

export function deleteDemoDeal(id) {
  const data = loadDemoData();
  data.deals = data.deals.filter((deal) => String(deal.id) !== String(id));
  data.payments = data.payments.filter((payment) => String(payment.orderId) !== String(id));
  saveDemoData(data);
}

export function addDemoPayment(payment) {
  const data = loadDemoData();
  const createdPayment = { id: nextId(data.payments, 'demo-payment'), ...payment };
  data.payments.push(createdPayment);
  saveDemoData(data);
  return clone(createdPayment);
}

export function updateDemoPayment(id, changes) {
  const data = loadDemoData();
  const index = data.payments.findIndex((payment) => String(payment.id) === String(id));
  if (index === -1) throw new Error('Payment not found.');

  data.payments[index] = { ...data.payments[index], ...changes };
  saveDemoData(data);
  return clone(data.payments[index]);
}

export function deleteDemoPayment(id) {
  const data = loadDemoData();
  data.payments = data.payments.filter((payment) => String(payment.id) !== String(id));
  saveDemoData(data);
}
