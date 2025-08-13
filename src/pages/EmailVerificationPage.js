import React, { useState, useEffect } from 'react';
import api from '../api';

export default function EmailVerificationPage({ token, setView }) {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token found.');
        return;
      }
      try {
        const response = await api.verifyEmail(token);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'An error occurred.');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center">
      <div className="max-w-md w-full mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
        {status === 'verifying' && (
          <div className="text-lg font-medium text-gray-700">{message}</div>
        )}
        {status === 'success' && (
          <div>
            <h2 className="text-2xl font-bold text-green-600">Success!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <button
              onClick={() => setView('login')}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Proceed to Login
            </button>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
             <button
              onClick={() => setView('login')}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
