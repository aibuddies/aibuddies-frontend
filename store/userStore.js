import { create } from 'zustand';

const useUserStore = create((set) => ({
  user: null,
  credits: 0,
  isLoggedIn: false,
  setUser: (userData) => set({ user: userData, credits: userData.credits, isLoggedIn: true }),
  clearUser: () => set({ user: null, credits: 0, isLoggedIn: false }),
  updateCredits: (newCredits) => set({ credits: newCredits }),
}));

export default useUserStore;
