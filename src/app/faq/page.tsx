'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How does Pure O Fresh guarantee the freshness of its produce?',
    a: 'We eliminate warehouse middle-steps. Our vegetables and fruits are sourced directly from certified organic farm partners, hand-picked early morning, quality checked, washed with standard clean cycles, and shipped straight to your doorstep within hours.'
  },
  {
    q: 'Is there a minimum order amount for free delivery?',
    a: 'Yes, we offer FREE delivery on all grocery orders above $15.00. For orders below $15.00, a small standard delivery fee of $1.99 applies.'
  },
  {
    q: 'What is the return policy if I am not satisfied with the quality?',
    a: 'We offer an easy 24-hour return policy. If any item delivered does not meet your quality expectations, you can request a return directly from the dashboard or by contacting help support. No questions asked return or replacement.'
  },
  {
    q: 'Do you deliver in my location?',
    a: 'We currently deliver across all major residential sectors in Bengaluru, including Indiranagar, HSR Layout, Sarjapur, Whitefield, and Koramangala. Enter your location at checkout to see active slot times.'
  },
  {
    q: 'How can I pay for my grocery baskets?',
    a: 'We support multiple secure checkout methods. You can pay online instantly via Razorpay using UPI, cards, and netbanking, or choose Cash on Delivery (COD) and scan our QR code during delivery partner arrival.'
  }
];

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 min-h-[85vh] font-sans text-slate-800">
      
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
        <span className="text-primary font-bold text-xs uppercase tracking-widest">Help Center</span>
        <h1 className="font-display text-3xl font-extrabold text-slate-800 flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-500 font-semibold">Everything you need to know about organic grocery delivery.</p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full text-left p-5 flex justify-between items-center gap-4 text-slate-800 hover:text-primary transition font-bold text-xs"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4.5 w-4.5 text-slate-400 shrink-0 transform transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-primary' : ''
                }`} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-slate-500 text-xs leading-relaxed font-semibold border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default FAQPage;
