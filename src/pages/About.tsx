"use client";

export default function About() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About BuzzyMuzzy</h1>
      <p className="text-muted-foreground mb-6">
        BuzzyMuzzy is a platform that transforms any drawing into a custom toy.
        We bring your imagination to life with our innovative 3D printing
        technology and expert craftsmanship.
      </p>

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          Our mission is to make creativity accessible to everyone. Whether
          you're a child with a vivid imagination or an adult with a unique
          design idea, we're here to turn your vision into reality.
        </p>
        <p>
          With fast turnaround times, quality guarantee, and risk-free ordering,
          we make the process simple and enjoyable.
        </p>
      </div>
    </div>
  );
}
