import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useCredits } from '../contexts';
import api from '../services/api';
import ToolHeader from '../components/tools/ToolHeader';
import InputSection from '../components/tools/InputSection';
import OutputSection from '../components/tools/OutputSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-toastify';

const ToolPage = () => {
  const { tool } = useParams();
  const { credits, updateCredits } = useCredits();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [additionalOption, setAdditionalOption] = useState('');

  const toolConfig = {
    repurpose: {
      title: 'Text Repurposing',
      description: 'Transform your content for different platforms',
      inputLabel: 'Enter your text',
      inputPlaceholder: 'Paste your article, blog post, or content here...',
      cost: 2,
      apiCall: api.repurposeText,
      options: [
        { value: 'Twitter', label: 'Twitter' },
        { value: 'LinkedIn', label: 'LinkedIn' },
        { value: 'Instagram', label: 'Instagram' },
        { value: 'Facebook', label: 'Facebook' },
      ]
    },
    prompt: {
      title: 'Prompt Generation',
      description: 'Create engaging AI prompts instantly',
      inputLabel: 'Enter your topic',
      inputPlaceholder: 'Describe what you want to create...',
      cost: 1,
      apiCall: api.generatePrompt,
      options: []
    },
    caption: {
      title: 'Caption Generation',
      description: 'Generate perfect captions for your images',
      inputLabel: 'Describe your image',
      inputPlaceholder: 'What does your image show?',
      cost: 1,
      apiCall: api.generateCaption,
      options: []
    },
    image: {
      title: 'Image Generation',
      description: 'Create stunning visuals from text prompts',
      inputLabel: 'Describe your image',
      inputPlaceholder: 'Be as descriptive as possible...',
      cost: 5,
      apiCall: api.generateImage,
      options: []
    }
  };

  const config = toolConfig[tool] || toolConfig.repurpose;

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast.error('Please provide input content');
      return;
    }

    if (credits < config.cost) {
      toast.error('Insufficient credits');
      navigate('/payment');
      return;
    }

    setLoading(true);
    
    try {
      const payload = tool === 'repurpose' 
        ? { text: input, platform: additionalOption }
        : tool === 'image'
        ? { prompt: input }
        : tool === 'caption'
        ? { image_description: input }
        : { topic: input };
      
      const response = await config.apiCall(payload);
      setOutput(tool === 'image' ? response.data.images : response.data);
      updateCredits(-config.cost);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
      console.error('Tool error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToolHeader 
        title={config.title}
        description={config.description}
        cost={config.cost}
        credits={credits}
        onBack={() => navigate('/dashboard')}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <InputSection 
          label={config.inputLabel}
          placeholder={config.inputPlaceholder}
          value={input}
          onChange={setInput}
          options={config.options}
          selectedOption={additionalOption}
          onOptionChange={setAdditionalOption}
          onSubmit={handleSubmit}
          disabled={loading}
        />
        
        <OutputSection 
          output={output}
          loading={loading}
          toolType={tool}
        />
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner size="large" />
          <p className="text-white mt-4">Generating content...</p>
        </div>
      )}
    </div>
  );
};

export default ToolPage;
