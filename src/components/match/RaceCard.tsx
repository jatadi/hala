import Link from 'next/link';

type RaceCardProps = {
  name: string;
  imageUrl: string;
  date: string;
  raceId: number;
  round: number;
  circuit: string;
};

export function RaceCard({ name, imageUrl, date, raceId, round, circuit }: RaceCardProps) {
  return (
    <Link href={`/races/${raceId}`} className="block">
      <div className="group w-48 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-hala-orange/50 transition-all duration-300">
        {/* Image Container with 2:3 ratio */}
        <div className="aspect-[2/3] relative overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Round number badge */}
          <div className="absolute top-2 left-2 bg-black/75 px-2 py-1 rounded">
            <p className="text-white text-xs font-medium">Round {round}</p>
          </div>
          {/* Date banner on hover */}
          <div className="absolute top-0 left-0 right-0 bg-black/75 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 py-1">
            <p className="text-white text-sm font-medium text-center">{date}</p>
          </div>
        </div>

        {/* Race Name and Circuit */}
        <div className="p-2 text-center">
          <h3 className="text-white text-sm font-medium truncate">{name}</h3>
          <p className="text-white/70 text-xs truncate mt-1">{circuit}</p>
        </div>
      </div>
    </Link>
  );
} 