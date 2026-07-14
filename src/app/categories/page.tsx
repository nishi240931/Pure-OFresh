'use client';

import React from 'react';
import Link from 'next/link';
import { mockCategories } from '@/lib/mockData';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export const CategoriesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-[85vh] font-sans">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-primary font-bold text-xs uppercase tracking-widest block mb-2">Our Departments</span>
        <h1 className="font-display text-4xl font-extrabold text-slate-800">Fresh Organic Collections</h1>
        <p className="text-sm text-slate-500 font-semibold mt-3">
          Explore our handpicked organic fields. Sourced straight from local certified agricultural partners, ensuring standard fresh quality.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {mockCategories.map((cat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            key={cat.id}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image */}
            <div className="h-48 relative overflow-hidden bg-slate-50 shrink-0">
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <span className="bg-primary text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Organic
                </span>
                <h3 className="font-display text-lg font-bold mt-1.5 leading-none">{cat.name}</h3>
              </div>
            </div>

            {/* Description and CTA */}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <p className="text-slate-500 text-xs leading-relaxed font-medium mb-6">
                {cat.description || 'Experience standard certified organic products free from additives.'}
              </p>
              
              <Link
                href={`/products?category=${cat.slug}`}
                className="w-full py-2.5 bg-slate-50 border border-slate-150 text-slate-700 group-hover:bg-primary group-hover:text-white group-hover:border-primary text-xs font-bold rounded-full text-center flex items-center justify-center gap-1.5 transition-all duration-300"
              >
                Shop Department
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default CategoriesPage;
