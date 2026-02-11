'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const STRAVA_CLIENT_ID = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || '125671';
const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin + '/api/auth/callback' : '';

export default function ProofOfStravaContent() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [athlete, setAthlete] = useState<any>(null);
  const [month, setMonth] = useState('8');
  const [year, setYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(window.location.hostname.includes('vercel.app'));

    const urlToken = searchParams?.get('token');
    const urlAthlete = searchParams?.get('athlete');

    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('strava_token', urlToken);
    } else {
      const savedToken = localStorage.getItem('strava_token');
      if (savedToken) setToken(savedToken);
    }

    if (urlAthlete) {
      try {
        const athleteData = JSON.parse(urlAthlete);
        setAthlete(athleteData);
        localStorage.setItem('strava_athlete', urlAthlete);
      } catch (e) {}
    } else {
      const savedAthlete = localStorage.getItem('strava_athlete');
      if (savedAthlete) {
        try {
          setAthlete(JSON.parse(savedAthlete));
        } catch (e) {}
      }
    }

    if (urlToken) window.history.replaceState({}, '', '/');
  }, [searchParams]);

  const handleConnect = () => {
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=activity:read_all`;
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    setToken('');
    setAthlete(null);
    localStorage.removeItem('strava_token');
    localStorage.removeItem('strava_athlete');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please connect with Strava first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stravaToken: token,
          month: parseInt(month),
          year: parseInt(year),
        }),
      });

      const data = await response.json();
      
      if (data.error && data.error.includes('401')) {
        alert('Token expired. Please reconnect with Strava.');
        handleDisconnect();
      } else {
        setResult(data);
      }
    } catch (error) {
      setResult({ error: 'Failed to generate proof' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_20%_0%,#f7fbff_0%,#ffffff_45%,#f2f6ff_100%)] flex items-center justify-center p-6 text-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#dbeafe] blur-3xl opacity-80"></div>
        <div className="absolute top-16 -right-20 w-96 h-96 rounded-full bg-[#e2e8f0] blur-3xl opacity-80"></div>
        <div className="absolute bottom-[-160px] left-1/2 w-[640px] h-[640px] -translate-x-1/2 rounded-full bg-[#eef2ff] blur-3xl opacity-60"></div>
          <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-[#fff3d6] blur-3xl opacity-70"></div>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.03)_1px,transparent_1px)] [background-size:40px_40px]"></div>
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(rgba(0,0,0,0.5)_0.5px,transparent_0.5px)] [background-size:18px_18px]"></div>
      </div>

      <div className="max-w-2xl w-full bg-white/85 border border-black/10 rounded-[28px] shadow-[0_30px_100px_rgba(15,23,42,0.16)] p-8 text-center text-black backdrop-blur-xl relative">
        {isDemoMode && (
          <div className="mb-4 border border-black rounded-xl p-3 text-sm text-black">
            Demo mode. Full proof generation is available locally.
            <a
              href="https://github.com/ZKGeorge1/ZKStrava"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline underline-offset-2 text-black"
            >
              View repository
            </a>
          </div>
        )}

        <div className="mb-6 space-y-3 -mt-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-slate-900 to-slate-700 px-3 py-1 rounded-full shadow-sm">
            ZK Health Insurance
          </div>
          <h1 className="text-[72px] sm:text-[96px] font-semibold tracking-tight text-black">
            Proof of Strava
          </h1>
          <p className="text-black/70 text-sm">
            Private verification for lower health insurance premiums.
          </p>
        </div>

        <div className="mb-6 text-black text-sm space-y-3">
          <div className="font-semibold uppercase tracking-wide text-[11px] text-black/70">Requirements</div>
          <div className="mx-auto w-full max-w-[260px] space-y-2 text-left">
            <div className="flex items-center justify-between rounded-lg border border-black/10 bg-white/90 px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
              <span>Workouts per month</span>
              <span className="font-semibold">12+</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-black/10 bg-white/90 px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
              <span>Avg distance per workout</span>
              <span className="font-semibold">5 km</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-black/10 bg-white/90 px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
              <span>Total time per month</span>
              <span className="font-semibold">10 hrs</span>
            </div>
          </div>
        </div>

        {!token ? (
          <button
            onClick={handleConnect}
            className="w-full bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition hover:opacity-95"
          >
            Connect with Strava
          </button>
        ) : (
          <>
            {athlete && (
              <div className="border border-black rounded-xl p-3 mb-4 flex flex-col items-center justify-center gap-3">
                <div className="flex flex-col items-center gap-2">
                  {athlete.profile && (
                    <img
                      src={athlete.profile}
                      alt="Profile"
                      className="w-[250px] h-[250px] rounded-full border border-black"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-black">
                      {athlete.firstname} {athlete.lastname}
                    </div>
                    <div className="text-xs text-black">
                      Connected to Strava
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs font-semibold text-black/80 underline underline-offset-4 hover:text-black"
                >
                  Remove Strava account
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full max-w-[180px] mx-auto px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none transition"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full max-w-[180px] mx-auto px-3 py-2 bg-white border border-black/10 rounded-xl text-black focus:outline-none transition"
                  >
                    {['2023', '2024', '2025'].map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full max-w-[220px] mx-auto bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition hover:opacity-95 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating proof...</span>
                    </>
                  ) : (
                    <>
                      <span>{isDemoMode ? 'Try demo' : 'Check eligibility'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {loading && (
          <div className="mt-4 text-center border border-black rounded-xl p-4 bg-white text-black text-sm">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-black font-medium mb-1">
              Checking eligibility
            </p>
            <p className="text-black text-sm">
              This usually takes 10–30 seconds.
            </p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-4 border border-black rounded-xl p-4 text-black text-sm">
            {result.error ? (
              <div>
                <h3 className="text-base font-semibold text-black mb-2">
                  {result.demoMode ? 'Demo mode' : 'Error'}
                </h3>
                <p className="text-black whitespace-pre-line leading-relaxed">{result.error}</p>
              </div>
            ) : result.qualifies ? (
              <div>
                <h3 className="text-base font-semibold text-black mb-2">
                  Eligible for lower premium
                </h3>
                <div className="space-y-3 mb-2 text-center">
                  {[
                    { label: 'Workouts', value: result.stats.workoutCount, unit: '' },
                    { label: 'Avg Distance', value: (result.stats.avgDistance / 1000).toFixed(2), unit: 'km' },
                    { label: 'Total Time', value: (result.stats.totalDuration / 60).toFixed(1), unit: 'hours' }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-black/70 text-xs uppercase tracking-wide">{stat.label}</span>
                      <span className="text-black font-semibold text-lg">
                        {stat.value} {stat.unit}
                        <span className="ml-2 text-emerald-600">✓</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-black">Your raw workout data remains private.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-semibold text-black mb-2">
                  Not eligible yet
                </h3>
                <div className="space-y-3 mb-2 text-center">
                  {[
                    { label: 'Workouts', value: result.stats.workoutCount, threshold: 12 },
                    { label: 'Avg Distance', value: (result.stats.avgDistance / 1000).toFixed(2) + 'km', threshold: 5 },
                    { label: 'Total Time', value: (result.stats.totalDuration / 60).toFixed(1) + 'h', threshold: 10 }
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-black/70 text-xs uppercase tracking-wide">{stat.label}</span>
                      <span className="text-black font-semibold text-lg">
                        {stat.value}{' '}
                        {(i === 0 && result.stats.workoutCount >= 12) ||
                        (i === 1 && result.stats.avgDistance >= 5000) ||
                        (i === 2 && result.stats.totalDuration >= 600) ? (
                          <span className="ml-2 text-emerald-600">✓</span>
                        ) : (
                          <span className="ml-2 text-red-600">✗</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-black">Keep training to qualify for the lower premium.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
