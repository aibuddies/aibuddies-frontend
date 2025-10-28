import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { supabase } from './supabaseClient'; // Import your new client
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// --- Constants ---
const API_URL = "https://aibuddies-backend.onrender.com";

// --- Helper Functions (same as before) ---
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = (error) => reject(error);
});

const IMAGE_TOOLS = new Set([
  "image_analysis", "image_enhance", "background_remove", "object_detection",
  "style_transfer", "image_caption", "colorize_image", "image_to_text", "facial_analysis"
]);

// --- Main App Component ---
function App() {
  // --- Auth State ---
  const [session, setSession] = useState(null);

  // --- App State ---
  const [profile, setProfile] = useState(null);
  const [tools, setTools] = useState({});
  const [toolCosts, setToolCosts] = useState({});
  const [selectedTool, setSelectedTool] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null);

  // --- Auth Effect ---
  useEffect(() => {
    // Check for an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Clear profile on logout
      if (_event === "SIGNED_OUT") {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- API Client ---
  const api = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    setResult(null);

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // --- THIS IS THE KEY CHANGE ---
    // Get the real auth token from the session
    if (session && session.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      // Allow fetching tools even when logged out
      if (!endpoint.startsWith('/api/v1/tools')) {
        setError("You are not logged in.");
        setLoading(false);
        throw new Error("Not logged in");
      }
    }
    // --- END OF KEY CHANGE ---

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Error ${response.status}`);
      }
      
      return data;
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message);
      throw err; 
    } finally {
      setLoading(false);
    }
  }, [session]); // Add session as a dependency

  // --- Data Fetching ---
  const fetchProfile = useCallback(async () => {
    if (!session) return; // Don't fetch if not logged in
    try {
      const data = await api('/api/v1/user/profile');
      setProfile(data.profile);
    } catch (err) {
      // error set by api()
    }
  }, [api, session]);

  const fetchTools = useCallback(async () => {
    try {
      const data = await api('/api/v1/tools');
      setTools(data.tools);
      setToolCosts(data.credit_costs);
    } catch (err) {
      // error set by api()
    }
  }, [api]);

  // Initial data load
  useEffect(() => {
    fetchTools(); // Fetch tools immediately
    if (session) {
      fetchProfile(); // Fetch profile only when session exists
    }
  }, [fetchTools, fetchProfile, session]); // Add session here

  
  // --- Event Handlers (Unchanged) ---
  const handleClaimBonus = async () => {
    try {
      const data = await api('/api/v1/ads/daily-bonus', { method: 'POST' });
      setMessage(`+${data.bonus_earned} credits! Total: ${data.total_credits}`);
      await fetchProfile();
    } catch (err) {}
  };

  const handleWatchAd = async () => {
    const adRequest = {
      ad_id: "custom_video_1",
      ad_type: "rewarded_video",
      ad_network: "custom",
      verification_data: { timestamp: new Date().toISOString(), verified: true }
    };
    try {
      const data = await api('/api/v1/ads/watch', {
        method: 'POST',
        body: JSON.stringify(adRequest),
      });
      setMessage(`+${data.credits_earned} credits! Total: ${data.total_credits}`);
      await fetchProfile();
    } catch (err) {}
  };

  const handleBuyCredits = async () => {
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      setError("Failed to load payment gateway. Please try again.");
      return;
    }
    const creditsToBuy = 500;
    const amountInPaisa = 1000;
    try {
      const orderData = await api('/api/v1/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({
          amount: amountInPaisa,
          credit_package: creditsToBuy,
        }),
      });
      const options = {
        key: orderData.notes.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AIBUDDIES",
        description: `Buy ${creditsToBuy} Credits`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const verifyData = await api('/api/v1/payments/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                credits_to_add: creditsToBuy,
              }),
            });
            setMessage(`Payment successful! +${verifyData.credits_added} credits.`);
            await fetchProfile();
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: session.user.email, // Use logged-in user's email
          email: session.user.email,
        },
        theme: {
          color: "#3399cc",
        },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(`Payment failed: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTool) {
      setError("Please select a tool first.");
      return;
    }
    const isImageTool = IMAGE_TOOLS.has(selectedTool);
    if (isImageTool && !imageFile) {
      setError("This tool requires an image file.");
      return;
    }
    try {
      let data;
      if (isImageTool) {
        const image_data = await toBase64(imageFile);
        const body = {
          prompt: prompt || "Analyze this image",
          image_data: image_data,
        };
        data = await api(`/api/v1/image/${selectedTool}`, {
          method: 'POST',
          body: JSON.stringify(body),
        });
      } else {
        const body = {
          prompt: prompt,
          model_type: selectedTool,
        };
        data = await api('/api/v1/ai/generate', {
          method: 'POST',
          body: JSON.stringify(body),
        });
      }
      setResult(data);
      await fetchProfile();
    } catch (err) {}
  };

  // --- RENDER LOGIC ---

  // 1. If no session, show the LOGIN/REGISTER PAGE
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-cyan-400 mb-6 text-center">AIBUDDIES</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google', 'github']} // Optional social logins
            theme="dark"
          />
        </div>
      </div>
    );
  }

  // 2. If session EXISTS, show the main application
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* --- 1. Header & Profile --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-cyan-400 mb-2 md:mb-0">AIBUDDIES</h1>
          {profile ? (
            <div className="text-right">
              <div className="text-2xl font-semibold text-green-400">
                Credits: {profile.credits}
              </div>
              <div className="text-sm text-gray-400" title={profile.id}>
                User: {session.user.email}
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs text-red-400 hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-2xl font-semibold text-yellow-400">
              Loading Profile...
            </div>
          )}
        </header>

        {/* --- 2. Monetization Actions --- */}
        <section className="mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Get Credits</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleClaimBonus}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
            >
              {loading ? '...' : '🎁 Claim Daily Bonus'}
            </button>
            <button
              onClick={handleWatchAd}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-gray-600 transition-colors"
            >
              {loading ? '...' : '📺 Watch Ad for Credits'}
            </button>
            <button
              onClick={handleBuyCredits}
              disabled={loading}
              className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-600 transition-colors"
            >
              {loading ? '...' : '💳 Buy Credits (₹10)'}
            </button>
          </div>
        </section>

        {/* --- 3. Tool Selection --- */}
        <section className="mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Select a Tool</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(tools).map(([key, description]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTool(key);
                  setResult(null);
                }}
                className={`p-3 text-left rounded-md transition-all
                  ${selectedTool === key ? 'bg-cyan-600 ring-2 ring-cyan-300' : 'bg-gray-700 hover:bg-gray-600'}
                `}
              >
                <div className="font-bold">{key.replace(/_/g, ' ')}</div>
                <div className="text-xs text-gray-300">{description}</div>
                <div className="text-xs font-semibold text-yellow-400 mt-1">
                  Cost: {toolCosts[key] || 1} credit(s)
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* --- 4. Tool Form --- */}
        {selectedTool && (
          <section className="mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 capitalize">
              {selectedTool.replace(/_/g, ' ')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={IMAGE_TOOLS.has(selectedTool) ? "Enter an optional prompt" : "Enter your prompt..."}
                  className="w-full h-32 p-3 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {IMAGE_TOOLS.has(selectedTool) && (
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="file-upload">
                      Upload Image
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                                 file:rounded-md file:border-0 file:text-sm file:font-semibold
                                 file:bg-cyan-700 file:text-cyan-100 hover:file:bg-cyan-800"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-cyan-600 text-lg font-bold rounded-md hover:bg-cyan-700 disabled:bg-gray-600 transition-colors"
                >
                  {loading ? 'Generating...' : `Generate (Cost: ${toolCosts[selectedTool] || 1})`}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* --- 5. Status Messages & Results --- */}
        <section className="p-4 bg-gray-800 rounded-lg shadow-lg min-h-[100px]">
          <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">Result</h2>
          {loading && <div className="text-yellow-400">Loading...</div>}
          {error && <div className="p-3 bg-red-800 text-red-100 rounded-md">{error}</div>}
          {message && <div className="p-3 bg-green-800 text-green-100 rounded-md">{message}</div>}
          {result && (
            <pre className="w-full bg-gray-900 p-4 rounded-md overflow-x-auto text-sm whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </section>

      </div>
    </div>
  );
}

export default App;