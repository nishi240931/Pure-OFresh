import React from 'react';
import Link from 'next/link';
import { ArrowRight, Check, ShieldCheck, Heart, Users } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans text-slate-800 space-y-16">
      
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-primary font-bold text-xs uppercase tracking-widest">Our Story</span>
        <h1 className="font-display text-4xl font-extrabold text-slate-800 leading-tight">
          Bringing the Purity of Nature <br/>
          <span className="text-primary">Straight to Your Home</span>
        </h1>
        <p className="text-sm text-slate-500 font-semibold leading-relaxed">
          Pure O Fresh was born from a simple mission: connecting urban families with organic farmers. We believe everyone deserves access to fresh, premium vegetables, chemical-free milk, and whole grains.
        </p>
      </div>

      {/* Vision & Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-slate-800">Freshness First, Always.</h2>
          <p className="text-slate-500 text-xs leading-relaxed font-semibold">
            We partner with certified regional organic agriculture communities. By removing long shipping timelines and middleman warehouses, we pluck and deliver greens within hours of harvest.
          </p>
          <div className="space-y-3.5 text-xs font-semibold text-slate-655">
            <div className="flex items-center gap-2">
              <Check className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Certified 100% Organic Products</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Sourced Directly from Standard Local Farms</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Rigorous Multi-level Quality Verification</span>
            </div>
          </div>
        </div>

        <div className="h-72 rounded-3xl overflow-hidden shadow-lg border border-slate-100 bg-slate-50">
          <img
            src="https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=600&auto=format&fit=crop&q=80"
            alt="Organic farming fields"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Stat Numbers */}
      <div className="bg-primary/5 rounded-3xl border border-primary/10 p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="space-y-1">
          <p className="text-3xl font-extrabold text-primary">50+</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Organic Farm Partners</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-extrabold text-primary">10k+</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Happy Customers</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-extrabold text-primary">1 Hr</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Delivery Time</p>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-extrabold text-primary">100%</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Freshness Guarantee</p>
        </div>
      </div>

      {/* Meet the founders / Visionaries */}
      <div className="space-y-10">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="font-display text-2xl font-bold text-slate-800">Our Core Pillars</h2>
          <p className="text-xs text-slate-450 font-semibold">The values driving every shipment of organic vegetables and groceries we make.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3.5 text-center">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Trust & Quality</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">Every vegetable is sanitized with standard wash cycles, keeping it pure, healthy, and nutritious.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3.5 text-center">
            <div className="h-10 w-10 bg-rose-100 text-rose-850 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Farmer Welfare</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">We pay fair pricing directly to the agricultural partners, building long-term sustainable farming.</p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3.5 text-center">
            <div className="h-10 w-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Community Healthy</h3>
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">Making organic food affordable so everyone can eat clean, live healthy, and feel great.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
