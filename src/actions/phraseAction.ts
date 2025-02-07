// lib/actions.ts
'use server';
import { db } from '@/db';
import {
  categories,
  Category,
  NewCategory,
  NewPhrase,
  Phrase,
  phrases,
} from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- Category Actions ---

const categorySchema = z.object({
  label: z.string().min(1).max(255),
  icon: z.string().min(1),
});

export async function createCategory(formData: FormData) {
  const parsed = categorySchema.safeParse({
    label: formData.get('label'),
    icon: formData.get('icon'),
  });

  if (!parsed.success) {
    return { error: parsed.error.format() };
  }

  const newCategory: NewCategory = {
    ...parsed.data,
  };

  try {
    const result = await db.insert(categories).values(newCategory).returning();
    revalidatePath('/'); // Revalidate the home page (and any other relevant pages)
    revalidatePath('/view-list');
    return result[0];
  } catch (error: any) {
    if (error.message.includes('unique constraint')) {
      return {
        error: { _errors: ['Category with this name already exists.'] },
      };
    }
    console.error('Error creating category:', error);
    return { error: { _errors: ['Failed to create category.'] } };
  }
}

export async function getCategories() {
  try {
    const allCategories: Category[] = await db.select().from(categories); // Get all categories
    return allCategories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return []; // Return empty array on error
  }
}

export async function deleteCategory(categoryId: number) {
  try {
    await db.delete(categories).where(eq(categories.id, categoryId));
    revalidatePath('/');
    revalidatePath('/view-list');
  } catch (error) {
    console.error('Error deleting category:', error);
    return { error: 'Failed to delete category.' }; // Provide error feedback
  }
}

// --- Phrase Actions ---

const phraseSchema = z.object({
  text: z.string().min(1),
  categoryId: z.number(),
});

export async function createPhrase(formData: FormData) {
  const parsed = phraseSchema.safeParse({
    text: formData.get('text'),
    categoryId: Number(formData.get('categoryId')), // Convert to number
  });

  if (!parsed.success) {
    return { error: parsed.error.format() };
  }
  if (isNaN(parsed.data.categoryId)) {
    return { error: { categoryId: ['Category ID is required.'] } }; // Specific categoryId error
  }

  const newPhrase: NewPhrase = {
    ...parsed.data,
    pinned: false, // Default to not pinned
  };

  try {
    const result = await db.insert(phrases).values(newPhrase).returning();
    revalidatePath('/view-list');
    revalidatePath('/random');
    revalidatePath('/carousel');
    return result[0];
  } catch (error) {
    console.error('Error creating phrase:', error);
    return { error: { _errors: ['Failed to create phrase.'] } };
  }
}

export async function getPhrasesByCategory(categoryId: number) {
  try {
    const allPhrases: Phrase[] = await db
      .select()
      .from(phrases)
      .where(eq(phrases.categoryId, categoryId)); // Get all phrases in category
    return allPhrases;
  } catch (error) {
    console.error('Error getting phrases:', error);
    return [];
  }
}

export async function togglePhrasePin(phraseId: number, pinned: boolean) {
  try {
    // Get the phrase to check the category and current pinned status.
    const phrase = await db
      .select()
      .from(phrases)
      .where(eq(phrases.id, phraseId))
      .limit(1);

    if (phrase.length === 0) {
      throw new Error('Phrase not found');
    }

    const currentPhrase = phrase[0];
    if (!currentPhrase) {
      return { error: 'Phrase not found.' };
    }

    // Enforce pin limit *before* updating.
    if (!pinned) {
      // Only check limit if we're trying to *pin*
      const pinnedCount = await db
        .select()
        .from(phrases)
        .where(
          and(
            eq(phrases.categoryId, currentPhrase.categoryId),
            eq(phrases.pinned, true)
          )
        )
        .execute();

      if (pinnedCount.length >= 3) {
        return {
          error: { _errors: ['You can only pin 3 phrases per category.'] },
        };
      }
    }

    await db.update(phrases).set({ pinned }).where(eq(phrases.id, phraseId));
    revalidatePath('/view-list'); // Only needs to revalidate view-list
    return { success: true }; // Indicate success
  } catch (error) {
    console.error('Error toggling pin:', error);
    return { error: 'Failed to toggle pin.' }; // Consistent error handling
  }
}

export async function deletePhrase(phraseId: number) {
  try {
    await db.delete(phrases).where(eq(phrases.id, phraseId));
    revalidatePath('/view-list');
    revalidatePath('/random');
    revalidatePath('/carousel');
  } catch (error) {
    console.error('Error deleting phrase:', error);
    return { error: 'Failed to delete phrase.' };
  }
}
