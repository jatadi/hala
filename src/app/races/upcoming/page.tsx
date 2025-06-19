import { Navbar } from '@/components/navbar';
import { SeasonNavigation } from '@/components/match/SeasonNavigation';
import { RaceCard } from '@/components/match/RaceCard';

// Example data - will be replaced with real data later
const exampleRaces = [
  {
    name: "Australian Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245033/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Australia%20carbon.png.transform/3col/image.png",
    date: "2025"
  },
  {
    name: "Japanese Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245031/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Japan%20carbon.png.transform/3col/image.png",
    date: "2025"
  },
  {
    name: "Chinese Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245034/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/China%20carbon.png.transform/3col/image.png",
    date: "2025"
  },
  {
    name: "Miami Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Miami%20carbon.png.transform/3col/image.png",
    date: "2025"
  }
];

export default function UpcomingRacesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hala-blue via-slate-900 to-hala-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Upcoming F1 Races</h1>
            <p className="text-gray-400">Get ready for the next Formula 1 races</p>
          </div>

          <SeasonNavigation currentPage="upcoming" />

          {/* Race Grid - Centered with fixed-width cards */}
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6">
              {exampleRaces.map((race, index) => (
                <RaceCard 
                  key={index}
                  name={race.name}
                  imageUrl={race.imageUrl}
                  date={race.date}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 