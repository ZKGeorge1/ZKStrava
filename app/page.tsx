'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const STRAVA_CLIENT_ID = '125671';
const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin + '/api/auth/callback' : '';

export default function Home() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [athlete, setAthlete] = useState<any>(null);
  const [month, setMonth] = useState('8');
  const [year, setYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Check if returning from OAuth
    const urlToken = searchParams?.get('token');
    const urlAthlete = searchParams?.get('athlete');

    if (urlToken) {
      setToken(urlToken);
      localStorage.setItem('strava_token', urlToken);
    } else {
      // Try to load from localStorage
      const savedToken = localStorage.getItem('strava_token');
      if (savedToken) {
        setToken(savedToken);
      }
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

    // Clean URL
    if (urlToken) {
      window.history.replaceState({}, '', '/');
    }
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
        // Token expired, need to reconnect
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
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏃‍♂️🔒</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Proof of Strava
          </h1>
          <p className="text-gray-600">Zero-Knowledge Insurance Qualifier</p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-900 text-sm">
            <strong>🔐 Privacy First:</strong> Your exact workout data stays
            private. We only prove you meet requirements.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Qualification Requirements:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <span className="text-green-600 font-bold mr-2">✓</span>
              At least 12 workouts per month
            </li>
            <li className="flex items-center">
              <span className="text-green-600 font-bold mr-2">✓</span>
              Average distance ≥5km per workout
            </li>
            <li className="flex items-center">
              <span className="text-green-600 font-bold mr-2">✓</span>
              Total exercise time ≥10 hours
            </li>
          </ul>
        </div>

        {!token ? (
          <button
            onClick={handleConnect}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <span>🔗</span>
            Connect with Strava
          </button>
        ) : (
          <>
            {athlete && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {athlete.profile && (
                    <img
                      src={athlete.profile}
                      alt="Profile"
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-800">
                      {athlete.firstname} {athlete.lastname}
                    </div>
                    <div className="text-sm text-green-700">Connected ✓</div>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Disconnect
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Generating Proof...' : 'Generate Proof 🚀'}
              </button>
            </form>
          </>
        )}

        {loading && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Generating zero-knowledge proof...
            </p>
            <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
          </div>
        )}

        {result && !loading && (
          <div
            className={`mt-6 p-6 rounded-lg ${
              result.error
                ? 'bg-red-50 border-2 border-red-200'
                : result.qualifies
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-yellow-50 border-2 border-yellow-200'
            }`}
          >
            {result.error ? (
              <div>
                <h3 className="text-xl font-bold text-red-800 mb-2">
                  ❌ Error
                </h3>
                <p className="text-red-700">{result.error}</p>
              </div>
            ) : result.qualifies ? (
              <div>
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  ✅ Qualified for Insurance Discount!
                </h3>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Workouts:</span>
                    <span>{result.stats.workoutCount} ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Avg Distance:</span>
                    <span>
                      {(result.stats.avgDistance / 1000).toFixed(2)}km ✓
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Time:</span>
                    <span>
                      {(result.stats.totalDuration / 60).toFixed(1)} hours ✓
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-green-800 font-semibold">
                  🔒 Your exact workout data remains private!
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-yellow-800 mb-4">
                  ⚠️ Does Not Qualify Yet
                </h3>
                <div className="bg-white bg-opacity-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Workouts:</span>
                    <span>
                      {result.stats.workoutCount}{' '}
                      {result.stats.workoutCount >= 12 ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Avg Distance:</span>
                    <span>
                      {(result.stats.avgDistance / 1000).toFixed(2)}km{' '}
                      {result.stats.avgDistance >= 5000 ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Time:</span>
                    <span>
                      {(result.stats.totalDuration / 60).toFixed(1)}h{' '}
                      {result.stats.totalDuration >= 600 ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-yellow-800">
                  💪 Keep exercising to qualify!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
