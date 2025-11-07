import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-serif text-amber-400 mb-4">
            404
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-slate-100 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 border-2 border-slate-700 text-slate-300 hover:bg-slate-800/50 font-semibold rounded-lg transition-all"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Decorative */}
        <div className="mt-12">
          <p className="text-slate-500 text-sm">
            Lost? Try searching or contact support if you need help.
          </p>
        </div>
      </div>
    </div>
  );
}
