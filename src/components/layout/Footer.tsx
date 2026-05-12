export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">V</div>
            <span className="text-white font-semibold text-lg">Voon</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 Voon. Dibuat untuk kampus Indonesia. Gratis selamanya.
          </p>
          <p className="text-gray-600 text-xs font-mono">
            Powered by LiveKit · Anthropic · Supabase · Clerk
          </p>
        </div>
      </div>
    </footer>
  );
}
