const CITY_LINKS = [
  "Ahmedabad",
  "Gandhinagar",
  "Mehsana",
  "Himmatnagar",
  "Modasa",
  "Surat",
  "Vadodara",
  "Rajkot",
  "Bhavnagar",
  "Jamnagar",
  "Morbi",
  "Vapi",
];

const GOOGLE_GUJARAT_EMBED_URL = "https://www.google.com/maps?q=Ahmedabad%2C%20Gujarat%2C%20India&z=7&output=embed";

const DistributionMap = () => {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="relative">
        <iframe
          src={GOOGLE_GUJARAT_EMBED_URL}
          title="Vayu Packaging Distribution Coverage in Gujarat"
          className="h-[420px] w-full md:h-[500px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />

        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-primary/20 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm md:text-sm">
          HQ: Ahmedabad, Gujarat
        </div>
      </div>

      <div className="border-t border-border bg-secondary/40 px-4 py-4 md:px-6">
        <p className="text-xs md:text-sm text-muted-foreground mb-3">
          Explore our delivery reach city-wise on Google Maps:
        </p>
        <div className="flex flex-wrap gap-2">
          {CITY_LINKS.map((city) => (
            <a
              key={city}
              href={`https://www.google.com/maps/search/${encodeURIComponent(`${city}, Gujarat, India`)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary md:text-sm"
            >
              {city}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DistributionMap;