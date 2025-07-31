import React, { useState } from 'react';
import TextRepurposerTool from '../components/tools/TextRepurposerTool';
import PromptGeneratorTool from '../components/tools/PromptGeneratorTool';
import CaptionGeneratorTool from '../components/tools/CaptionGeneratorTool';

const DashboardPage = ({ user, onToolComplete }) => {
  const [activeTool, setActiveTool] = useState(null);

  const tools = [
    { id: 'repurpose', title: 'Text Repurposer', description: 'Turn text into a Tweet, LinkedIn post, etc.' },
    { id: 'prompt', title: 'Prompt Generator', description: 'Get creative prompts for your next project.' },
    { id: 'caption', title: 'Caption Generator', description: 'Generate catchy captions for social media.' },
    { id: 'image', title: 'Image Generator', description: 'Create stunning images from text (Coming Soon!).' },
  ];

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'repurpose':
        return <TextRepurposerTool onComplete={onToolComplete} />;
      case 'prompt':
        return <PromptGeneratorTool onComplete={onToolComplete} />;
      case 'caption':
        return <CaptionGeneratorTool onComplete={onToolComplete} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!activeTool ? (
        <>
          <h2 className="text-3xl font-bold leading-tight text-gray-900">Welcome, {user.fullname}!</h2>
          <p className="mt-4 text-lg text-gray-600">Select a tool to get started.</p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => tool.id !== 'image' && setActiveTool(tool.id)}
                disabled={tool.id === 'image'}
                className="text-left bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <h3 className="text-xl font-semibold text-gray-800">{tool.title}</h3>
                <p className="mt-2 text-gray-600">{tool.description}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
           <button onClick={() => setActiveTool(null)} className="mb-8 text-indigo-600 hover:text-indigo-800 font-medium">
                &larr; Back to Tools
            </button>
          {renderActiveTool()}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
