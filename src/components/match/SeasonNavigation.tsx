type SeasonNavigationProps = {
  currentPage: 'past' | '2025' | 'upcoming' | 'all';
};

export function SeasonNavigation({ currentPage }: SeasonNavigationProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-8">
      <div className="flex flex-wrap gap-4">
        <a 
          href="/races/past" 
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'past' 
              ? 'bg-hala-orange hover:bg-orange-600' 
              : 'bg-white/10 hover:bg-white/20'
          } text-white font-medium transition-colors`}
        >
          Past Races
        </a>
        <a 
          href="/races/2025" 
          className={`px-4 py-2 rounded-lg ${
            currentPage === '2025' 
              ? 'bg-hala-orange hover:bg-orange-600' 
              : 'bg-white/10 hover:bg-white/20'
          } text-white font-medium transition-colors`}
        >
          2025 Season
        </a>
        <a 
          href="/races/upcoming" 
          className={`px-4 py-2 rounded-lg ${
            currentPage === 'upcoming' 
              ? 'bg-hala-orange hover:bg-orange-600' 
              : 'bg-white/10 hover:bg-white/20'
          } text-white font-medium transition-colors`}
        >
          Upcoming
        </a>
      </div>
    </div>
  );
} 