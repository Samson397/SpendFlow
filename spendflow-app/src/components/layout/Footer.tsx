import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <Link href="/privacy" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-amber-400 transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
          <div className="mt-4 md:mt-0 flex items-center justify-center md:justify-end">
            <p className="text-slate-500 text-sm flex items-center">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-rose-500" />
              <span>© {currentYear} SpendFlow. All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
