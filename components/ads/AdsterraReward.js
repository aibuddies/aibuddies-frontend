import { useEffect, useRef, useState } from 'react';
import api from '../../lib/api'; // Your API client
import useUserStore from '../../store/userStore';

const AdsterraReward = () => {
    const adContainer = useRef(null);
    const [isClaimable, setIsClaimable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { updateCredits } = useUserStore();

    useEffect(() => {
        // Adsterra script injection logic
        if (adContainer.current &&!adContainer.current.firstChild) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = `
                atOptions = {
                    'key' : '2d651c0a67c987dd8fed23aa1691255b', // Your actual key
                    'format' : 'iframe',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                };
            `;
            const adScript = document.createElement('script');
            adScript.type = 'text/javascript';
            adScript.src = '//pl27262292.profitableratecpm.com/2d/651c0a67c987dd8fed23aa1691255b.js';

            adContainer.current.append(script);
            adContainer.current.append(adScript);
        }

        // Enable the claim button after a delay
        const timer = setTimeout(() => {
            setIsClaimable(true);
        }, 20000); // 20-second delay

        return () => clearTimeout(timer);
    },);

    const handleClaim = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            await api.claimAdReward();
            const me = await api.getMe(); // Refetch user to get new credit balance
            updateCredits(me.credits);
            setMessage('Success! 3 credits have been added to your account.');
        } catch (error) {
            setMessage(error.message |

| 'Failed to claim reward. Please try again later.');
        } finally {
            setIsLoading(false);
            setIsClaimable(false); // Prevent multiple claims
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Earn Free Credits</h3>
            <p className="text-gray-600 mb-6">Watch the ad below for 20 seconds to earn 3 credits.</p>
            
            <div ref={adContainer} className="flex justify-center my-4 min-h-[250px]"></div>

            <button 
                onClick={handleClaim}
                disabled={!isClaimable |

| isLoading}
                className="w-full mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
                {isLoading? 'Claiming...' : 'Claim 3 Credits'}
            </button>
            {message && <p className="mt-4 text-sm text-center">{message}</p>}
        </div>
    );
};

export default AdsterraReward;
