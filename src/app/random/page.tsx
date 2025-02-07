// app/random/page.tsx
'use client';

import { getCategories, getPhrasesByCategory } from '@/actions/phraseAction';
import { Button } from '@/components/ui/button';
import { Category, Phrase } from '@/db/schema'; // Import Category
import { useEffect, useState } from 'react';

export default function RandomPage() {
  const [randomPhrase, setRandomPhrase] = useState<Phrase | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  ); // Store full Category

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getCategories();
      if (categories) {
        setAvailableCategories(categories);
        if (categories.length > 0) {
          setSelectedCategoryId(categories[0].id); // Select the first one initially
        }
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRandomPhrase = async () => {
      if (selectedCategoryId !== null && !isNaN(selectedCategoryId)) {
        const phrases = await getPhrasesByCategory(selectedCategoryId);
        if (phrases && phrases.length > 0) {
          const randomIndex = Math.floor(Math.random() * phrases.length);
          setRandomPhrase(phrases[randomIndex]);
        } else {
          setRandomPhrase(null); // No phrases in category
        }
      } else {
        setRandomPhrase(null); // No category Selected
      }
    };
    fetchRandomPhrase();
  }, [selectedCategoryId]);

  return (
    <div className="w-full max-w-2xl mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Random Phrase</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        <p className="mr-2 font-semibold">Select a Category:</p>
        {availableCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategoryId(category.id)}
            className="mr-2"
          >
            {category.icon} {category.label}
          </Button>
        ))}
      </div>
      <div>
        {randomPhrase ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg">{randomPhrase.text}</p>
          </div>
        ) : selectedCategoryId !== null ? (
          <p>No phrases in this category yet.</p>
        ) : (
          <p>Select a category to get a random phrase.</p>
        )}
      </div>
    </div>
  );
}
