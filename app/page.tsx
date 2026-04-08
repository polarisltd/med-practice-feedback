import Link from 'next/link';

export default function Home() {
  return (
    <section className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6">
      <h2 className="text-lg font-semibold mb-4">Izvēlieties anketu</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link href="/surveys/feedback1" className="text-sky-700 hover:underline">
            Pacienta apmierinātības anketa — 1 (PDF anketas vednis)
          </Link>
        </li>
        <li>
          <Link href="/surveys/feedback2" className="text-sky-700 hover:underline">
            Pacienta apmierinātības anketa — 2 (vienlapas forma)
          </Link>
        </li>
      </ul>
    </section>
  );
}
