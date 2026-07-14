import React from 'react';

export const PrivacyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 min-h-[85vh] font-sans text-slate-800 space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-slate-800">Privacy Policy</h1>
      <p className="text-slate-450 text-[10px] font-bold">Last Updated: July 13, 2026</p>
      
      <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-550">
        <p>
          At Pure O Fresh, we value your trust and prioritize protecting your privacy. This policy explains how we collect, store, and utilize your personal data when you use our website, mobile application, and delivery services.
        </p>

        <h3 className="font-display text-sm font-bold text-slate-805 pt-2">1. Personal Information We Collect</h3>
        <p>
          We collect personal data that you provide during account creation, checkout, or form submissions:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Contact details: Name, Email Address, and Phone Number.</li>
          <li>Delivery settings: Saved addresses, delivery slot preferences, and maps locations.</li>
          <li>Transaction logs: Purchased items, order totals, and payment status (COD/online).</li>
        </ul>

        <h3 className="font-display text-sm font-bold text-slate-805 pt-2">2. How We Utilize Your Data</h3>
        <p>
          Your data allows us to fulfill delivery orders successfully:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Processing orders, managing payments, and coordinate delivery routes.</li>
          <li>Sending SMS/email notifications about delivery progress.</li>
          <li>Sharing marketing coupons, discount vouchers, and daily deals.</li>
        </ul>

        <h3 className="font-display text-sm font-bold text-slate-805 pt-2">3. Payment & Security Protections</h3>
        <p>
          All transaction data is processed securely:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Credit card/UPI info is processed directly via secure PCI-DSS compliant gateways like Razorpay.</li>
          <li>We utilize SSL encryption across all website pages to prevent third-party data interception.</li>
        </ul>
      </div>
    </div>
  );
};

export default PrivacyPage;
