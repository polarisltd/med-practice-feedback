import { NextRequest } from 'next/server';

// Reuse runtime and dynamic settings from the generic [surveyKey] route
export { runtime, dynamic } from '../../[surveyKey]/submit/route';

// Delegate the actual work to the template handler, pinning surveyKey = 'feedback2'
import { POST as templatePOST } from '../../[surveyKey]/submit/route';

export function POST(req: NextRequest) {
  return templatePOST(req, { params: { surveyKey: 'feedback2' } });
}
