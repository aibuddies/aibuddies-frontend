
import React, { useState } from 'react';
import api from '../../api';
import Spinner from '../Spinner';

const CaptionGeneratorTool = ({ onComplete }) => {
    const [description, setDescription] = useState('');
    const [result, setResult] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setResult([]);
        try {
            const response = await api.generateCaption({ image_description: description });
            setResult(response.captions.filter(c => c.trim() !== ''));
            onComplete();
        } catch (err) {
            setError(err.message || 'Failed to generate captions.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Caption Generator</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your image here..."
                    className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 transition"
                    required
                />
                <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors">
                    {isLoading && <Spinner />}
                    {isLoading ? 'Generating...' : 'Generate Captions (1 Credit)'}
                </button>
            </form>
            {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
            {result.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md border">
                    <h4 className="font-semibold text-gray-700">Generated Captions:</h4>
                    <ul className="mt-2 list-disc list-inside space-y-2 text-gray-800">
                        {result.map((caption, index) => <li key={index}>{caption}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CaptionGeneratorTool;
