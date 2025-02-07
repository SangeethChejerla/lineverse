// app/page.tsx (Home Page)

'use client';

import {
  createCategory,
  createPhrase,
  getCategories,
} from '@/actions/phraseAction';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/db/schema';
import { Menu, Mic, Plus } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

const MAX_TOOL_OPTIONS = 12;

export default function Home() {
  const [toolOptions, setToolOptions] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [inputText, setInputText] = useState('');

  // --- Data Fetching ---
  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      if (fetchedCategories) {
        setToolOptions(fetchedCategories);
        if (fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0].id);
        }
      }
    };
    fetchCategories();
  }, []);

  async function createCategoryAction(formData: FormData) {
    startTransition(async () => {
      const label = formData.get('label') as string;
      const icon = formData.get('icon') as string;

      if (!label || !icon) {
        toast.error('Label and Icon are required');
        return;
      }

      try {
        await createCategory(formData);
        toast.success('Category created successfully!');
        setIsDialogOpen(false);

        const updatedCategories = await getCategories();
        if (updatedCategories) {
          setToolOptions(updatedCategories);
          // Select the newly created category
          if (updatedCategories.length > 0) {
            setSelectedCategory(
              updatedCategories[updatedCategories.length - 1].id
            );
          }
        }
      } catch (error: any) {
        toast.error(
          error.message || 'An error occurred while creating the category'
        );
      }
    });
  }

  async function createPhraseAction(formData: FormData) {
    startTransition(async () => {
      const categoryId = formData.get('categoryId') as string;
      const text = formData.get('text') as string;

      if (!categoryId || categoryId === '') {
        toast.error('Please select a category.');
        return;
      }
      if (!text) {
        toast.error('Please enter a phrase.');
        return;
      }

      try {
        await createPhrase(formData);
        toast.success('Phrase added successfully!');
        setInputText('');
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || 'An unexpected error occurred.');
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#e6ff87] flex flex-col">
      <header className="flex justify-between p-4 items-center">
        <div>
          <Button
            variant={pathname === '/' ? 'default' : 'ghost'}
            onClick={() => router.push('/')}
            className="mr-2"
          >
            Home
          </Button>
          <Button
            variant={pathname === '/view-list' ? 'default' : 'ghost'}
            onClick={() => router.push('/view-list')}
            className="mr-2"
          >
            View List
          </Button>
          <Button
            variant={pathname === '/random' ? 'default' : 'ghost'}
            onClick={() => router.push('/random')}
            className="mr-2"
          >
            Random
          </Button>
          <Button
            variant={pathname === '/carousel' ? 'default' : 'ghost'}
            onClick={() => router.push('/carousel')}
            className="mr-2"
          >
            Carousel
          </Button>
        </div>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Category Selection */}
        <div className="flex gap-4 mt-4 flex-wrap justify-center">
          {toolOptions.map((option) => (
            <Button
              key={option.id}
              variant={selectedCategory === option.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(option.id)}
            >
              {option.icon} {option.label}
            </Button>
          ))}
          {toolOptions.length === 0 && (
            <p className="text-gray-500">Create a category first</p>
          )}

          {/* Add Category Button */}
          {toolOptions.length < MAX_TOOL_OPTIONS && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="p-20">
                  <Plus className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form action={createCategoryAction}>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a new category.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="label" className="text-right">
                        Category
                      </Label>
                      <Input
                        id="label"
                        name="label"
                        required
                        className="col-span-3"
                        placeholder="e.g., Simile"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="icon" className="text-right">
                        Icon
                      </Label>
                      <Input
                        id="icon"
                        name="icon"
                        required
                        className="col-span-3"
                        placeholder="e.g., A=B"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      Add
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Phrase Input and Add Button */}
        <div className="mt-12 text-center max-w-2xl w-full">
          <h2 className="text-7xl md:text-9xl font-bold mt-2">Phrase</h2>
          <p className="text-sm mt-4 text-gray-700">
            Create a simile about a thing or concept.
          </p>
        </div>

        <div className="mt-12 w-full max-w-2xl relative">
          <div className="absolute top-[-1.5rem] right-4 flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              Speak
            </Button>
            <Mic className="h-4 w-4" />
          </div>
          <Input
            type="text"
            placeholder="Enter a thing or concept:"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="text-center border-none shadow-md"
            maxLength={25}
          />
          <div className="text-sm mt-1 text-gray-500 text-right pr-4">
            {inputText.length} / 25
          </div>
        </div>

        <form action={createPhraseAction} className="w-full max-w-xs">
          <input
            type="hidden"
            name="categoryId"
            value={selectedCategory || ''}
          />
          <input type="hidden" name="text" value={inputText} />
          <Button
            type="submit"
            className="mt-4 bg-black text-white px-8 py-3 rounded-full"
            disabled={!selectedCategory || isPending}
          >
            Add Phrase
          </Button>
        </form>
      </main>
    </div>
  );
}
