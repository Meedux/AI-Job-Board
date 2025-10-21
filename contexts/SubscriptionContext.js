'use client';

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

// Subscription action types
const SUBSCRIPTION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SUBSCRIPTION: 'SET_SUBSCRIPTION',
  SET_CREDITS: 'SET_CREDITS',
  SET_PAYMENT_INTENT: 'SET_PAYMENT_INTENT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_CREDIT_BALANCE: 'UPDATE_CREDIT_BALANCE',
  SET_PAYMENT_SUCCESS: 'SET_PAYMENT_SUCCESS',
  SET_PLANS: 'SET_PLANS',
  SET_PACKAGES: 'SET_PACKAGES',
  SET_BUNDLES: 'SET_BUNDLES',
};

// Initial state
const initialState = {
  loading: false,
  subscription: null,
  credits: {
    resume_view: 0,
    ai_credits: 0,
    job_application: 0,
  },
  paymentIntent: null,
  error: null,
  paymentSuccess: false,
  plans: [],
  packages: [],
  bundles: [],
};

// Subscription reducer
function subscriptionReducer(state, action) {
  switch (action.type) {
    case SUBSCRIPTION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case SUBSCRIPTION_ACTIONS.SET_SUBSCRIPTION:
      return { ...state, subscription: action.payload, loading: false };
    case SUBSCRIPTION_ACTIONS.SET_CREDITS:
      return { ...state, credits: action.payload, loading: false };
    case SUBSCRIPTION_ACTIONS.SET_PAYMENT_INTENT:
      return { ...state, paymentIntent: action.payload };
    case SUBSCRIPTION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case SUBSCRIPTION_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case SUBSCRIPTION_ACTIONS.UPDATE_CREDIT_BALANCE:
      return {
        ...state,
        credits: {
          ...state.credits,
          [action.payload.type]: action.payload.balance,
        },
      };
    case SUBSCRIPTION_ACTIONS.SET_PAYMENT_SUCCESS:
      return { ...state, paymentSuccess: action.payload };
    case SUBSCRIPTION_ACTIONS.SET_PLANS:
      return { ...state, plans: action.payload };
    case SUBSCRIPTION_ACTIONS.SET_PACKAGES:
      return { ...state, packages: action.payload };
    case SUBSCRIPTION_ACTIONS.SET_BUNDLES:
      return { ...state, bundles: action.payload };
    default:
      return state;
  }
}

// Subscription Provider
export function SubscriptionProvider({ children }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);
  const { user } = useAuth();

  // Load subscription data
  const loadSubscriptionData = useCallback(async () => {
    try {
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await fetch('/api/subscription/status', {
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: SUBSCRIPTION_ACTIONS.SET_SUBSCRIPTION, payload: data.subscription });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);

  // Load credit balance
  const loadCreditBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/credits/balance', {
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: SUBSCRIPTION_ACTIONS.SET_CREDITS, payload: data.credits });
      }
    } catch (error) {
      console.error('Error loading credit balance:', error);
    }
  }, []);

  // Load all user data (subscription + credits)
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_LOADING, payload: true });
      
      // Load subscription and credits in parallel
      await Promise.all([
        loadSubscriptionData(),
        loadCreditBalance()
      ]);
      
    } catch (error) {
      console.error('Error loading user data:', error);
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_LOADING, payload: false });
    }
  }, [user, loadSubscriptionData, loadCreditBalance]);

  // Load subscription data when user changes
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Load subscription plans
  const loadPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: SUBSCRIPTION_ACTIONS.SET_PLANS, payload: data.plans });
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  }, []);

  // Load credit packages
  const loadPackages = useCallback(async () => {
    try {
      const response = await fetch('/api/credits/packages');
      if (response.ok) {
        const data = await response.json();
        // Use the 'all' array instead of the grouped 'packages' object
        dispatch({ type: SUBSCRIPTION_ACTIONS.SET_PACKAGES, payload: data.all || [] });
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    }
  }, []);

  // Subscribe to a plan
  const subscribeToPlan = async (planId, billingCycle = 'monthly') => {
    try {
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: SUBSCRIPTION_ACTIONS.CLEAR_ERROR });

      const response = await fetch('/api/subscription/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ planId, billingCycle }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if it's a free subscription (no payment intent)
        if (data.subscription && data.message) {
          // Free subscription activated directly
          dispatch({ type: SUBSCRIPTION_ACTIONS.SET_SUBSCRIPTION, payload: data.subscription });
          dispatch({ type: SUBSCRIPTION_ACTIONS.SET_PAYMENT_SUCCESS, payload: true });
          return { isFree: true, subscription: data.subscription };
        } else if (data.paymentIntent) {
          // Paid subscription - payment intent created
          dispatch({ type: SUBSCRIPTION_ACTIONS.SET_PAYMENT_INTENT, payload: data.paymentIntent });
          return { isFree: false, paymentIntent: data.paymentIntent };
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Purchase credits
  const purchaseCredits = async (packageId) => {
    try {
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: SUBSCRIPTION_ACTIONS.CLEAR_ERROR });

      const response = await fetch('/api/credits/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: SUBSCRIPTION_ACTIONS.SET_PAYMENT_INTENT, payload: data.paymentIntent });
        return data.paymentIntent;
      } else {
        throw new Error(data.error || 'Failed to purchase credits');
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Use credits
  const useCredits = async (type, amount = 1, referenceId = null) => {
    try {
      const response = await fetch('/api/credits/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ 
          type, 
          amount: -amount, // Negative for usage
          referenceId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ 
          type: SUBSCRIPTION_ACTIONS.UPDATE_CREDIT_BALANCE, 
          payload: { type, balance: data.balance } 
        });
        return data.balance;
      } else {
        throw new Error(data.error || 'Failed to use credits');
      }
    } catch (error) {
      console.error('Error using credits:', error);
      throw error;
    }
  };

  // Update local credit balance (useful when the server authoritatively changes credits)
  const setCreditBalance = useCallback((type, balance) => {
    dispatch({ type: SUBSCRIPTION_ACTIONS.UPDATE_CREDIT_BALANCE, payload: { type, balance } });
  }, []);

  // Cancel subscription
  const cancelSubscription = async () => {
    try {
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: SUBSCRIPTION_ACTIONS.CLEAR_ERROR });

      const response = await fetch('/api/subscription/status', {
        method: 'DELETE',
        credentials: 'include', // Include cookies for authentication
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: SUBSCRIPTION_ACTIONS.SET_SUBSCRIPTION, payload: data.subscription });
        return data.subscription;
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      dispatch({ type: SUBSCRIPTION_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Check if user has access to a feature
  const hasFeatureAccess = useCallback((feature) => {
    if (!state.subscription) return false;
    
    const plan = state.subscription.subscription_plans;
    if (!plan) return false;

    const features = plan.features || [];
    return features.includes(feature);
  }, [state.subscription]);

  // Check if user has enough credits
  const hasEnoughCredits = useCallback((type, amount = 1) => {
    const balance = state.credits[type] || 0;
    return balance >= amount;
  }, [state.credits]);

  // Get credit balance for a specific type
  const getCreditBalance = useCallback((type) => {
    return state.credits[type] || 0;
  }, [state.credits]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: SUBSCRIPTION_ACTIONS.CLEAR_ERROR });
  }, []);

  // Set payment success
  const setPaymentSuccess = useCallback((success) => {
    dispatch({ type: SUBSCRIPTION_ACTIONS.SET_PAYMENT_SUCCESS, payload: success });
  }, []);

  const value = {
    ...state,
    loadSubscriptionData,
    loadCreditBalance,
    loadPlans,
    loadPackages,
    subscribeToPlan,
    purchaseCredits,
    useCredits,
    setCreditBalance,
    cancelSubscription,
    hasFeatureAccess,
    hasEnoughCredits,
    getCreditBalance,
    loadUserData,
    clearError,
    setPaymentSuccess,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Custom hook to use subscription context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

export default SubscriptionContext;
