import React, { useState } from 'react';
import api from '../../api';
import Spinner from '../Spinner';

const TextRepurposerTool = ({ onComplete }) => {
    const [text, setText] = useState('');
    const [platform, setPlatform] = useState('Twitter');
    const [result, setResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setResult('');
        try {
            const response = await api.repurposeText({ text, platform });
            setResult(response.repurposed_text);
            onComplete();
        } catch (err) {
            setError(err.message || 'Failed to repurpose text.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Text Repurposer</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your original text here (at least 50 characters)..."
                    className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition"
                    required
                    minLength="50"
                />
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition"
                >
                    <option>Twitter</option>
                    <option>LinkedIn</option>
                    <option>Blog Post</option>
                </select>
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors">
                    {isLoading && <Spinner />}
                    {isLoading ? 'Repurposing...' : 'Repurpose (2 Credits)'}
                </button>
            </form>
            {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
            {result && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md border">
                    <h4 className="font-semibold text-gray-700">Result:</h4>
                    <p className="mt-2 text-gray-800 whitespace-pre-wrap">{result}</p>
                </div>
            )}
        </div>
    );
};

export default TextRepurposerTool;
