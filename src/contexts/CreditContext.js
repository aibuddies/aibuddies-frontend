import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CreditContext = createContext();

export const CreditProvider = ({ children }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState(user?.credits || 0);
  const [creditPlans, setCreditPlans] = useState([]);

  useEffect(() => {
    if (user) {
      setCredits(user.credits);
    }
  }, [user]);

  const fetchCreditPlans = async () => {
    try {
      const response = await api.getCreditPlans();
      setCreditPlans(response.data);
    } catch (error) {
      console.error('Error fetching credit plans:', error);
    }
  };

  const updateCredits = (amount) => {
    setCredits(prev => prev + amount);
  };

  const claimReward = async () => {
    try {
      await api.claimReward();
      updateCredits(3);
      return true;
    } catch (error) {
      console.error('Error claiming reward:', error);
      return false;
    }
  };

  return (
    <CreditContext.Provider value={{ 
      credits, 
      creditPlans, 
      updateCredits, 
      claimReward,
      fetchCreditPlans
    }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCredits = () => useContext(CreditContext);
