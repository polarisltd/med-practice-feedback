"use client";

import { useMemo, useState } from 'react';

type LikertValue = 1 | 2 | 3 | 4 | 5;

type Ratings = Record<string, LikertValue | null>;

export default function Page() {
  // Meta fields
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [ageGroup, setAgeGroup] = useState<string>("");

  // Section ratings
  const visitAspects = [
    'Randevju pierakstīšanās ērtums',
    'Gaidīšanas laiks kabinetā',
    'Ārsta pieejamības ilgums',
    'Kabinetā tīrība un komforts',
  ];
  const staffAspects = [
    'Ārsta profesionālās zināšanas un kompetence',
    'Ārsta izturēšanās (cieņpilna, uzmanīga)',
    'Informācijas skaidrība par diagnozi un ārstēšanu',
    'Jūsu jautājumu izsmeļoša atbildēšana',
    'Personāla (māsas, reģistratūra) draudzīgums',
  ];
  const gynAspects = [
    'Privātuma un intimitātes sajūta apskates laikā',
    'Izmeklējumu (USG, PAP u. tml.) komforts',
    'Konsultācijas par ģimenes plānošanu/preventīvo aprūpi',
    'Sekošana konsultācijās (ja attiecas)',
  ];

  const initRatings = (keys: string[]): Ratings => Object.fromEntries(keys.map(k => [k, null]));

  const [visitRatings, setVisitRatings] = useState<Ratings>(() => initRatings(visitAspects));
  const [staffRatings, setStaffRatings] = useState<Ratings>(() => initRatings(staffAspects));
  const [gynRatings, setGynRatings] = useState<Ratings>(() => initRatings(gynAspects));

  // Overall
  const [overall, setOverall] = useState<LikertValue | null>(null);
  const [recommend, setRecommend] = useState<'Ja' | 'Varbūt' | 'Nē' | ''>('');

  // Open questions
  const [good, setGood] = useState('');
  const [improve, setImprove] = useState('');
  const [comment, setComment] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  function setRating(
    set: React.Dispatch<React.SetStateAction<Ratings>>,
    key: string,
    value: LikertValue
  ) {
    set(prev => ({ ...prev, [key]: value }));
  }

  const allPayload = useMemo(() => ({
    date,
    ageGroup,
    sections: {
      visitExperience: visitRatings,
      staff: staffRatings,
      gynecologySpecific: gynRatings,
    },
    summary: { overall, recommend },
    open: { good, improve, comment },
  }), [date, ageGroup, visitRatings, staffRatings, gynRatings, overall, recommend, good, improve, comment]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allPayload),
      });
      if (!res.ok) {
        let details = '';
        try {
          const data = await res.json();
          details = data?.error ? `: ${data.error}` : '';
        } catch (_) {
          // ignore JSON parse error
        }
        throw new Error(`Neizdevās nosūtīt anketu${details}`);
      }
      setStatus('success');
      // reset optional fields but keep date
      setAgeGroup('');
      setVisitRatings(initRatings(visitAspects));
      setStaffRatings(initRatings(staffAspects));
      setGynRatings(initRatings(gynAspects));
      setOverall(null);
      setRecommend('');
      setGood('');
      setImprove('');
      setComment('');
    } catch (err: any) {
      setStatus('error');
      setError(err?.message ?? 'Radās kļūda');
    }
  }

  const isDisabled = status === 'submitting' || overall === null || recommend === '';

  return (
    <section className="bg-white rounded-xl shadow-sm ring-1 ring-black/5 p-6">
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Datums
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Jūsu vecuma grupa</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              <option value="">Izvēlieties…</option>
              <option>18–25</option>
              <option>26–35</option>
              <option>36–45</option>
              <option>46–55</option>
              <option>56+</option>
            </select>
          </div>
        </div>

        <LikertSection
          title="1. Vizītes pieredze (novērtējiet no 1 līdz 5)"
          aspects={visitAspects}
          ratings={visitRatings}
          onChange={(k, v) => setRating(setVisitRatings, k, v)}
        />

        <LikertSection
          title="2. Ārsta un personāla sniegums"
          aspects={staffAspects}
          ratings={staffRatings}
          onChange={(k, v) => setRating(setStaffRatings, k, v)}
        />

        <LikertSection
          title="3. Īpaši ginekoloģijas aspekti"
          aspects={gynAspects}
          ratings={gynRatings}
          onChange={(k, v) => setRating(setGynRatings, k, v)}
        />

        {/* Overall */}
        <section aria-labelledby="overall" className="space-y-4">
          <h3 id="overall" className="text-base font-semibold">4. Kopējais novērtējums</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Kopējā apmierinātība ar vizīti:</p>
              <LikertInline value={overall} onChange={setOverall} />
              <p className="mt-1 text-xs text-gray-500">1 – ļoti neapmierināts, 5 – ļoti apmierināts</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Vai ieteiktu šo praksi draugiem/ģimenei?</p>
              <div className="flex gap-4">
                {(['Ja','Varbūt','Nē'] as const).map(opt => (
                  <label key={opt} className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="recommend"
                      value={opt}
                      checked={recommend === opt}
                      onChange={() => setRecommend(opt)}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Open questions */}
        <section aria-labelledby="open" className="space-y-4">
          <h3 id="open" className="text-base font-semibold">5. Atvērtie jautājumi (pēc izvēles)</h3>
          <TextArea
            id="good"
            label="Ko mēs darījām labi?"
            value={good}
            onChange={setGood}
          />
          <TextArea
            id="improve"
            label="Ko mēs varētu uzlabot?"
            value={improve}
            onChange={setImprove}
          />
          <TextArea
            id="comment"
            label="Papildu komentāri"
            value={comment}
            onChange={setComment}
          />
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'submitting' ? 'Nosūta…' : 'Iesniegt anketu'}
          </button>
          {status === 'success' && (
            <p className="text-sm text-green-600">Paldies! Jūsu atbildes ir saņemtas.</p>
          )}
          {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <p className="text-xs text-gray-500">Paldies par Jūsu atsauksmēm! (Aizpildīto anketu lūdzu atstājiet reģistratūrā vai nosūtiet uz e‑pastu/prakses mājaslapu.)</p>
      </form>
    </section>
  );
}

function LikertSection({
  title,
  aspects,
  ratings,
  onChange,
}: {
  title: string;
  aspects: string[];
  ratings: Ratings;
  onChange: (key: string, value: LikertValue) => void;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-semibold">{title}</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[1fr_repeat(5,3rem)] items-end gap-2 px-1">
            <div className="text-xs text-gray-500">Aspekts</div>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="text-center text-xs text-gray-500">{n}</div>
            ))}
          </div>
          <div className="divide-y">
            {aspects.map((a) => (
              <div key={a} className="grid grid-cols-[1fr_repeat(5,3rem)] items-center gap-2 py-2">
                <div className="text-sm">{a}</div>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="flex justify-center">
                    <input
                      aria-label={`${a} — ${n}`}
                      type="radio"
                      name={`${title}-${a}`}
                      value={n}
                      checked={ratings[a] === (n as LikertValue)}
                      onChange={() => onChange(a, n as LikertValue)}
                      className="h-4 w-4 text-sky-600 focus:ring-sky-600"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500">1 – ļoti neapmierināts, 3 – vidēji, 5 – ļoti apmierināts</p>
    </section>
  );
}

function LikertInline({
  value,
  onChange,
}: {
  value: LikertValue | null;
  onChange: (v: LikertValue) => void;
}) {
  return (
    <div className="flex items-center gap-5">
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="overall"
            value={n}
            checked={value === (n as LikertValue)}
            onChange={() => onChange(n as LikertValue)}
            className="h-4 w-4 text-sky-600 focus:ring-sky-600"
          />
          {n}
        </label>
      ))}
    </div>
  );
}

function TextArea({ id, label, value, onChange }: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 min-h-[100px]"
      />
    </div>
  );
}
