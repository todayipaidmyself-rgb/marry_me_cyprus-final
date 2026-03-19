import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const team = [
  {
    name: "Elena Papadopoulos",
    role: "Lead Planner",
    bio: "Crafts luxury destination weddings across Cyprus with meticulous detail.",
    image: "/team/elena.jpg",
  },
  {
    name: "Marcus Le Roux",
    role: "Creative Director",
    bio: "Designs immersive aesthetics—lighting, florals, and guest experience.",
    image: "/team/marcus.jpg",
  },
  {
    name: "Sophia Christou",
    role: "Guest Experience",
    bio: "Travel, accommodation, and concierge for every guest touchpoint.",
    image: "/team/sophia.jpg",
  },
];

export default function Team() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="container mx-auto px-4 py-16 md:py-20 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-[#C6B4AB]">
            Meet the Team
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white">
            Your Cyprus Wedding Crew
          </h1>
          <p className="text-white/70 max-w-3xl mx-auto">
            Planners, designers, and guest-experience specialists ready to
            orchestrate every moment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map(member => (
            <Card
              key={member.name}
              className="bg-white/5 border-white/10 text-white overflow-hidden"
            >
              <div className="h-48 bg-white/10">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect fill='%23000' width='600' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C6B4AB' font-family='serif' font-size='20'%3E" +
                      member.name +
                      "%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">
                  {member.name}
                </CardTitle>
                <p className="text-[#C6B4AB] text-sm uppercase tracking-wide">
                  {member.role}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 text-sm leading-relaxed">
                  {member.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
