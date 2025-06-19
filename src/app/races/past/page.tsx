import { Navbar } from '@/components/navbar';
import { SeasonNavigation } from '@/components/match/SeasonNavigation';
import { RaceCard } from '@/components/match/RaceCard';

// Example data - will be replaced with real data later
const exampleRaces = [
  {
    name: "Abu Dhabi Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245036/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Abu%20Dhabi%20carbon.png.transform/3col/image.png",
    date: "2023"
  },
  {
    name: "Las Vegas Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245030/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Las%20Vegas%20carbon.png.transform/3col/image.png",
    date: "2023"
  },
  {
    name: "Brazilian Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245033/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Brazil%20carbon.png.transform/3col/image.png",
    date: "2023"
  },
  {
    name: "Mexico City Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245031/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Mexico%20carbon.png.transform/3col/image.png",
    date: "2023"
  },
  {
    name: "United States Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245034/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/United%20States%20carbon.png.transform/3col/image.png",
    date: "2023"
  },
  {
    name: "Qatar Grand Prix",
    imageUrl: "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245032/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Qatar%20carbon.png.transform/3col/image.png",
    date: "2023"
  }
];

export default function PastRacesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hala-blue via-slate-900 to-hala-dark">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Past F1 Races</h1>
            <p className="text-gray-400">Review and rate completed Formula 1 races</p>
          </div>

          <SeasonNavigation currentPage="past" />

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