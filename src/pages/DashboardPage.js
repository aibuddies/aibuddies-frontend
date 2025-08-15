import React, { useEffect } from 'react';
import { useAuth, useCredits } from '../contexts';
import { useNavigate } from 'react-router-dom';
import ToolCard from '../components/dashboard/ToolCard';
import CreditBalance from '../components/dashboard/CreditBalance';
import AdRewardBanner from '../components/dashboard/AdRewardBanner';

const DashboardPage = () => {
  const { user } = useAuth();
  const { credits, fetchCreditPlans } = useCredits();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCreditPlans();
  }, [fetchCreditPlans]);

  const tools = [
    { 
      id: 'repurpose', 
      title: 'Text Repurposing', 
      icon: '📝', 
      description: 'Transform your content for different platforms',
      cost: 2 
    },
    { 
      id: 'prompt', 
      title: 'Prompt Generation', 
      icon: '💡', 
      description: 'Create engaging AI prompts instantly',
      cost: 1 
    },
    { 
      id: 'caption', 
      title: 'Caption Generation', 
      icon: '📸', 
      description: 'Generate perfect captions for your images',
      cost: 1 
    },
    { 
      id: 'image', 
      title: 'Image Generation', 
      icon: '🎨', 
      description: 'Create stunning visuals from text prompts',
      cost: 5 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.fullname || 'Creator'}!
        </h1>
        <p className="text-gray-600">
          What would you like to create today?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map(tool => (
                <ToolCard 
                  key={tool.id}
                  tool={tool}
                  credits={credits}
                  onClick={() => navigate(`/tools/${tool.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <CreditBalance credits={credits} />
          <AdRewardBanner />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
