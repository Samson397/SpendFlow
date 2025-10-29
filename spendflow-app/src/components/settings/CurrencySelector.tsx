'use client';

import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Globe, Check, X } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 border border-slate-700 text-slate-300 hover:border-amber-600 hover:text-amber-400 transition-colors tracking-wider uppercase text-xs w-full justify-center"
      >
        <Globe className="h-4 w-4" />
        {currency.symbol} {currency.code}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Modal */}
            <div
              className="bg-slate-950 border border-amber-700/30 rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden mx-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif text-slate-100 tracking-wide mb-1">
                    SELECT CURRENCY
                  </h2>
                  <p className="text-slate-500 text-xs md:text-sm tracking-wider">Choose your preferred currency</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>

              {/* Currency Grid */}
              <div className="p-3 md:p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                  {availableCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setIsOpen(false);
                      }}
                      className={`p-3 md:p-6 border rounded-lg transition-all text-left ${
                        currency.code === curr.code
                          ? 'border-amber-600 bg-amber-900/10'
                          : 'border-slate-800 hover:border-amber-600/50 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <span className="text-2xl md:text-4xl">{curr.symbol}</span>
                        {currency.code === curr.code && (
                          <Check className="h-4 w-4 md:h-6 md:w-6 text-amber-400" />
                        )}
                      </div>
                      <div className="text-base md:text-xl font-serif text-slate-100 mb-0.5 md:mb-1">{curr.code}</div>
                      <div className="text-slate-500 text-xs md:text-sm tracking-wide truncate">{curr.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 md:p-6 border-t border-slate-800 bg-slate-900/30">
                <div className="text-center text-slate-500 text-xs tracking-wider">
                  Saved automatically
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
