import { useEffect, useState } from 'react';
import { Sparkles, Upload, PlayCircle, Check } from 'lucide-react';
import { useAppState, useAppStore } from '../../lib/store/hooks';
import { loadDemoData } from '../../lib/demo';
import { ImportView } from './ImportView';

type Step = 'welcome' | 'choose' | 'importing' | 'demo-processing' | 'ready';

const PROCESSING_STEPS = [
  'Reading bookmarks...',
  'Finding duplicates...',
  'Analyzing domains...',
  'Suggesting categories...',
  'Building search index...',
  'Creating insights...',
];

interface OnboardingViewProps {
  onComplete: () => void;
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [visibleSteps, setVisibleSteps] = useState(0);
  const store = useAppStore();
  const bookmarkCount = useAppState((s) => s.bookmarks.length);

  useEffect(() => {
    if (step !== 'demo-processing') return;
    let cancelled = false;
    void loadDemoData(store);
    const interval = setInterval(() => {
      setVisibleSteps((v) => {
        const next = v + 1;
        if (next >= PROCESSING_STEPS.length) {
          clearInterval(interval);
          if (!cancelled) setTimeout(() => setStep('ready'), 500);
        }
        return next;
      });
    }, 320);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [step, store]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 via-white to-white px-6 dark:from-ink-950 dark:via-ink-950 dark:to-ink-950">
      <div className="w-full max-w-md text-center">
        {step === 'welcome' && (
          <div className="animate-slide-up">
            <img src="/favicon.svg" alt="" width="48" height="48" className="mx-auto rounded-2xl" />
            <h1 className="mt-5 text-2xl font-semibold text-ink-900 dark:text-white">Welcome to Bookmark Intelligence</h1>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              Turn your bookmark chaos into organized knowledge — entirely on this device.
            </p>
            <button
              type="button"
              onClick={() => setStep('choose')}
              className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
            >
              Get started
            </button>
          </div>
        )}

        {step === 'choose' && (
          <div className="animate-slide-up space-y-3 text-left">
            <h2 className="text-center text-lg font-semibold text-ink-900 dark:text-white">How do you want to start?</h2>
            <button
              type="button"
              onClick={() => setStep('importing')}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm dark:border-ink-700 dark:bg-ink-900"
            >
              <Upload size={20} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-ink-900 dark:text-white">Import my bookmarks</span>
                <span className="block text-xs text-ink-500 dark:text-ink-400">From a browser HTML export</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setVisibleSteps(0);
                setStep('demo-processing');
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-sm dark:border-ink-700 dark:bg-ink-900"
            >
              <PlayCircle size={20} className="text-brand-600 dark:text-brand-400" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-ink-900 dark:text-white">Try the demo</span>
                <span className="block text-xs text-ink-500 dark:text-ink-400">
                  Explore with ~100 sample bookmarks, nothing uploaded
                </span>
              </span>
            </button>
          </div>
        )}

        {step === 'importing' && (
          <div className="animate-slide-up text-left">
            <ImportView onFinished={() => setStep('ready')} />
          </div>
        )}

        {step === 'demo-processing' && (
          <div className="animate-slide-up space-y-2 text-left">
            {PROCESSING_STEPS.map((label, index) => (
              <div key={label} className="flex items-center gap-2.5 text-sm">
                {index < visibleSteps ? (
                  <Check size={16} className="text-emerald-500" aria-hidden="true" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border-2 border-ink-200 dark:border-ink-700" />
                )}
                <span className={index < visibleSteps ? 'text-ink-800 dark:text-ink-100' : 'text-ink-400 dark:text-ink-500'}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {step === 'ready' && (
          <div className="animate-slide-up">
            <Sparkles size={32} className="mx-auto text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold text-ink-900 dark:text-white">You're ready.</h2>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              {bookmarkCount.toLocaleString()} bookmarks organized.
            </p>
            <button
              type="button"
              onClick={onComplete}
              className="mt-6 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
            >
              Enter Bookmark Intelligence
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
