'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';

export const ContactPage = () => {
  const addNotification = useStore((state) => state.addNotification);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && subject && message) {
      setSubmitted(true);
      addNotification('Message Sent ✉️', `Thank you ${name}. Our help desk team will review your ticket within 2 hours.`);
      
      // reset form
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-primary font-bold text-xs uppercase tracking-widest">Get In Touch</span>
        <h1 className="font-display text-4xl font-extrabold text-slate-800">We are Here to Help</h1>
        <p className="text-sm text-slate-500 font-semibold">Have questions about our organic vegetables, delivery slots, or partnership suggestions?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start max-w-5xl mx-auto">
        
        {/* Contact Info Cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-150">Customer Support</h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-655">
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-800 font-extrabold text-xs">Call Us Directly</p>
                  <p className="text-slate-500 mt-1">+91 98765 43210</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Mon - Sun: 7:00 AM - 9:00 PM</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-800 font-extrabold text-xs">Email Helpdesk</p>
                  <p className="text-slate-500 mt-1">support@pureofresh.com</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Average reply time: 2 hours</p>
                </div>
              </div>

              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-800 font-extrabold text-xs">Headquarters</p>
                  <p className="text-slate-500 mt-1 leading-relaxed">
                    100, Green City Road, Indiranagar, Bengaluru, Karnataka 560038
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-display text-lg font-bold text-slate-800">Send Us a Message</h3>

            {submitted && (
              <p className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex items-center gap-1.5 animate-fade-in">
                <Check className="h-4.5 w-4.5" />
                Thank you! Your message was submitted successfully.
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-650">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Your Name</label>
                  <input
                    type="text"
                    placeholder="Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 outline-none focus:border-primary text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="aarav@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 outline-none focus:border-primary text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Inquiry about organic farm sourcing..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 outline-none focus:border-primary text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Message Body</label>
                <textarea
                  rows={5}
                  placeholder="Detail your request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 outline-none focus:border-primary text-slate-800"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-full text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Message
              </button>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
};

export default ContactPage;
