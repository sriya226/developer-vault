exports.CATEGORIES = [
  'JavaScript', 'React', 'Node.js', 'Python', 'AI/ML', 'IoT',
  'Databases', 'DevOps', 'Cloud', 'Web Development', 'Other',
];
exports.RESOURCE_TYPES = [
  'Documentation', 'GitHub Repository', 'Tutorial', 'Article',
  'Tool', 'Course', 'Video', 'Other',
];
exports.EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
exports.str = (v) => (typeof v === 'string' ? v : '');
