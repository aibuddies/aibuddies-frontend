import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '../contexts';
import api from '../services/api';
import CreditPlanCard from '../components/payment/CreditPlanCard';
import PaymentModal from '../components/payment/PaymentModal';
import { toast } from 'react-toastify';
import { loadRazorpay } from '../utils/razorpay';

const PaymentPage = () => {
  const { creditPlans, fetchCreditPlans, updateCredits } = useCredits();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (creditPlans.length === 0) {
      fetchCreditPlans();
    }
  }, [creditPlans, fetchCreditPlans]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    
    try {
      // Create Razorpay order
      const orderResponse = await api.createOrder(selectedPlan.id);
      const order = orderResponse.data;
      
      // Load Razorpay SDK
      await loadRazorpay();
      
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'AIBUDDIES',
        description: `Purchase of ${selectedPlan.credits} credits`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            // Verify payment signature
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            toast.success('Payment successful! Credits added to your account');
            updateCredits(selectedPlan.credits);
            setShowModal(false);
          } catch (error) {
            toast.error('Payment verification failed');
            console.error('Payment error:', error);
          }
        },
        prefill: {
          name: 'Customer Name', // Will be replaced with actual user name
          email: 'customer@email.com' // Will be replaced with actual user email
        },
        theme: {
          color: '#6366F1'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error('Failed to create payment order');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Buy AI Credits</h1>
          <p className="text-gray-600">
            Purchase credits to unlock powerful AI content creation tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {creditPlans.map(plan => (
            <CreditPlanCard 
              key={plan.id}
              plan={plan}
              onSelect={handlePlanSelect}
            />
          ))}
        </div>
      </div>
      
      {showModal && selectedPlan && (
        <PaymentModal 
          plan={selectedPlan}
          onConfirm={handlePayment}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default PaymentPage;
