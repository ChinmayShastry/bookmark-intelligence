import { describe, expect, it } from 'vitest';
import { classifyBookmark } from '../src/lib/classifier';
import { buildDefaultCategories } from '../src/lib/classifier/defaultCategories';

const categories = buildDefaultCategories();

describe('classifyBookmark', () => {
  it('classifies a GitHub AI repo into Development-adjacent categories', () => {
    const result = classifyBookmark(
      {
        title: 'LangChain Documentation',
        url: 'https://github.com/langchain-ai/langchain',
        domain: 'github.com',
        folder: 'Programming / AI',
      },
      categories
    );
    expect(result.categoryIds).toContain('programming');
    expect(result.categoryIds).toContain('ai-ml');
    expect(result.suggestedTags).toContain('LangChain');
  });

  it('classifies an AI article as AI + Education-ish topics', () => {
    const result = classifyBookmark(
      {
        title: 'How AI Agents Work',
        url: 'https://medium.com/some-post',
        domain: 'medium.com',
        folder: undefined,
      },
      categories
    );
    expect(result.categoryIds).toContain('ai-ml');
    expect(result.suggestedTags).toContain('Agents');
  });

  it('falls back to Other when nothing matches', () => {
    const result = classifyBookmark(
      { title: 'zzzzz qqqqq', url: 'https://example.com/xyz', domain: 'example.com' },
      categories
    );
    expect(result.categoryIds).toEqual(['other']);
  });

  it('does not match substrings inside unrelated words', () => {
    // "ai" should not match inside "mail" or "said"
    const result = classifyBookmark(
      { title: 'I said check your mail', url: 'https://example.com/x', domain: 'example.com' },
      categories
    );
    expect(result.categoryIds).not.toContain('ai-ml');
  });

  it('matches a category by domain even without keyword hits', () => {
    const result = classifyBookmark(
      { title: 'Untitled', url: 'https://figma.com/file/abc', domain: 'figma.com' },
      categories
    );
    expect(result.categoryIds).toContain('design');
  });
});
