// Hero section generada por Web Agent
export function HeroSection({ title, subtitle, ctaText }: {
  title: string;
  subtitle: string;
  ctaText: string;
}) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">{title}</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">{subtitle}</p>
        <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
          {ctaText}
        </button>
      </div>
    </section>
  );
}