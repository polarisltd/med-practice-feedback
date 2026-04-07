"use client";

import React, { useMemo, useState } from 'react';

// Wizard scaffold for the first survey from the PDF (placeholder until we get exact content)
// One question per screen; submits to /api/surveys/feedback1/submit

type AnswerType = 'likert' | 'single' | 'multi' | 'text' | 'number' | 'scale' | 'comment';

type OptionItem = {
  code: number; // numeric code from the PDF (e.g., 1..10)
  text: string; // option label from the PDF (Latvian)
  key?: string; // stable English key for analytics (e.g., yes, rather_yes)
  nextId?: string; // optional skip-logic target (e.g., 'J5K')
};

// Standardized 6-point information receipt scale used in J8K and similar questions
const YES_INFO_SCALE: OptionItem[] = [
  { code: 1, text: 'Jā', key: 'yes' },
  { code: 2, text: 'Drīzāk jā', key: 'rather_yes' },
  { code: 3, text: 'Drīzāk nē', key: 'rather_no' },
  { code: 4, text: 'Nē', key: 'no' },
  { code: 5, text: 'Nevēlos atbildēt', key: 'prefer_not_to_answer' },
  { code: 6, text: 'Neattiecas', key: 'not_applicable' },
];

type Question = {
  id: string; // e.g., J29K26A (last question id was provided)
  title: string; // keep the full question text from the PDF
  type: AnswerType;
  options?: OptionItem[]; // for single/multi
  min?: number; // for scale/number
  max?: number; // for scale/number
  required?: boolean;
};

// NOTE: Replace this definition with the real questions/options from the PDF.
const surveyDefinition: Question[] = [
  {
    id: 'Q1',
    title: 'Kopējais apmierinājums ar vizīti',
    type: 'likert',
    min: 1,
    max: 5,
    required: true,
  },
  {
    id: 'Q2',
    title: 'Vai ieteiktu mūs citiem?',
    type: 'single',
    options: [
      { code: 1, text: 'Ja' },
      { code: 2, text: 'Varbūt' },
      { code: 3, text: 'Nē' },
    ],
    required: true,
  },
  {
    id: 'J3K',
    title: 'Kāpēc izvēlējāties saņemt veselības aprūpes pakalpojumu šajā ārstniecības iestādē?',
    type: 'single',
    options: [
      { code: 1, text: 'Šeit strādā speciālists, pie kura vēlējos saņemt ārstniecisko pakalpojumu' },
      { code: 2, text: 'Ērta atrašanās vieta' },
      { code: 3, text: 'Šeit atrodas mana ģimenes ārsta prakse' },
      { code: 4, text: 'Rekomendēja ārsts' },
      { code: 5, text: 'Ieteica radinieki, draugi vai paziņas' },
      { code: 6, text: 'Laba reputācija' },
      { code: 7, text: 'Īsākais gaidīšanas laiks ārstnieciskā pakalpojuma saņemšanai' },
      { code: 8, text: 'Nodrošināta ērta vides piekļūstamība cilvēkiem ar funkcionēšanas traucējumiem' },
      { code: 9, text: 'Redzēju reklāmu, piedāvājumu' },
      { code: 10, text: 'Cita atbilde' }
    ],
    required: true,
  },
  {
    id: 'J4K',
    title: 'Lūdzu atzīmējiet, kur redzējāt reklāmu:',
    type: 'multi',
    options: [
      { code: 1, text: 'Preses izdevumos' },
      { code: 2, text: 'Bukletā, infografikā u.c. drukātā materiālā' },
      { code: 3, text: 'Dzirdēju radio' },
      { code: 4, text: 'Televīzijā' },
      { code: 5, text: 'Sociālajos tīklos (Facebook, Instagram, X u.c.)' },
      { code: 6, text: 'Iestādes tīmekļvietnē' },
      { code: 7, text: 'Cita atbilde' }
    ]
  },
  {
    id: 'J6K',
    title: 'Kā tika apmaksāts Jūsu saņemtais veselības aprūpes pakalpojums?',
    type: 'single',
    options: [
      { code: 1, text: 'Saņēmu valsts apmaksātu veselības aprūpes pakalpojumu' },
      { code: 2, text: 'Saņēmu maksas veselības aprūpes pakalpojumu' }
    ],
    required: true,
  },
  {
    id: 'J6K1',
    title: 'Saņēmu maksas veselības aprūpes pakalpojumu:',
    type: 'single',
    options: [
      { code: 1, text: 'Apmaksāju pats/pati (saskaņā ar ārstniecības iestādes cenrādi)' },
      { code: 2, text: 'Apmaksāja apdrošinātājs daļēji vai pilnībā (saskaņā ar ārstniecības iestādes cenrādi)' }
    ]
  },
  {
    id: 'J7K',
    title: 'Cik ilgi no pierakstīšanās brīža Jūs gaidījāt, lai saņemtu veselības aprūpes pakalpojumu?',
    type: 'single',
    options: [
      { code: 1, text: '0 dienas (tajā pašā dienā)' },
      { code: 2, text: '1 dienu (nākamajā dienā)' },
      { code: 3, text: '2-5 dienas (dažas dienas)' },
      { code: 4, text: '6-7 dienas (līdz 1 nedēļai)' },
      { code: 5, text: '8-14 dienas (vairāk nekā 1 nedēļu)' },
      { code: 6, text: '15-30 dienas (vairāk nekā 2 nedēļas)' },
      { code: 7, text: '31-60 dienas (vairāk nekā 1 mēnesi)' },
      { code: 8, text: '61-90 dienas (vairāk nekā 2 mēnešus)' },
      { code: 9, text: '91 dienu un vairāk (vairāk nekā 3 mēnešus)' },
      { code: 10, text: '4-6 mēnešus' },
      { code: 11, text: '7-12 mēnešus un vairāk' }
    ],
    required: true,
  },
  {
    id: 'J8K_1',
    title: 'J8K. Veicot pierakstu uz ambulatoro pakalpojumu, lai apmeklējums noritētu veiksmīgi, vai Jūs saņēmāt nepieciešamo informāciju par: ierašanās laiku ambulatorā pakalpojuma saņemšanai',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J8K_2',
    title: 'J8K. Veicot pierakstu uz ambulatoro pakalpojumu, lai apmeklējums noritētu veiksmīgi, vai Jūs saņēmāt nepieciešamo informāciju par: kā sagatavoties ambulatorā pakalpojuma saņemšanai',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J8K_3',
    title: 'J8K. Veicot pierakstu uz ambulatoro pakalpojumu, lai apmeklējums noritētu veiksmīgi, vai Jūs saņēmāt nepieciešamo informāciju par: kas jāņem līdzi dodoties saņemt ambulatoro pakalpojumu',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J8K_4',
    title: 'J8K. Veicot pierakstu uz ambulatoro pakalpojumu, lai apmeklējums noritētu veiksmīgi, vai Jūs saņēmāt nepieciešamo informāciju par: kur doties ierodoties ārstniecības iestādē (reģistratūru, klientu apkalpošanas centru, u.c.)',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J8K_5',
    title: 'J8K. Veicot pierakstu uz ambulatoro pakalpojumu, lai apmeklējums noritētu veiksmīgi, vai Jūs saņēmāt nepieciešamo informāciju par: interneta vietni, kur meklēt nepieciešamo informāciju',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J8K_6',
    title: 'J8K. Veicot pierakstu uz ambulatoro pakalpojumu, lai apmeklējums noritētu veiksmīgi, vai Jūs saņēmāt nepieciešamo informāciju par: veselības aprūpes pakalpojuma cenu un apmaksas kārtību',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J10K_1',
    title: 'J10K. Jūsu viedoklis par ārstniecības iestādes vidi un vides piekļūstamību: Ārstniecības iestādē bija viegli atrast vietu, kurp jums vajadzēja doties, lai jums veiktu ārstēšanu vai izmeklējumus',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J10K_2',
    title: 'J10K. Jūsu viedoklis par ārstniecības iestādes vidi un vides piekļūstamību: Reģistratūrā bija ilgi jāgaida, līdz Jūs apkalpoja',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J10K_3',
    title: 'J10K. Jūsu viedoklis par ārstniecības iestādes vidi un vides piekļūstamību: Reģistratūrā Jūs apkalpoja laipni un cieņpilni',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J10K_4',
    title: 'J10K. Jūsu viedoklis par ārstniecības iestādes vidi un vides piekļūstamību: Telpas bija sakoptas un tīras',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J10K_5',
    title: 'J10K. Jūsu viedoklis par ārstniecības iestādes vidi un vides piekļūstamību: Nodrošināta fiziskās vides piekļūstamība cilvēkiem ar funkcionēšanas traucējumiem',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J11K_1',
    title: 'J11K. Jūsu viedoklis par ārstniecības iestādes veselības aprūpes pakalpojuma saņemšanu: Tika ievērots Jūsu privātums (fiziskais privātums, diskrētas sarunas, personiskās informācijas aizsardzība u.c.)',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J11K_2',
    title: 'J11K. Jūsu viedoklis par ārstniecības iestādes veselības aprūpes pakalpojuma saņemšanu: Ārstniecības iestādē jutāties fiziski un emocionāli droši',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J11K_3',
    title: 'J11K. Jūsu viedoklis par ārstniecības iestādes veselības aprūpes pakalpojuma saņemšanu: Veselības aprūpes pakalpojuma saņemšanas laiks sakrita ar pieraksta laiku (negaidījāt ilgāk kā 15 minūtes)',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J11K_4',
    title: 'J11K. Jūsu viedoklis par ārstniecības iestādes veselības aprūpes pakalpojuma saņemšanu: Jums bija pietiekami daudz laika, lai ar veselības aprūpes speciālistu pārrunātu Jūsu medicīnisko problēmu vai veselību kopumā',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J13K_1',
    title: 'J13K. Vai ārstniecības iestādes personāls pret Jums izturējās ar cieņu? Ārsti',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J13K_2',
    title: 'J13K. Vai ārstniecības iestādes personāls pret Jums izturējās ar cieņu? Māsas/ārsta palīgi/vecmātes',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J13K_3',
    title: 'J13K. Vai ārstniecības iestādes personāls pret Jums izturējās ar cieņu? Funkcionālie speciālisti (fizioterapeits, ergoterapeits, tehniskais ortopēds, audiologopēds, uztura speciālists, mākslas terapeits, optometrists)',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J13K_4',
    title: 'J13K. Vai ārstniecības iestādes personāls pret Jums izturējās ar cieņu? Citi darbinieki',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J14K11A',
    title: 'J14K11A. Vai Jūs pietiekami iesaistīja lēmumu pieņemšanā par Jūsu veselības aprūpes procesu?',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J15K12A',
    title: 'J15K12A. Vai uz uzdotajiem jautājumiem Jūs saņēmāt saprotamas atbildes?',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J17K14A_1',
    title: 'J17K14A. Vai ārstniecības persona Jums saprotamā veidā: pastāstīja, kādam nolūkam zāles paredzētas',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J17K14A_2',
    title: 'J17K14A. Vai ārstniecības persona Jums saprotamā veidā: paskaidroja par iespējamām blakusparādībām un mijiedarbību ar citām zālēm, kuras regulāri lietojat',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J17K14A_3',
    title: 'J17K14A. Vai ārstniecības persona Jums saprotamā veidā: izskaidroja zāļu lietošanu',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J17K14A_4',
    title: 'J17K14A. Vai ārstniecības persona Jums saprotamā veidā: pastāstīja, kur ziņot par zāļu blakusparādībām jeb blaknēm',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J19K16A_1',
    title: 'J19K16A. Vai veselības aprūpes pakalpojuma saņemšanas laikā ārstniecības persona sniedza Jums saprotamu informāciju: par Jūsu slimības diagnozi',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J19K16A_2',
    title: 'J19K16A. Vai veselības aprūpes pakalpojuma saņemšanas laikā ārstniecības persona sniedza Jums saprotamu informāciju: kā jāturpina ārstēšanos un/vai veselības aprūpi',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J19K16A_3',
    title: 'J19K16A. Vai veselības aprūpes pakalpojuma saņemšanas laikā ārstniecības persona sniedza Jums saprotamu informāciju: kam turpmāk jāpievērš uzmanība (piemēram, iespējamiem simptomiem, sajūtām un veselības problēmām), un ieteikumus, kā šajās situācijās rīkoties',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'J19K16A_4',
    title: 'J19K16A. Vai veselības aprūpes pakalpojuma saņemšanas laikā ārstniecības persona sniedza Jums saprotamu informāciju: ar ko sazināties (piemēram, ar ārstējošo ārstu, ģimenes ārstu, neatliekamo medicīnas palīdzību, vai kādu citu), ja mājās rodas veselības problēmas.',
    type: 'single',
    options: YES_INFO_SCALE,
    required: true,
  },
  {
    id: 'Q3',
    title: 'Personāla laipnība',
    type: 'likert',
    min: 1,
    max: 5,
  },
  {
    id: 'Q4',
    title: 'Kas patika visvairāk?',
    type: 'text',
  },
  {
    id: 'Q5',
    title: 'Ko varam uzlabot?',
    type: 'comment',
  },
  {
    id: 'J29K26A',
    title: 'Noslēdzošais jautājums (no PDF: J29K26A)',
    type: 'text',
  },
];

export default function Feedback1WizardPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const q = surveyDefinition[step];
  const isLast = step === surveyDefinition.length - 1;

  const progress = useMemo(() => {
    const pct = Math.round(((step + 1) / surveyDefinition.length) * 100);
    return `${pct}%`;
  }, [step]);

  function setAnswer(qid: string, value: any) {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  }

  function canContinue(): boolean {
    if (!q?.required) return true;
    const v = answers[q.id];
    if (q.type === 'likert' || q.type === 'number' || q.type === 'scale') {
      return v != null && v !== '';
    }
    if (q.type === 'single') {
      return v != null && typeof v === 'object' && 'code' in v;
    }
    if (q.type === 'multi') {
      return Array.isArray(v) && v.length > 0;
    }
    if (q.type === 'text' || q.type === 'comment') {
      return typeof v === 'string' && v.trim() !== '';
    }
    return true;
  }

  function next() {
    if (step < surveyDefinition.length - 1) setStep(s => s + 1);
  }
  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  async function onSubmit() {
    setStatus('submitting');
    setError(null);
    try {
      const payload = {
        meta: {
          submittedAt: new Date().toISOString(),
          // Add any optional metadata here (e.g., age group, visit date) once defined in the PDF
        },
        answers: surveyDefinition.map(q => ({
          id: q.id,
          questionText: q.title,
          type: q.type,
          value: answers[q.id] ?? null,
        })),
      };
      const res = await fetch('/api/surveys/feedback1/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Neizdevās nosūtīt anketu');
      }
      setStatus('success');
    } catch (e: any) {
      setStatus('error');
      setError(e?.message || 'Neizdevās nosūtīt anketu');
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Atsauksmju anketa (1)</h1>
      <div className="h-2 w-full bg-gray-200 rounded mb-6">
        <div className="h-2 bg-blue-600 rounded" style={{ width: progress }} />
      </div>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded">
          Paldies! Jūsu atbildes ir saņemtas.
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">{step + 1} / {surveyDefinition.length}</div>
            <h2 className="text-xl font-medium">{q.title}</h2>
          </div>

          <div>
            {q.type === 'likert' && (
              <div className="flex gap-2">
                {Array.from({ length: (q.max ?? 5) - (q.min ?? 1) + 1 }).map((_, i) => {
                  const val = (q.min ?? 1) + i;
                  return (
                    <button key={val}
                      type="button"
                      onClick={() => setAnswer(q.id, val)}
                      className={`px-3 py-2 rounded border ${answers[q.id] === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300'} hover:border-blue-600`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'single' && (
              <div className="flex flex-col gap-2">
                {q.options?.map(opt => (
                  <label key={opt.code} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.code}
                      checked={Boolean(answers[q.id] && answers[q.id].code === opt.code)}
                      onChange={() => setAnswer(q.id, { code: opt.code, text: opt.text, key: opt.key })}
                    />
                    <span>{opt.code}. {opt.text}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === 'multi' && (
              <div className="flex flex-col gap-2">
                {q.options?.map(opt => {
                  const list: OptionItem[] = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                  const checked = list.some(o => o.code === opt.code);
                  return (
                    <label key={opt.code} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={opt.code}
                        checked={checked}
                        onChange={(e) => {
                          const current: OptionItem[] = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                          if (e.target.checked) {
                            setAnswer(q.id, [...current, { code: opt.code, text: opt.text, key: opt.key }]);
                          } else {
                            setAnswer(q.id, current.filter(o => o.code !== opt.code));
                          }
                        }}
                      />
                      <span>{opt.code}. {opt.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {(q.type === 'text' || q.type === 'comment') && (
              <textarea
                className="w-full border rounded p-2"
                rows={5}
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder="Jūsu atbilde"
              />
            )}

            {q.type === 'number' && (
              <input
                type="number"
                className="w-full border rounded p-2"
                value={answers[q.id] ?? ''}
                min={q.min}
                max={q.max}
                onChange={(e) => setAnswer(q.id, e.target.value === '' ? '' : Number(e.target.value))}
              />
            )}
          </div>

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">{error}</div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0 || status === 'submitting'}
              className="px-4 py-2 rounded border border-gray-300 disabled:opacity-50"
            >
              Atpakaļ
            </button>

            {!isLast ? (
              <button
                type="button"
                onClick={next}
                disabled={!canContinue() || status === 'submitting'}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              >
                Nākamais
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={status === 'submitting'}
                className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
              >
                {status === 'submitting' ? 'Nosūta…' : 'Iesniegt'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
