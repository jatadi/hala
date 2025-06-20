import Link from 'next/link';

type RaceCardProps = {
  name: string;
  imageUrl: string;
  date: string;
  raceId: number;
};

export function RaceCard({ name, imageUrl, date, raceId }: RaceCardProps) {
  return (
    <Link href={`/races/${raceId}`} className="block">
      <div className="group w-48 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-hala-orange/50 transition-all duration-300">
        {/* Image Container with 2:3 ratio */}
        <div className="aspect-[2/3] relative overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          {/* Year banner on hover */}
          <div className="absolute top-0 left-0 right-0 bg-black/75 translate-y-[-100%] group-hover:translate-y-0 transition-transform duration-300 py-1">
            <p className="text-white text-sm font-medium text-center">{date}</p>
          </div>
        </div>

        {/* Race Name Only */}
        <div className="p-2 text-center">
          <h3 className="text-white text-sm font-medium truncate">{name}</h3>
        </div>
      </div>
    </Link>
  );
} 