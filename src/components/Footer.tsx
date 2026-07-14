'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-primary-dark text-slate-300 font-sans border-t border-slate-900">
      
      {/* Trust Badges Bar */}
      <div className="border-b border-white/5 bg-black/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 rounded-full bg-white/5 text-primary">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Express Delivery</h4>
              <p className="text-xs text-slate-400">Fresh greens at your door within 1 hour</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 rounded-full bg-white/5 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">100% Quality Checked</h4>
              <p className="text-xs text-slate-400">Handpicked organic products, zero pesticides</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 rounded-full bg-white/5 text-primary">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-white text-sm font-bold">Easy 24h Returns</h4>
              <p className="text-xs text-slate-400">No questions asked return policy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand Description Column */}
        <div className="lg:col-span-2 space-y-5">
          <Logo light={true} />
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Pure O Fresh is committed to bringing you the freshest organic fruits, vegetables, dairy, and daily essentials sourced directly from standard local farms. Experience quality and lightning-fast delivery at your fingertips.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-primary transition text-slate-400 hover:text-white" aria-label="Facebook">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
            </a>
            <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-primary transition text-slate-400 hover:text-white" aria-label="Twitter">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-primary transition text-slate-400 hover:text-white" aria-label="Instagram">
              <svg className="h-4 w-4 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" className="p-2.5 rounded-full bg-white/5 hover:bg-primary transition text-slate-400 hover:text-white" aria-label="Youtube">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.163c-.272-1.016-1.071-1.815-2.088-2.087-1.848-.495-9.26-.495-9.26-.495s-7.412 0-9.26.495c-1.017.272-1.816 1.071-2.088 2.087-.495 1.848-.495 9.26-.495 9.26s0 7.412.495 9.26c.272 1.017 1.071 1.816 2.088 2.088 1.848.495 9.26.495 9.26.495s7.412 0 9.26-.495c1.017-.272 1.816-1.071 2.088-2.088.495-1.848.495-9.26.495-9.26s0-7.412-.495-9.26zm-13.882 11.396v-7.118l6.19 3.559-6.19 3.559z"/></svg>
            </a>
          </div>
        </div>

        {/* Categories Links */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Categories</h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li><Link href="/products?category=fruits" className="hover:text-primary transition">Fresh Fruits</Link></li>
            <li><Link href="/products?category=vegetables" className="hover:text-primary transition">Fresh Vegetables</Link></li>
            <li><Link href="/products?category=dairy-eggs" className="hover:text-primary transition">Dairy & Eggs</Link></li>
            <li><Link href="/products?category=organic" className="hover:text-primary transition">Organic Specials</Link></li>
            <li><Link href="/products?category=beverages" className="hover:text-primary transition">Fresh Beverages</Link></li>
            <li><Link href="/products?category=essentials" className="hover:text-primary transition">Daily Essentials</Link></li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-xs text-slate-400 font-medium">
            <li><Link href="/about" className="hover:text-primary transition">About Our Brand</Link></li>
            <li><Link href="/offers" className="hover:text-primary transition">Discounts & Offers</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition">Frequently Asked FAQ</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition">Terms & Conditions</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition">Support & Contact</Link></li>
          </ul>
        </div>

        {/* Newsletter & Contact */}
        <div className="space-y-4">
          <h4 className="text-white text-sm font-bold uppercase tracking-wider">Stay Fresh</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Subscribe to our newsletter for exclusive offers, recipes, and organic eating tips.
          </p>
          <form onSubmit={handleSubscribe} className="relative mt-2">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 pl-3 pr-10 rounded-full bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-primary text-white"
              required
            />
            <button
              type="submit"
              className="absolute right-1 top-1 p-1.5 rounded-full bg-primary hover:bg-primary-dark transition text-white"
              aria-label="Subscribe"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
          {subscribed && (
            <span className="text-[10px] text-primary font-bold block animate-fade-in">
              Subscribed successfully! Thank you.
            </span>
          )}

          <div className="space-y-2 pt-2 text-xs text-slate-400 font-semibold border-t border-white/5">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>support@pureofresh.com</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span className="leading-tight">100, Green City Road, Indiranagar, Bengaluru, 560038</span>
            </div>
          </div>
        </div>

      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 bg-black/20 py-6 text-xs text-center font-medium text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Pure O Fresh Delivery Services Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition cursor-default">Security Verified</span>
            <span className="hover:text-slate-400 transition cursor-default">SSL Encrypted</span>
            <span className="hover:text-slate-400 transition cursor-default">Razorpay Secure</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
export default Footer;
