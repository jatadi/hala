export function UpcomingRaces() {
  return (
    <div className="mt-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Upcoming Races</h2>
        <a href="/races" className="text-hala-orange hover:text-hala-orange-dark transition-colors text-sm">
          View All →
        </a>
      </div>
      <div className="space-y-4">
        {/* Example Race Items - Replace with real data later */}
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-hala-blue-dark rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏎️</span>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Australian Grand Prix</h3>
              <p className="text-gray-400 text-sm">Melbourne Grand Prix Circuit</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white">Mar 24</p>
            <p className="text-gray-400 text-sm">05:00 AM</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-hala-blue-dark rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏎️</span>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Japanese Grand Prix</h3>
              <p className="text-gray-400 text-sm">Suzuka Circuit</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white">Apr 7</p>
            <p className="text-gray-400 text-sm">02:00 AM</p>
          </div>
        </div>
      </div>
    </div>
  );
} 