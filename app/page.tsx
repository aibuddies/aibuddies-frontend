import Link from "next/link";

export default function Page() {
  return (
    <div className="grid gap-8">
      <section className="card text-center p-12">
        <h1 className="text-4xl font-bold">AIBuddies</h1>
        <p className="mt-3 text-neutral-300">Create, repurpose and generate visuals. Pay only when you need more credits.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link className="btn btn-primary" href="/dashboard">Open Dashboard</Link>
          <Link className="btn btn-outline" href="/pricing">Buy Credits</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {[{
          title: "Repurpose Text", href: "/tools/repurpose", desc: "Adapt content for Twitter, LinkedIn and more."
        },{
          title: "Prompt Generator", href: "/tools/prompt", desc: "Get creative prompts fast."
        },{
          title: "Captions", href: "/tools/caption", desc: "Catchy captions for your images."
        }].map(card => (
          <a key={card.title} href={card.href} className="card block hover:translate-y-[-2px] transition">
            <h3 className="text-xl font-semibold">{card.title}</h3>
            <p className="mt-1 text-neutral-300">{card.desc}</p>
          </a>
        ))}
      </section>
    </div>
  );
}
