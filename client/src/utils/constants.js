import {
  Atom, Braces, Server, Terminal, Sparkles, Cpu, Database, Boxes, Cloud, Globe, Folder,
  BookOpen, Github, Lightbulb, FileText, Wrench, GraduationCap, Video, Link2,
} from 'lucide-react';

export const CATEGORIES = ['JavaScript', 'React', 'Node.js', 'Python', 'AI/ML', 'IoT', 'Databases', 'DevOps', 'Cloud', 'Web Development', 'Other'];
export const RESOURCE_TYPES = ['Documentation', 'GitHub Repository', 'Tutorial', 'Article', 'Tool', 'Course', 'Video', 'Other'];

// Short labels for the filter chips
export const TYPE_LABELS = { 'GitHub Repository': 'GitHub' };

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A-Z' },
  { value: 'updated', label: 'Recently updated' },
];

export const CATEGORY_ICONS = {
  JavaScript: Braces, React: Atom, 'Node.js': Server, Python: Terminal, 'AI/ML': Sparkles, IoT: Cpu,
  Databases: Database, DevOps: Boxes, Cloud, 'Web Development': Globe, Other: Folder,
};
export const TYPE_ICONS = {
  Documentation: BookOpen, 'GitHub Repository': Github, Tutorial: Lightbulb, Article: FileText,
  Tool: Wrench, Course: GraduationCap, Video, Other: Link2,
};
