'use client';

import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

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
        'https://zinc-cat-bumper.glitch.me/submit-scale-data',
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
    } catch (err) {
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border border-gray-200">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-xl font-bold text-gray-800">Submit Scale Data</h2>
          <Input
            placeholder="Item Name"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Input
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <Input
            placeholder="Item Type"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
          />
          <Input
            placeholder="Timestamp (optional)"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />

          <Button onClick={handleSubmit} disabled={loading || !itemName || !weight || !itemType}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>

          {response && <p className="text-green-600">✅ {response}</p>}
          {error && <p className="text-red-600">❌ {error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
