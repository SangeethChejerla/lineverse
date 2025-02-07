// app/view-list/page.tsx (View List Page)
'use client';

import {
  deletePhrase,
  getCategories,
  getPhrasesByCategory,
  togglePhrasePin,
} from '@/actions/phraseAction';
import { Button } from '@/components/ui/button';
import { Category, Phrase } from '@/db/schema'; // Import Category
import { Pin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ViewListPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  ); // Store full Category objects

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getCategories();
      if (categories) {
        setAvailableCategories(categories);
        if (categories.length > 0 && selectedCategoryId === null) {
          setSelectedCategoryId(categories[0].id);
        }
      }
    };
    fetchCategories();
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    const fetchPhrases = async () => {
      if (selectedCategoryId !== null && !isNaN(selectedCategoryId)) {
        const fetchedPhrases = await getPhrasesByCategory(selectedCategoryId);
        if (fetchedPhrases) {
          setPhrases(fetchedPhrases);
        }
      } else {
        setPhrases([]); // Clear phrases if no category is selected
      }
    };

    fetchPhrases();
  }, [selectedCategoryId]);

  const handleTogglePin = async (phraseId: number, currentPinned: boolean) => {
    const result = await togglePhrasePin(phraseId, currentPinned);
    if (result && result.error) {
      toast.error(result.error as string);
      console.error('Pin toggle failed:', result.error);
    } else {
      // Optimistic update, then re-fetch to ensure consistency
      setPhrases((prevPhrases) =>
        prevPhrases.map((p) =>
          p.id === phraseId ? { ...p, pinned: !currentPinned } : p
        )
      );

      // Re-fetch phrases to reflect changes (ensure correct order)
      if (selectedCategoryId !== null && !isNaN(selectedCategoryId)) {
        const fetchedPhrases = await getPhrasesByCategory(selectedCategoryId);
        if (fetchedPhrases) {
          setPhrases(fetchedPhrases);
        }
      }
      toast.success('Pin toggled successfully!');
    }
  };

  const handleDelete = async (phraseId: number) => {
    const result = await deletePhrase(phraseId);
    if (result && result.error) {
      toast.error(result.error);
    } else {
      setPhrases((prevPhrases) => prevPhrases.filter((p) => p.id !== phraseId));
      toast.success('Phrase deleted successfully!');
    }
  };

  return (
    <div className="w-full max-w-2xl mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">View List</h2>
      <div className="mb-4 flex flex-wrap gap-2">
        <p className="mr-2 font-semibold">Select a Category:</p>
        {availableCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategoryId(category.id)}
            className="mr-2"
          >
            {category.icon} {category.label} {/* Display icon and label */}
          </Button>
        ))}
      </div>
      {selectedCategoryId !== null ? (
        <>
          {phrases.length > 0 ? (
            <div className="flex flex-col">
              {/* Pinned Phrases */}
              {phrases
                .filter((p) => p.pinned)
                .map((phrase) => (
                  <div
                    key={phrase.id}
                    className="bg-yellow-100 p-3 mb-2 rounded-lg border border-yellow-300 flex justify-between items-center"
                  >
                    <span>{phrase.text}</span>
                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleTogglePin(phrase.id, phrase.pinned)
                        }
                      >
                        <Pin
                          className={
                            phrase.pinned
                              ? 'h-4 w-4 text-yellow-500'
                              : 'h-4 w-4'
                          }
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(phrase.id)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                ))}

              {/* Regular Phrases */}
              {phrases
                .filter((p) => !p.pinned)
                .map((phrase) => (
                  <div
                    key={phrase.id}
                    className="bg-white p-3 mb-2 rounded-lg border border-gray-300 flex justify-between items-center"
                  >
                    <span>{phrase.text}</span>
                    <div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleTogglePin(phrase.id, phrase.pinned)
                        }
                      >
                        <Pin
                          className={
                            phrase.pinned
                              ? 'h-4 w-4 text-yellow-500'
                              : 'h-4 w-4'
                          }
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(phrase.id)}
                      >
                        X
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p>No phrases in this category yet.</p>
          )}
        </>
      ) : (
        <p>Select a category to view phrases.</p>
      )}
    </div>
  );
}
