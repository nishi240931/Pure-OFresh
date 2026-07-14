import React from 'react';

export const TermsPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 min-h-[85vh] font-sans text-slate-800 space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-slate-800">Terms & Conditions</h1>
      <p className="text-slate-450 text-[10px] font-bold">Last Updated: July 13, 2026</p>
      
      <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-550">
        <p>
          Welcome to Pure O Fresh. By using our website, application, or purchasing items, you agree to comply with and be bound by the following terms of service.
        </p>

        <h3 className="font-display text-sm font-bold text-slate-805 pt-2">1. Delivery Logistics & Availability</h3>
        <p>
          We aim to deliver organic baskets within chosen timeframes:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Delivery slots are subject to availability and weather/traffic conditions.</li>
          <li> Rerouting delivery addresses after order shipment confirmation is not supported.</li>
        </ul>

        <h3 className="font-display text-sm font-bold text-slate-805 pt-2">2. Pricing, Coupons & Payments</h3>
        <p>
          Store prices are subject to change without notice:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Coupons are only valid for their specified duration, terms, and purchase minimums.</li>
          <li>For COD, payment must be handed over or scanned before delivery partner departures.</li>
        </ul>

        <h3 className="font-display text-sm font-bold text-slate-805 pt-2">3. Return, Quality Checked & Refunds</h3>
        <p>
          Customer satisfaction is guaranteed:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fresh food items can be returned within 24 hours of delivery if quality is compromised.</li>
          <li>Approved refunds are credited to the user's payment account within 3-5 business days.</li>
        </ul>
      </div>
    </div>
  );
};

export default TermsPage;
