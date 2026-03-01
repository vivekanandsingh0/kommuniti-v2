const testimonials = [
  {
    quote:
      "Kommuniti changed the way I see the world. The connections I made through Kommute are friendships for life.",
    name: "Priya Sharma",
    country: "India",
    initials: "PS",
  },
  {
    quote:
      "Being part of this community gave me the courage to share my story. Konnect made my voice heard across borders.",
    name: "Carlos Mendes",
    country: "Brazil",
    initials: "CM",
  },
  {
    quote:
      "Kreate helped me turn my passion project into a real initiative that's impacting hundreds of students.",
    name: "Aisha Okafor",
    country: "Nigeria",
    initials: "AO",
  },
  {
    quote:
      "The retro spirit of Kommuniti is infectious. It's modern community building with heart and soul.",
    name: "Yuki Tanaka",
    country: "Japan",
    initials: "YT",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 px-4 bg-secondary/5">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-pixel text-sm sm:text-base md:text-lg text-center text-foreground mb-4">
          VOICES OF KOMMUNITI
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Stories from our global community
        </p>

        {/* Horizontal scroll */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="retro-card min-w-[300px] sm:min-w-[340px] snap-start flex flex-col"
            >
              {/* Avatar */}
              <div className="w-12 h-12 border-[3px] border-primary bg-primary/20 flex items-center justify-center mb-4">
                <span className="font-pixel text-[8px] text-primary">
                  {t.initials}
                </span>
              </div>

              <p className="text-foreground/80 text-sm leading-relaxed flex-1 mb-4">
                "{t.quote}"
              </p>

              <div>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="font-pixel text-[8px] text-muted-foreground">{t.country}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
