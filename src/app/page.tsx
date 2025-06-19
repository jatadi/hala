import { Navbar } from '@/components/navbar';
import { UpcomingRaces } from '@/components/match/UpcomingRaces';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hala-blue via-slate-900 to-hala-dark">
      <Navbar />

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            <span className="text-hala-orange">Track</span> Every Race.
            <br />
            <span className="text-hala-orange">Rate</span> Every Match.
            <br />
            <span className="text-hala-orange">Share</span> Your Journey.
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The social network for sports fans. Log every F1 race you watch, 
            rate your favorites, and discover what your friends are watching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-hala-orange text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg">
              Start Your Diary
            </button>
          </div>

          {/* Upcoming Races */}
          <UpcomingRaces />

          {/* Feature Preview Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-hala-orange rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Quick Logging</h3>
              <p className="text-gray-300 text-sm">
                "Zap it" - Log races with one tap and rate them.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-hala-orange rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">👥</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Social Discovery</h3>
              <p className="text-gray-300 text-sm">
                Follow friends and discover new races together.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center">
              <div className="w-10 h-10 bg-hala-orange rounded-lg mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🏆</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Spoiler-Safe</h3>
              <p className="text-gray-300 text-sm">
                Smart timeline that respects your viewing schedule.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 Hala. The social diary for sports fans.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
