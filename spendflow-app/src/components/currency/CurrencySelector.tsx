'use client';

import { useCurrency } from '@/contexts/CurrencyContext';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export function CurrencySelector() {
  const { currency, setCurrency, availableCurrencies, detectCurrencyFromLocation } = useCurrency();

  const handleDetectLocation = async () => {
    try {
      await detectCurrencyFromLocation();
      // Remove saved currency preference so auto-detection works
      localStorage.removeItem('preferredCurrency');
    } catch (error) {
      console.error('Failed to detect currency from location:', error);
    }
  };

  if (!currency) return null;

  return (
    <Menu as="div" className="relative inline-block text-left w-full">
      <div>
        <Menu.Button className="inline-flex w-full justify-between items-center rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
          <span>{currency.symbol} {currency.code}</span>
          <ChevronDownIcon
            className="h-4 w-4 text-slate-300"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 mt-2 w-full origin-top-left rounded-md bg-slate-800 shadow-lg ring-1 ring-black/5 focus:outline-none z-50">
          <div className="px-1 py-1">
            {/* Detect from Location Option */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleDetectLocation}
                  className={`${
                    active ? 'bg-slate-700 text-white' : 'text-slate-200'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  🌍 Auto-detect from location
                </button>
              )}
            </Menu.Item>

            {/* Currency Options */}
            {availableCurrencies.map((curr) => (
              <Menu.Item key={curr.code}>
                {({ active }) => (
                  <button
                    onClick={() => setCurrency(curr.code)}
                    className={`${
                      active ? 'bg-slate-700 text-white' : 'text-slate-200'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    {curr.symbol} {curr.name} ({curr.code})
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
