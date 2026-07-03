require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Note = require('./src/models/Note');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clean up existing test user
  const existing = await User.findOne({ email: 'test@smartnotes.com' });
  if (existing) {
    await Note.deleteMany({ userId: existing._id });
    await User.deleteOne({ _id: existing._id });
    console.log('Cleared existing test data');
  }

  const user = await User.create({
    name: 'Alex Johnson',
    email: 'test@smartnotes.com',
    password: 'password123',
  });
  console.log('Created user:', user.email);

  const notes = [
    {
      title: 'Welcome to Smart Notes!',
      content: '## Getting Started\n\nThis is your first note. You can:\n- Create new notes\n- Organize by category\n- Add tags\n- Pin important notes\n\nEnjoy using Smart Notes!',
      category: 'personal',
      tags: ['welcome', 'intro'],
      isPinned: true,
      status: 'active',
    },
    {
      title: 'Q3 Project Roadmap',
      content: '## Goals\n\n1. Launch new auth system\n2. Migrate database to MongoDB Atlas\n3. Add real-time collaboration\n\n## Deadlines\n- Auth: July 15\n- DB migration: July 30\n- Collaboration: August 20',
      category: 'work',
      tags: ['roadmap', 'planning', 'Q3'],
      isPinned: true,
      status: 'active',
    },
    {
      title: 'React Hooks Cheatsheet',
      content: '## Common Hooks\n\n**useState** – local state\n```js\nconst [count, setCount] = useState(0);\n```\n\n**useEffect** – side effects\n```js\nuseEffect(() => { fetchData(); }, []);\n```\n\n**useRef** – mutable ref without re-render',
      category: 'study',
      tags: ['react', 'hooks', 'javascript'],
      isPinned: false,
      status: 'active',
    },
    {
      title: 'Weekly Budget Tracker',
      content: '## July Week 1\n\n| Item | Amount |\n|------|--------|\n| Rent | $1200 |\n| Groceries | $150 |\n| Transport | $60 |\n| Entertainment | $80 |\n\n**Total:** $1490',
      category: 'finance',
      tags: ['budget', 'monthly', 'expenses'],
      isPinned: false,
      status: 'active',
    },
    {
      title: 'Morning Routine',
      content: '## Daily Habits\n\n- [ ] 7:00 AM – Wake up, no phone for 30 min\n- [ ] 7:30 AM – Exercise (30 min)\n- [ ] 8:00 AM – Shower + breakfast\n- [ ] 8:30 AM – Read for 20 min\n- [ ] 9:00 AM – Start work',
      category: 'health',
      tags: ['routine', 'habits', 'morning'],
      isPinned: false,
      status: 'active',
    },
    {
      title: 'Book Reading List',
      content: '## Currently Reading\n- *Atomic Habits* – James Clear\n\n## Up Next\n- Clean Code – Robert Martin\n- The Pragmatic Programmer\n- Designing Data-Intensive Applications\n\n## Finished\n- ~~The Lean Startup~~',
      category: 'personal',
      tags: ['books', 'reading', 'self-improvement'],
      isPinned: false,
      status: 'active',
    },
    {
      title: 'SQL Study Notes',
      content: '## Key Concepts\n\n- **JOIN types**: INNER, LEFT, RIGHT, FULL OUTER\n- **Indexes**: Speed up reads, slow down writes\n- **Transactions**: ACID properties\n- **Normalization**: 1NF → 2NF → 3NF\n\n## Practice Problems\n- Write a query to find duplicate emails\n- Implement pagination with LIMIT/OFFSET',
      category: 'study',
      tags: ['sql', 'database', 'backend'],
      isPinned: false,
      status: 'active',
    },
    {
      title: 'Grocery List',
      content: '- [ ] Eggs\n- [ ] Milk\n- [ ] Bread\n- [ ] Chicken breast\n- [ ] Spinach\n- [ ] Olive oil\n- [ ] Greek yogurt\n- [ ] Oats',
      category: 'personal',
      tags: ['grocery', 'shopping'],
      isPinned: false,
      status: 'active',
    },
    {
      title: 'Meeting Notes – Sprint Review',
      content: '**Date:** June 28, 2026\n**Attendees:** Alex, Sara, Mike, Lena\n\n## Completed\n- User auth flow\n- Notes CRUD API\n- Frontend search\n\n## Blockers\n- Image upload on Vercel (serverless limitation)\n\n## Action Items\n- Alex: fix upload middleware by July 2',
      category: 'work',
      tags: ['meeting', 'sprint', 'agile'],
      isPinned: false,
      status: 'active',
    },
    {
      title: 'Old Project Ideas',
      content: 'Ideas from last year that are no longer relevant:\n- Build a Twitter clone\n- Make a todo app in Angular\n- Write a blog in plain HTML',
      category: 'other',
      tags: ['ideas', 'old'],
      isPinned: false,
      status: 'archived',
    },
  ];

  const created = await Note.insertMany(notes.map(n => ({ ...n, userId: user._id })));
  console.log(`Created ${created.length} notes`);

  await mongoose.disconnect();
  console.log('\nDone! Login with:');
  console.log('  Email:    test@smartnotes.com');
  console.log('  Password: password123');
}

seed().catch(err => { console.error(err); process.exit(1); });
