import { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import api from '../lib/api';
import useUserStore from '../store/userStore';

const BuyCreditsPage = () => {
    const [plans, setPlans] = useState();
    const { user, updateCredits } = useUserStore();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await api.getCreditPlans();
                setPlans(data);
            } catch (error) {
                console.error("Failed to fetch plans", error);
            }
        };
        fetchPlans();
    },);

    const handlePurchase = async (planId) => {
        try {
            const order = await api.createOrder({ plan_id: planId });
            
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "AIBUDDIES",
                description: "Credit Purchase",
                order_id: order.order_id,
                handler: async function (response) {
                    try {
                        await api.verifyPayment(response);
                        const me = await api.getMe(); // Refetch user to update credits
                        updateCredits(me.credits);
                        alert("Payment successful! Credits added.");
                    } catch (verifyError) {
                        alert(verifyError.message |

| "Payment verification failed.");
                    }
                },
                prefill: {
                    name: user.fullname,
                    email: user.email,
                },
                theme: {
                    color: "#4F46E5",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            alert(error.message |

| "Failed to create order.");
        }
    };

    return (
        <>
            <Head>
                <title>Buy Credits - AIBUDDIES</title>
            </Head>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            
            <div className="max-w-4xl mx-auto py-12">
                <h2 className="text-3xl font-bold text-gray-900">Buy Credits</h2>
                <p className="mt-4 text-lg text-gray-600">Choose a plan that works for you.</p>
                
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map(plan => (
                        <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md text-center">
                            <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
                            <p className="mt-4 text-4xl font-bold text-indigo-600">{plan.credits} <span className="text-lg font-medium text-gray-500">Credits</span></p>
                            <p className="mt-2 text-lg text-gray-600">₹{plan.price_in_paise / 100}</p>
                            <button 
                                onClick={() => handlePurchase(plan.id)}
                                className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Buy Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BuyCreditsPage;
