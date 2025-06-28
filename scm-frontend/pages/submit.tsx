'use client';

import { useState } from 'react';
import axios from 'axios';

export default function SubmitPage() {
  const [itemName, setItemName] = useState('');
  const [weight, setWeight] = useState('');
  const [itemType, setItemType] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      const { data } = await axios.post(
        "https://zinc-cat-bumper.glitch.me/submit-scale-data",
        {
          itemName,
          weight: parseFloat(weight),
          itemType,
          timestamp: timestamp ? parseInt(timestamp) : Math.floor(Date.now() / 1000),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer TESTABCD',
          },
        }
      );

      setResponse(data.message || 'Success');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || 'Submission failed');
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black text-gray-800 dark:text-white p-4">
      <div className="w-full max-w-md shadow-xl border border-gray-200 dark:border-zinc-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Submit Scale Data
        </h2>
        <input
          className="w-full p-2 mt-4 border rounded dark:bg-zinc-800 dark:text-white"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          className="w-full p-2 mt-4 border rounded dark:bg-zinc-800 dark:text-white"
          placeholder="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          className="w-full p-2 mt-4 border rounded dark:bg-zinc-800 dark:text-white"
          placeholder="Item Type"
          value={itemType}
          onChange={(e) => setItemType(e.target.value)}
        />
        <input
          className="w-full p-2 mt-4 border rounded dark:bg-zinc-800 dark:text-white"
          placeholder="Timestamp (optional)"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        />
        <button
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={loading || !itemName || !weight || !itemType}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        {response && <p className="mt-4 text-green-600 dark:text-green-400">✅ {response}</p>}
        {error && <p className="mt-4 text-red-600 dark:text-red-400">❌ {error}</p>}
      </div>
    </div>
  );
}