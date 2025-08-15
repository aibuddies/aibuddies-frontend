import React from 'react';

// --- Configuration ---
// This should point to your live backend URL.
const API_BASE_URL = "https://aibuddies-backend.onrender.com";

// --- API Service ---
// A centralized place to handle all API calls.
const api = {
  async request(endpoint, method = 'GET', body = null, token = null) {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    const config = {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'An error occurred');
      }
      return data;
    } catch (error) {
      console.error(`API Error on ${method} ${endpoint}:`, error);
      throw error;
    }
  },
};

// --- Authentication Context ---
// Manages global state for the logged-in user.
const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(() => localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await api.request('/api/users/me', 'GET', null, token);
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid.", error);
          setToken(null);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUserData }));
  };

  const value = { user, token, login, logout, isLoading, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => React.useContext(AuthContext);

// --- Helper & UI Components ---

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
);

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const baseStyle = "fixed top-5 right-5 p-4 rounded-lg shadow-lg text-white z-[100] animate-fade-in-down";
    const typeStyle = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    React.useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`${baseStyle} ${typeStyle}`}>
            {message}
        </div>
    );
};

// --- Page & Feature Components ---

const Header = ({ setCurrentPage }) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentPage({ page: 'home' })}>
                    <Icon path="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a7.5 7.5 0 00-7.5 0" className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-2xl font-bold text-white tracking-wider">AIBUDDIES</h1>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                    <button onClick={() => setCurrentPage({ page: 'tools' })} className="text-gray-300 hover:text-indigo-400 transition-colors duration-200">Tools</button>
                    <button onClick={() => setCurrentPage({ page: 'payments' })} className="text-gray-300 hover:text-indigo-400 transition-colors duration-200">Get Credits</button>
                </nav>
                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                <Icon path="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5 text-yellow-400" />
                                <span className="font-bold text-white">{user.credits} Credits</span>
                            </div>
                            <button onClick={logout} className="text-gray-300 hover:text-white transition-colors">Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setCurrentPage({ page: 'auth', mode: 'login' })} className="text-gray-300 hover:text-white transition-colors">Login</button>
                            <button onClick={() => setCurrentPage({ page: 'auth', mode: 'signup' })} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-transform duration-200 transform hover:scale-105">Sign Up</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

const AuthPage = ({ mode: initialMode, setCurrentPage, setNotification }) => {
    const [mode, setMode] = React.useState(initialMode);
    const [formData, setFormData] = React.useState({ fullname: '', email: '', password: '' });
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const { login } = useAuth();

    const isLogin = mode === 'login';
    const title = isLogin ? 'Welcome Back' : 'Create Account';
    const subtitle = isLogin ? 'Log in to access your dashboard.' : 'Get started with 21 free credits.';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            if (isLogin) {
                const body = new URLSearchParams();
                body.append('username', formData.email);
                body.append('password', formData.password);
                
                const response = await fetch(`${API_BASE_URL}/api/users/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail);

                login(data.access_token);
                setNotification({ type: 'success', message: 'Login successful!' });
                setCurrentPage({ page: 'tools' });
            } else {
                const { fullname, email, password } = formData;
                const data = await api.request('/api/users/signup', 'POST', { fullname, email, password });
                setMessage(data.message);
                setMode('message');
            }
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (mode === 'message') {
        return (
            <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md mx-auto animate-fade-in">
                <Icon path="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400">{message}</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 animate-fade-in">
            <div className="text-white text-center">
                <h2 className="text-3xl font-bold mb-2">{title}</h2>
                <p className="text-gray-400 mb-8">{subtitle}</p>
                <form className="space-y-4 text-left" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div>
                            <label className="text-sm font-medium text-gray-400">Full Name</label>
                            <input name="fullname" type="text" placeholder="John Doe" onChange={handleChange} required className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium text-gray-400">Email Address</label>
                        <input name="email" type="email" placeholder="you@example.com" onChange={handleChange} required className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-400">Password</label>
                        <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required className="w-full p-3 mt-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors flex justify-center items-center disabled:bg-indigo-800">
                        {isLoading ? <Spinner /> : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>
                <p className="text-sm text-gray-500 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setMode(isLogin ? 'signup' : 'login')} className="font-semibold text-indigo-400 hover:underline">
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

const EmailVerificationPage = ({ token, setCurrentPage, setNotification }) => {
    const [verificationStatus, setVerificationStatus] = React.useState('Verifying your email...');

    React.useEffect(() => {
        const verify = async () => {
            try {
                const data = await api.request(`/api/users/verify-email/${token}`);
                setVerificationStatus(data.message);
                setNotification({ type: 'success', message: data.message });
            } catch (error) {
                setVerificationStatus(error.message);
                setNotification({ type: 'error', message: error.message });
            }
        };
        verify();
    }, [token, setNotification]);

    return (
        <div className="text-center p-8 bg-gray-800 rounded-lg max-w-md mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-4">Email Verification</h2>
            <p className="text-gray-300 mb-6">{verificationStatus}</p>
            <button onClick={() => setCurrentPage({ page: 'auth', mode: 'login' })} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-lg">
                Proceed to Login
            </button>
        </div>
    );
};

// --- AI Tool Components ---

const ImageGenerator = ({ onAction }) => {
    const [prompt, setPrompt] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onAction(setIsLoading, setResult, '/api/tools/generate-image', { prompt });
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit}>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A futuristic cityscape at sunset, synthwave style" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white h-24 resize-none" />
                <button type="submit" disabled={isLoading} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:bg-indigo-800">
                    {isLoading ? <Spinner /> : 'Generate Image (5 Credits)'}
                </button>
            </form>
            <div className="mt-4 w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {isLoading && <Spinner />}
                {result && <img src={`data:image/png;base64,${result.images[0]}`} alt="Generated by AI" className="rounded-lg object-contain w-full h-full" />}
                {!isLoading && !result && <p className="text-gray-500">Your generated image will appear here</p>}
            </div>
        </div>
    );
};

const TextRepurpose = ({ onAction }) => {
    const [text, setText] = React.useState('');
    const [platform, setPlatform] = React.useState('Twitter');
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await onAction(setIsLoading, setResult, '/api/tools/repurpose-text', { text, platform });
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit}>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your long-form text here (min 50 characters)..." className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white h-32 resize-none" />
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-3 mt-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-white">
                    <option>Twitter</option>
                    <option>LinkedIn</option>
                    <option>Blog Post</option>
                </select>
                <button type="submit" disabled={isLoading} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center disabled:bg-indigo-800">
                    {isLoading ? <Spinner /> : 'Repurpose Text (2 Credits)'}
                </button>
            </form>
            <div className="mt-4 w-full p-4 bg-gray-700 rounded-lg min-h-[100px]">
                {isLoading && <Spinner />}
                {result && <p className="text-white whitespace-pre-wrap">{result.repurposed_text}</p>}
            </div>
        </div>
    );
};

const ToolsPage = ({ setNotification }) => {
    const { user, token, updateUser } = useAuth();
    const [activeTool, setActiveTool] = React.useState('image');

    const handleApiAction = async (setIsLoading, setResult, endpoint, body) => {
        if (!user) {
            setNotification({ type: 'error', message: 'You must be logged in to use tools.' });
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const data = await api.request(endpoint, 'POST', body, token);
            setResult(data);
            const refreshedUser = await api.request('/api/users/me', 'GET', null, token);
            updateUser(refreshedUser);
            setNotification({ type: 'success', message: 'Action completed successfully!' });
        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        } finally {
            setIsLoading(false);
        }
    };
    
    const toolComponents = {
        image: <ImageGenerator onAction={handleApiAction} />,
        repurpose: <TextRepurpose onAction={handleApiAction} />,
        // Placeholders for other tools
        prompt: <div>Prompt Generator Coming Soon!</div>,
        caption: <div>Caption Generator Coming Soon!</div>,
    };
    
    const toolTabs = [
        { id: 'image', name: 'Image Generator', icon: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z' },
        { id: 'repurpose', name: 'Text Repurposer', icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12' },
        { id: 'prompt', name: 'Prompt Generator', icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z' },
        { id: 'caption', name: 'Caption Generator', icon: 'M7.5 8.25h9m-9 3h9m3.75-9.75H3.75c-1.036 0-1.875.84-1.875 1.875v11.25c0 1.035.84 1.875 1.875 1.875h13.5c1.035 0 1.875-.84 1.875-1.875V5.25c0-1.035-.84-1.875-1.875-1.875z' },
    ];

    if (!user) {
        return <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-lg">Please log in to use the AI tools.</div>;
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-4xl font-extrabold text-center text-white mb-12">AI Tools Dashboard</h2>
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                <div className="flex border-b border-gray-700">
                    {toolTabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTool(tab.id)} className={`flex-1 p-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${activeTool === tab.id ? 'bg-gray-700 text-indigo-400' : 'text-gray-400 hover:bg-gray-700/50'}`}>
                           <Icon path={tab.icon} className="w-5 h-5" />
                           <span>{tab.name}</span>
                        </button>
                    ))}
                </div>
                <div className="p-8">
                    {toolComponents[activeTool]}
                </div>
            </div>
        </div>
    );
};


const PaymentsPage = () => {
    const { user, token, updateUser } = useAuth();
    const [plans, setPlans] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [notification, setNotification] = React.useState({ message: '', type: '' });

    React.useEffect(() => {
        const loadRazorpayScript = () => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);
        };
        loadRazorpayScript();
        
        const fetchPlans = async () => {
            if (token) {
                try {
                    const data = await api.request('/api/payments/plans', 'GET', null, token);
                    setPlans(data);
                } catch (error) {
                    setNotification({ type: 'error', message: "Could not fetch plans." });
                }
            }
            setIsLoading(false);
        };
        fetchPlans();
    }, [token]);

    const handlePayment = async (plan) => {
        try {
            const order = await api.request('/api/payments/create-order', 'POST', { plan_id: plan.id }, token);
            
            const options = {
                key: order.key_id,
                amount: order.amount,
                currency: order.currency,
                name: "AIBUDDIES Credits",
                description: `Purchase ${plan.credits} credits`,
                order_id: order.order_id,
                handler: async function (response) {
                    try {
                        const verificationData = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        };
                        const verificationResult = await api.request('/api/payments/verify-signature', 'POST', verificationData, token);
                        updateUser({ credits: verificationResult.new_credits });
                        setNotification({ type: 'success', message: verificationResult.message });
                    } catch (error) {
                         setNotification({ type: 'error', message: "Payment verification failed." });
                    }
                },
                prefill: {
                    name: user.fullname,
                    email: user.email,
                },
                theme: {
                    color: "#4F46E5"
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            setNotification({ type: 'error', message: error.message });
        }
    };

    if (isLoading) return <div className="text-center"><Spinner /></div>
    if (!user) return <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-lg">Please log in to purchase credits.</div>

    return (
        <div className="animate-fade-in">
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
            <h2 className="text-4xl font-extrabold text-center text-white mb-4">Get More Credits</h2>
            <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto">Purchase credits to continue using our powerful suite of AI tools.</p>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map(plan => (
                    <div key={plan.id} className={`bg-gray-800 p-8 rounded-2xl shadow-lg border ${plan.name === 'Pro' ? 'border-indigo-500' : 'border-gray-700'} flex flex-col`}>
                        <h3 className="text-2xl font-bold text-white text-center mb-2">{plan.name}</h3>
                        <p className="text-center mb-6"><span className="text-4xl font-bold text-white">₹{plan.price_in_paise / 100}</span></p>
                        <p className="text-center text-yellow-400 font-bold text-xl mb-6">{plan.credits} Credits</p>
                        <button onClick={() => handlePayment(plan)} className={`${plan.name === 'Pro' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-700 hover:bg-indigo-600'} text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full mt-auto`}>
                            Buy Now
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HomePage = ({ setCurrentPage }) => (
    <div className="text-center py-16 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight">
            Supercharge Your Content with <span className="text-indigo-400">AI</span>
        </h1>
        <p className="text-xl text-gray-400 mt-6 max-w-3xl mx-auto">
            AIBUDDIES is your all-in-one platform for generating images, repurposing text, creating captions, and more. Get started with free credits and see the magic happen.
        </p>
        <button onClick={() => setCurrentPage({ page: 'auth', mode: 'signup' })} className="mt-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 px-10 rounded-lg shadow-lg text-lg transition-transform duration-200 transform hover:scale-105">
            Get Started for Free
        </button>
    </div>
);


// --- Main Application Component ---

const AppContent = () => {
    const [currentPage, setCurrentPage] = React.useState({ page: 'home' });
    const [notification, setNotification] = React.useState({ message: '', type: '' });
    const { isLoading } = useAuth();

    React.useEffect(() => {
        const path = window.location.pathname;
        const parts = path.split('/').filter(Boolean);
        if (parts[0] === 'auth' && parts[1] === 'verify-email' && parts[2]) {
            setCurrentPage({ page: 'verify-email', token: parts[2] });
        }
    }, []);

    const renderPage = () => {
        switch (currentPage.page) {
            case 'auth':
                return <AuthPage mode={currentPage.mode} setCurrentPage={setCurrentPage} setNotification={setNotification} />;
            case 'verify-email':
                return <EmailVerificationPage token={currentPage.token} setCurrentPage={setCurrentPage} setNotification={setNotification} />;
            case 'tools':
                return <ToolsPage setNotification={setNotification} />;
            case 'payments':
                return <PaymentsPage />;
            case 'home':
            default:
                return <HomePage setCurrentPage={setCurrentPage} />;
        }
    };

    if (isLoading) {
        return <div className="min-h-screen bg-gray-900 flex justify-center items-center"><Spinner /></div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-gray-200">
            <style>{`
                .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
                .animate-fade-in-down { animation: fadeInDown 0.5s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: '', type: '' })} />
            <Header setCurrentPage={setCurrentPage} />
            <main className="container mx-auto px-6 py-12">
                {renderPage()}
            </main>
        </div>
    );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

