import type { Category } from '../db/types';

export interface CategorySeed {
  id: string;
  name: string;
  domains: string[];
  keywords: string[];
}

/**
 * Deterministic keyword/domain seeds for the built-in categories. Every
 * bookmark is scored against this list locally — no network calls, no AI
 * API. Users can rename, edit, merge, or delete these from Settings; edits
 * are persisted to the `categories` IndexedDB store and override these
 * defaults from then on.
 */
export const DEFAULT_CATEGORY_SEEDS: CategorySeed[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    domains: [
      'openai.com', 'anthropic.com', 'claude.ai', 'huggingface.co', 'langchain.com',
      'python.langchain.com', 'langchain-ai.github.io', 'deepmind.google', 'ai.google.dev',
      'paperswithcode.com', 'replicate.com', 'cohere.com', 'stability.ai', 'perplexity.ai',
      'gemini.google.com', 'chat.openai.com',
    ],
    keywords: [
      'artificial intelligence', 'machine learning', ' ai ', 'llm', 'gpt', 'chatgpt', 'rag',
      'langchain', 'langgraph', 'neural network', 'deep learning', 'transformer', 'ai agent',
      'embeddings', 'fine-tun', 'prompt engineering', 'generative ai', 'diffusion model',
      'computer vision', 'nlp', 'openai', 'anthropic', 'claude', 'gemini', 'mistral ai',
    ],
  },
  {
    id: 'programming',
    name: 'Programming',
    domains: [
      'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com', 'npmjs.com',
      'pypi.org', 'crates.io', 'leetcode.com', 'codewars.com', 'geeksforgeeks.org',
      'docs.python.org', 'go.dev', 'rust-lang.org',
    ],
    keywords: [
      'algorithm', 'data structure', 'programming', 'source code', 'repository', 'pull request',
      'compiler', 'python', 'javascript', 'typescript', 'golang', ' rust ', 'java ', 'c++',
      'leetcode', 'coding interview', 'regex', 'unit test', 'debugging', 'command line', 'cli tool',
    ],
  },
  {
    id: 'web-development',
    name: 'Web Development',
    domains: [
      'developer.mozilla.org', 'web.dev', 'css-tricks.com', 'smashingmagazine.com',
      'vercel.com', 'netlify.com', 'astro.build', 'react.dev', 'nextjs.org', 'tailwindcss.com',
      'vuejs.org', 'svelte.dev', 'caniuse.com',
    ],
    keywords: [
      'html', 'css', 'frontend', 'front-end', 'backend', 'web development', 'react', 'react.js',
      'vue.js', 'angular', 'svelte', 'next.js', 'node.js', 'webpack', 'vite', 'tailwind',
      'responsive design', 'web api', 'dom', 'browser extension', 'web app', 'ssr', 'jamstack',
    ],
  },
  {
    id: 'design',
    name: 'Design',
    domains: [
      'figma.com', 'dribbble.com', 'behance.net', 'canva.com', 'coolors.co', 'fontshare.com',
      'awwwards.com', 'sketch.com', 'framer.com', 'material.io', 'uxdesign.cc',
    ],
    keywords: [
      'ui design', 'ux design', 'user interface', 'user experience', 'figma', 'prototype',
      'wireframe', 'typography', 'color palette', 'branding', 'illustration', 'design system',
      'icon set', 'mockup',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    domains: ['hbr.org', 'inc.com', 'entrepreneur.com', 'fastcompany.com'],
    keywords: [
      'startup', 'business strategy', 'management', 'entrepreneurship', 'leadership',
      'business model', 'b2b', 'venture capital', 'fundraising', 'pitch deck', 'market fit',
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    domains: [
      'investopedia.com', 'bloomberg.com', 'wsj.com', 'nerdwallet.com', 'coinmarketcap.com',
      'coingecko.com', 'tradingview.com', 'morningstar.com',
    ],
    keywords: [
      'investing', 'stock market', 'cryptocurrency', ' crypto ', 'budgeting', 'personal finance',
      'retirement', 'portfolio', 'mortgage', 'interest rate', 'index fund', 'etf ', 'taxes',
    ],
  },
  {
    id: 'career',
    name: 'Career',
    domains: ['linkedin.com', 'indeed.com', 'glassdoor.com', 'levels.fyi', 'themuse.com'],
    keywords: [
      'resume', 'job search', 'career', 'interview prep', 'hiring', 'salary negotiation',
      'cover letter', 'job posting', 'linkedin', 'networking',
    ],
  },
  {
    id: 'education',
    name: 'Education',
    domains: [
      'coursera.org', 'udemy.com', 'khanacademy.org', 'edx.org', 'wikipedia.org',
      'brilliant.org', 'duolingo.com',
    ],
    keywords: [
      'course', 'tutorial', 'lecture', 'mooc', 'certification', 'study guide', 'curriculum',
      'university', 'textbook',
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity',
    domains: [
      'notion.so', 'todoist.com', 'trello.com', 'asana.com', 'obsidian.md', 'clickup.com',
      'roamresearch.com', 'linear.app',
    ],
    keywords: [
      'productivity', 'time management', 'note-taking', 'workflow', 'gtd', 'habit tracker',
      'task management', 'second brain', 'pomodoro',
    ],
  },
  {
    id: 'research',
    name: 'Research',
    domains: [
      'arxiv.org', 'scholar.google.com', 'ncbi.nlm.nih.gov', 'jstor.org', 'researchgate.net',
      'nature.com', 'sciencedirect.com', 'ssrn.com',
    ],
    keywords: ['research paper', 'academic study', 'journal article', 'whitepaper', 'dataset', 'preprint', 'peer-reviewed'],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    domains: ['hubspot.com', 'mailchimp.com', 'semrush.com', 'ahrefs.com', 'moz.com'],
    keywords: [
      'seo', 'content marketing', 'email marketing', 'growth hacking', 'digital marketing',
      'copywriting', 'conversion rate', 'ad campaign', 'social media marketing',
    ],
  },
  {
    id: 'news',
    name: 'News',
    domains: [
      'nytimes.com', 'bbc.com', 'cnn.com', 'reuters.com', 'theverge.com', 'techcrunch.com',
      'arstechnica.com', 'news.ycombinator.com', 'apnews.com',
    ],
    keywords: ['breaking news', 'headline', 'news report'],
  },
  {
    id: 'tools',
    name: 'Tools',
    domains: ['zapier.com', 'ifttt.com', 'postman.com', 'cloudflare.com', 'vercel.com'],
    keywords: ['browser extension', 'chrome extension', 'productivity tool', 'automation tool', 'utility app'],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    domains: ['amazon.com', 'etsy.com', 'ebay.com', 'target.com', 'walmart.com'],
    keywords: ['buy now', 'price comparison', 'discount code', 'coupon', 'online store', 'product review'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    domains: [
      'netflix.com', 'imdb.com', 'spotify.com', 'twitch.tv', 'hulu.com', 'disneyplus.com',
      'rottentomatoes.com',
    ],
    keywords: ['movie review', 'tv show', 'streaming', 'playlist', 'video game', 'gaming setup', 'soundtrack'],
  },
  {
    id: 'social',
    name: 'Social',
    domains: [
      'twitter.com', 'x.com', 'reddit.com', 'facebook.com', 'instagram.com', 'threads.net',
      'mastodon.social', 'bsky.app',
    ],
    keywords: ['social media', 'subreddit', 'community forum'],
  },
  {
    id: 'travel',
    name: 'Travel',
    domains: ['airbnb.com', 'booking.com', 'tripadvisor.com', 'expedia.com', 'skyscanner.com'],
    keywords: ['flight booking', 'hotel deal', 'travel itinerary', 'vacation', 'travel guide', 'road trip'],
  },
  {
    id: 'personal',
    name: 'Personal',
    domains: [],
    keywords: ['recipe', 'meal plan', 'workout plan', 'fitness routine', 'personal journal', 'home improvement', 'diy project'],
  },
  {
    id: 'other',
    name: 'Other',
    domains: [],
    keywords: [],
  },
];

export function buildDefaultCategories(now = Date.now()): Category[] {
  return DEFAULT_CATEGORY_SEEDS.map((seed) => ({
    id: seed.id,
    name: seed.name,
    keywords: seed.keywords,
    domains: seed.domains,
    builtIn: true,
    createdAt: now,
  }));
}
