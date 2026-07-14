import { productSearchRepository } from '@/repositories/productSearchRepository';
import { searchSchema } from '@/validators/searchValidator';

export class ProductSearchService {
  async searchProducts(q: string | null | undefined, limitParam: string | null | undefined) {
    if (!q) {
      throw new Error('Validation failed: Search query parameter "q" is required and cannot be empty.');
    }

    const validated = searchSchema.safeParse({
      q,
      limit: limitParam || undefined,
    });

    if (!validated.success) {
      const errorMessage = validated.error.issues.map((e) => e.message).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    const { q: cleanedQuery, limit } = validated.data;

    const results = await productSearchRepository.search(cleanedQuery, limit);

    return {
      results,
      totalResults: results.length,
    };
  }
}

export const productSearchService = new ProductSearchService();
