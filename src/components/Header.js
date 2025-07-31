import React from 'react';

const Header = ({ user, onLogout }) => (
  <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">AIBUDDIES</h1>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">{user.fullname}</span>
              <span className="mx-2 hidden sm:inline">|</span>
              <span className="font-bold text-indigo-600 block sm:inline mt-1 sm:mt-0">{user.credits} Credits</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  </header>
);

export default Header;