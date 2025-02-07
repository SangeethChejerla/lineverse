// app/carousel/page.tsx
'use client';

import { getCategories, getPhrasesByCategory } from '@/actions/phraseAction';
import { Button } from '@/components/ui/button';
import { Category, Phrase } from '@/db/schema'; // Import Category
import { ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CarouselPage() {
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const carouselRef = useRef<HTMLDivElement>(null);

  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  ); // For category selection

  useEffect(() => {
    const fetchCategories = async () => {
      const categories = await getCategories();
      if (categories) {
        setAvailableCategories(categories);
        if (categories.length > 0) {
          setSelectedCategoryId(categories[0].id); // Select first category initially
        }
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPhrases = async () => {
      if (selectedCategoryId !== null && !isNaN(selectedCategoryId)) {
        const fetchedPhrases = await getPhrasesByCategory(selectedCategoryId);
        if (fetchedPhrases) {
          setPhrases(fetchedPhrases);
          setCarouselIndex(0); // Reset index when category changes
        }
      } else {
        setPhrases([]); // Clear the phrase if no category selected
      }
    };
    fetchPhrases();
  }, [selectedCategoryId]);

  const handleNextCarousel = () => {
    setCarouselIndex((prevIndex) => (prevIndex + 1) % phrases.length);
  };

  const handlePrevCarousel = () => {
    setCarouselIndex((prevIndex) =>
      prevIndex === 0 ? phrases.length - 1 : prevIndex - 1
    );
  };

  const currentCarouselPhrase = phrases[carouselIndex];

  return (
    <div className="w-full max-w-2xl mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Carousel</h2>
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
      <>
        {phrases.length > 0 ? (
          <div className="relative" ref={carouselRef}>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-lg">{currentCarouselPhrase?.text}</p>
            </div>
            <Button
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={handlePrevCarousel}
            >
              <ChevronRight className="h-6 w-6 transform rotate-180" />
            </Button>
            <Button
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleNextCarousel}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        ) : selectedCategoryId !== null ? (
          <p>No phrases in this category yet.</p>
        ) : (
          <p>Select a category.</p>
        )}
      </>
    </div>
  );
}
