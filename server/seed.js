// Optional demo data. Creates a separate demo account (isDemo: true) so it never mixes with real users.
//   npm run seed          -> (re)create demo user + sample bookmarks
//   npm run seed:destroy  -> remove demo user + their bookmarks
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Bookmark = require('./models/Bookmark');

const DEMO_EMAIL = 'demo@developervault.dev';
const DEMO_PASSWORD = 'Demo@1234';

const samples = [
  ['https://react.dev', 'React Documentation', 'Official React documentation and learning resources.', 'React', 'Documentation', ['react', 'javascript'], true],
  ['https://nodejs.org/docs/latest/api/', 'Node.js Documentation', 'API reference for the Node.js runtime.', 'Node.js', 'Documentation', ['node', 'backend'], false],
  ['https://www.mongodb.com/docs/', 'MongoDB Documentation', 'Guides and references for MongoDB and Atlas.', 'Databases', 'Documentation', ['mongodb', 'database'], true],
  ['https://github.com', 'GitHub', 'Where developers build, ship and maintain software together.', 'DevOps', 'Tool', ['git', 'hosting'], false],
  ['https://developer.mozilla.org', 'MDN Web Docs', 'Resources for developers, by developers: HTML, CSS and JavaScript.', 'Web Development', 'Documentation', ['html', 'css', 'javascript'], true],
  ['https://docs.python.org/3/', 'Python Documentation', 'The official Python 3 documentation and tutorial.', 'Python', 'Documentation', ['python'], false],
  ['https://expressjs.com', 'Express.js Documentation', 'Fast, unopinionated, minimalist web framework for Node.js.', 'Node.js', 'Documentation', ['express', 'node', 'api'], false],
];

(async () => {
  await connectDB();
  const existing = await User.findOne({ email: DEMO_EMAIL });
  if (existing && !existing.isDemo) {
    console.error(`${DEMO_EMAIL} belongs to a real account. Aborting so nothing is overwritten.`);
    process.exit(1);
  }
  if (existing) {
    await Bookmark.deleteMany({ userId: existing._id });
    await existing.deleteOne();
    console.log('Removed existing demo data.');
  }
  if (process.argv.includes('--destroy')) {
    await mongoose.disconnect();
    return;
  }

  const user = await User.create({ name: 'Demo Developer', email: DEMO_EMAIL, password: await bcrypt.hash(DEMO_PASSWORD, 12), isDemo: true });
  await Bookmark.insertMany(
    samples.map(([url, title, description, category, resourceType, tags, favorite]) => {
      const u = new URL(url);
      return { userId: user._id, url, title, description, website: u.hostname.replace(/^www\./, ''), favicon: `${u.origin}/favicon.ico`, category, resourceType, tags, favorite };
    })
  );
  console.log(`Seeded ${samples.length} bookmarks.\nLogin: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
