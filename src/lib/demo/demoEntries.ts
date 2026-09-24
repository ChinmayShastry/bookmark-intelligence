/** [title, url, folder] — a realistic, varied set of bookmarks for demo mode. */
export const DEMO_ENTRIES: Array<[string, string, string]> = [
  // AI & Machine Learning
  ['LangChain Documentation', 'https://python.langchain.com/docs/introduction/', 'Bookmarks bar / AI'],
  ['OpenAI API Reference', 'https://platform.openai.com/docs/api-reference', 'Bookmarks bar / AI'],
  ['Building RAG Applications with LangChain', 'https://medium.com/building-rag-applications', 'Bookmarks bar / AI'],
  ['How AI Agents Work', 'https://www.anthropic.com/research/how-agents-work', 'Bookmarks bar / AI'],
  ['Hugging Face Model Hub', 'https://huggingface.co/models', 'Bookmarks bar / AI'],
  ['Attention Is All You Need (paper)', 'https://arxiv.org/abs/1706.03762', 'Bookmarks bar / AI'],
  ['Claude API Documentation', 'https://docs.anthropic.com/claude/reference', 'Bookmarks bar / AI'],
  ['Prompt Engineering Guide', 'https://www.promptingguide.ai/', 'Bookmarks bar / AI'],
  ['LangGraph Documentation', 'https://langchain-ai.github.io/langgraph/', 'Bookmarks bar / AI'],
  ['Papers with Code - NLP', 'https://paperswithcode.com/area/natural-language-processing', 'Other bookmarks / Reading List'],
  ['Deep Learning Specialization', 'https://www.coursera.org/specializations/deep-learning', 'Other bookmarks / Reading List'],
  ['Fine-tuning LLMs on Custom Data', 'https://www.anthropic.com/news/fine-tuning', 'Bookmarks bar / AI'],

  // Programming
  ['GitHub - langchain-ai/langchain', 'https://github.com/langchain-ai/langchain', 'Bookmarks bar / Programming'],
  ['Stack Overflow - Python Questions', 'https://stackoverflow.com/questions/tagged/python', 'Bookmarks bar / Programming'],
  ['Python Official Docs', 'https://docs.python.org/3/', 'Bookmarks bar / Programming'],
  ['LeetCode - Top Interview Questions', 'https://leetcode.com/explore/interview/', 'Bookmarks bar / Programming'],
  ['Rust Programming Language Book', 'https://doc.rust-lang.org/book/', 'Bookmarks bar / Programming'],
  ['Go by Example', 'https://gobyexample.com/', 'Bookmarks bar / Programming'],
  ['Regex101', 'https://regex101.com/', 'Other bookmarks / Misc'],
  ['npm - Package Search', 'https://www.npmjs.com/', 'Bookmarks bar / Programming'],
  ['GitHub - facebook/react', 'https://github.com/facebook/react', 'Bookmarks bar / Programming'],
  ['GeeksforGeeks - Data Structures', 'https://www.geeksforgeeks.org/data-structures/', 'Other bookmarks / Reading List'],

  // Web Development
  ['MDN Web Docs - JavaScript', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'Bookmarks bar / Programming'],
  ['Astro Documentation', 'https://docs.astro.build/en/getting-started/', 'Bookmarks bar / Programming'],
  ['Tailwind CSS Docs', 'https://tailwindcss.com/docs', 'Bookmarks bar / Programming'],
  ['React Documentation', 'https://react.dev/learn', 'Bookmarks bar / Programming'],
  ['web.dev - Core Web Vitals', 'https://web.dev/vitals/', 'Other bookmarks / Reading List'],
  ['CSS-Tricks - A Guide to Flexbox', 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', 'Other bookmarks / Misc'],
  ['Can I Use', 'https://caniuse.com/', 'Other bookmarks / Misc'],
  ['Vercel - Next.js Deployment', 'https://vercel.com/docs', 'Bookmarks bar / Programming'],

  // Design
  ['Figma Community', 'https://www.figma.com/community', 'Bookmarks bar / Design'],
  ['Dribbble - UI Inspiration', 'https://dribbble.com/', 'Bookmarks bar / Design'],
  ['Coolors - Color Palette Generator', 'https://coolors.co/', 'Bookmarks bar / Design'],
  ['Awwwards - Site of the Day', 'https://www.awwwards.com/', 'Bookmarks bar / Design'],
  ['Material Design Guidelines', 'https://m3.material.io/', 'Bookmarks bar / Design'],
  ['Behance - Portfolio Inspiration', 'https://www.behance.net/', 'Other bookmarks / Reading List'],
  ['Fontshare - Free Fonts', 'https://www.fontshare.com/', 'Other bookmarks / Misc'],
  ['Framer - Interactive Prototypes', 'https://www.framer.com/', 'Bookmarks bar / Design'],

  // Finance
  ['Investopedia - Index Funds', 'https://www.investopedia.com/terms/i/indexfund.asp', 'Bookmarks bar / Finance'],
  ['NerdWallet - Budgeting 101', 'https://www.nerdwallet.com/article/finance/how-to-budget', 'Bookmarks bar / Finance'],
  ['TradingView - Charts', 'https://www.tradingview.com/', 'Bookmarks bar / Finance'],
  ['CoinMarketCap', 'https://coinmarketcap.com/', 'Other bookmarks / Misc'],
  ['Bloomberg - Markets', 'https://www.bloomberg.com/markets', 'Other bookmarks / Reading List'],
  ['Morningstar - ETF Ratings', 'https://www.morningstar.com/etfs', 'Bookmarks bar / Finance'],
  ['WSJ - Personal Finance', 'https://www.wsj.com/personal-finance', 'Other bookmarks / Reading List'],

  // Career
  ['LinkedIn - Job Search', 'https://www.linkedin.com/jobs/', 'Bookmarks bar / Career'],
  ['Levels.fyi - Salary Data', 'https://www.levels.fyi/', 'Bookmarks bar / Career'],
  ['Glassdoor - Interview Reviews', 'https://www.glassdoor.com/Interview/index.htm', 'Bookmarks bar / Career'],
  ['The Muse - Resume Tips', 'https://www.themuse.com/advice/resume', 'Other bookmarks / Reading List'],
  ['Indeed - Software Engineer Jobs', 'https://www.indeed.com/q-software-engineer-jobs.html', 'Bookmarks bar / Career'],
  ['Cracking the Coding Interview - Notes', 'https://www.crackingthecodinginterview.com/', 'Other bookmarks / Misc'],

  // Business
  ['Harvard Business Review', 'https://hbr.org/', 'Other bookmarks / Reading List'],
  ['Y Combinator - Startup Library', 'https://www.ycombinator.com/library', 'Other bookmarks / Reading List'],
  ['Inc.com - Growth Strategies', 'https://www.inc.com/', 'Other bookmarks / Misc'],
  ['Entrepreneur - Startup Advice', 'https://www.entrepreneur.com/', 'Other bookmarks / Misc'],
  ['Fast Company - Innovation', 'https://www.fastcompany.com/', 'Other bookmarks / Reading List'],

  // Education
  ['Khan Academy - Linear Algebra', 'https://www.khanacademy.org/math/linear-algebra', 'Other bookmarks / Reading List'],
  ['Coursera - Machine Learning', 'https://www.coursera.org/learn/machine-learning', 'Bookmarks bar / AI'],
  ['edX - CS50', 'https://www.edx.org/cs50', 'Other bookmarks / Reading List'],
  ['Wikipedia - Game Theory', 'https://en.wikipedia.org/wiki/Game_theory', 'Other bookmarks / Misc'],
  ['Brilliant.org - Probability', 'https://brilliant.org/courses/probability/', 'Other bookmarks / Reading List'],

  // Productivity
  ['Notion - Templates', 'https://www.notion.so/templates', 'Bookmarks bar / Tools'],
  ['Obsidian - Getting Started', 'https://obsidian.md/', 'Bookmarks bar / Tools'],
  ['Todoist - GTD Setup', 'https://www.todoist.com/productivity-methods/getting-things-done', 'Bookmarks bar / Tools'],
  ['Linear - Issue Tracking', 'https://linear.app/', 'Bookmarks bar / Tools'],
  ['Trello - Kanban Boards', 'https://trello.com/', 'Other bookmarks / Misc'],
  ['Roam Research', 'https://roamresearch.com/', 'Other bookmarks / Misc'],

  // Research
  ['arXiv.org', 'https://arxiv.org/', 'Bookmarks bar / AI'],
  ['Google Scholar', 'https://scholar.google.com/', 'Other bookmarks / Reading List'],
  ['ResearchGate', 'https://www.researchgate.net/', 'Other bookmarks / Misc'],
  ['Nature - Machine Learning', 'https://www.nature.com/subjects/machine-learning', 'Other bookmarks / Reading List'],

  // Marketing
  ['HubSpot - SEO Guide', 'https://www.hubspot.com/marketing/seo', 'Other bookmarks / Misc'],
  ['Ahrefs Blog - Keyword Research', 'https://ahrefs.com/blog/keyword-research/', 'Other bookmarks / Misc'],
  ['Mailchimp - Email Templates', 'https://mailchimp.com/resources/email-marketing-templates/', 'Other bookmarks / Misc'],
  ['Moz - SEO Learning Center', 'https://moz.com/learn/seo', 'Other bookmarks / Reading List'],

  // News
  ['The Verge - Tech News', 'https://www.theverge.com/', 'Other bookmarks / Reading List'],
  ['TechCrunch', 'https://techcrunch.com/', 'Other bookmarks / Reading List'],
  ['Hacker News', 'https://news.ycombinator.com/', 'Bookmarks bar / Programming'],
  ['Ars Technica', 'https://arstechnica.com/', 'Other bookmarks / Old Bookmarks'],

  // Tools
  ['Postman - API Testing', 'https://www.postman.com/', 'Bookmarks bar / Programming'],
  ['Zapier - Automation', 'https://zapier.com/', 'Other bookmarks / Misc'],
  ['Cloudflare Dashboard', 'https://dash.cloudflare.com/', 'Other bookmarks / Misc'],
  ['IFTTT', 'https://ifttt.com/', 'Imported / New Folder'],

  // Shopping
  ['Amazon - Wishlist', 'https://www.amazon.com/hz/wishlist', 'Other bookmarks / Old Bookmarks'],
  ['Etsy - Handmade Gifts', 'https://www.etsy.com/', 'Other bookmarks / Old Bookmarks'],
  ['eBay - Deals', 'https://www.ebay.com/deals', 'Imported / New Folder'],

  // Entertainment
  ['Netflix - My List', 'https://www.netflix.com/browse/my-list', 'Other bookmarks / Old Bookmarks'],
  ['IMDb - Top Rated', 'https://www.imdb.com/chart/top/', 'Other bookmarks / Old Bookmarks'],
  ['Spotify - Discover Weekly', 'https://open.spotify.com/', 'Other bookmarks / Old Bookmarks'],
  ['Twitch - Following', 'https://www.twitch.tv/directory/following', 'Imported / New Folder'],

  // Social
  ['Reddit - r/programming', 'https://www.reddit.com/r/programming/', 'Other bookmarks / Misc'],
  ['X (Twitter) - Bookmarks', 'https://x.com/i/bookmarks', 'Imported / New Folder'],
  ['Hacker News - Show HN', 'https://news.ycombinator.com/show', 'Bookmarks bar / Programming'],

  // Travel
  ['Airbnb - Saved Homes', 'https://www.airbnb.com/wishlists', 'Travel'],
  ['Skyscanner - Flight Deals', 'https://www.skyscanner.com/', 'Travel'],
  ['TripAdvisor - Tokyo Guide', 'https://www.tripadvisor.com/Tourism-g298184-Tokyo_Tokyo_Prefecture_Kanto-Vacations.html', 'Travel'],

  // Personal
  ['Budget Bytes - Recipes', 'https://www.budgetbytes.com/', 'Personal'],
  ['Nerd Fitness - Beginner Guide', 'https://www.nerdfitness.com/blog/', 'Personal'],
  ['r/personalfinance Wiki', 'https://www.reddit.com/r/personalfinance/wiki/index/', 'Personal'],
  ['My Reading List', 'https://www.notion.so/My-Reading-List', 'Personal'],
];

/** URL substrings to duplicate (with a trailing-slash variant) for the duplicate-detection demo. */
export const DEMO_DUPLICATE_TARGETS = [
  'github.com/langchain-ai',
  'investopedia.com',
  'theverge.com',
  'figma.com/community',
  'linkedin.com/jobs',
  'notion.so/templates',
  'coursera.org/learn/machine-learning',
];

export const DEMO_NOTES = [
  'Referenced this while building the onboarding flow.',
  'Good primer — revisit before the interview.',
  'Bookmarked from a newsletter, haven’t read it yet.',
  'A teammate recommended this.',
  'Useful reference for the current project.',
  'Come back to this once the deadline passes.',
];
