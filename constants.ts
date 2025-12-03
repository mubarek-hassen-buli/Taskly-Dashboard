import { Task, User, ChatMessage, TabStatus } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Brenda',
  avatar: 'https://picsum.photos/seed/brenda/100/100',
  role: 'Product Designer',
  email: 'brenda@taskly.com',
  status: 'Online'
};

export const TEAM_MEMBERS: User[] = [
  { 
    id: 'u2', 
    name: 'Michie', 
    avatar: 'https://picsum.photos/seed/michie/100/100',
    role: 'Senior Developer',
    email: 'michie@taskly.com',
    status: 'Online'
  },
  { 
    id: 'u3', 
    name: 'John', 
    avatar: 'https://picsum.photos/seed/john/100/100',
    role: 'Product Manager',
    email: 'john@taskly.com',
    status: 'Busy'
  },
  { 
    id: 'u4', 
    name: 'Sarah', 
    avatar: 'https://picsum.photos/seed/sarah/100/100',
    role: 'UX Researcher',
    email: 'sarah@taskly.com',
    status: 'Offline'
  },
  { 
    id: 'u5', 
    name: 'Mike', 
    avatar: 'https://picsum.photos/seed/mike/100/100',
    role: 'Frontend Dev',
    email: 'mike@taskly.com',
    status: 'Online'
  },
  { 
    id: 'u6', 
    name: 'Jessica', 
    avatar: 'https://picsum.photos/seed/jessica/100/100',
    role: 'Marketing Lead',
    email: 'jess@taskly.com',
    status: 'Offline'
  },
  { 
    id: 'u7', 
    name: 'David', 
    avatar: 'https://picsum.photos/seed/david/100/100',
    role: 'Backend Dev',
    email: 'david@taskly.com',
    status: 'Busy'
  },
];

export const TASKS: Task[] = [
  {
    id: 't1',
    title: 'Revamp Sidebar',
    description: 'Redesign navigation with better spacing for easier access.',
    priority: 'Urgent',
    dueDate: 'Sep 14',
    commentsCount: 10,
    attachmentsCount: 2,
    assignees: [TEAM_MEMBERS[0], TEAM_MEMBERS[1], TEAM_MEMBERS[2]],
    progress: 25,
  },
  {
    id: 't2',
    title: 'Onboarding Flow',
    description: 'Simplify first-time user journey and reduce unnecessary setup steps.',
    priority: 'Low Priority',
    dueDate: 'Sep 26',
    commentsCount: 7,
    attachmentsCount: 3,
    assignees: [TEAM_MEMBERS[3], TEAM_MEMBERS[0], TEAM_MEMBERS[2]],
    progress: 0,
  },
  {
    id: 't3',
    title: 'Mobile Responsive',
    description: 'Fix layout issues on iPhone SE and smaller android screens.',
    priority: 'High',
    dueDate: 'Sep 20',
    commentsCount: 4,
    attachmentsCount: 1,
    assignees: [TEAM_MEMBERS[1]],
    progress: 75,
  },
  {
    id: 't4',
    title: 'Dark Mode Support',
    description: 'Implement color tokens for system-wide dark mode toggle.',
    priority: 'Medium',
    dueDate: 'Oct 01',
    commentsCount: 12,
    attachmentsCount: 5,
    assignees: [TEAM_MEMBERS[0], TEAM_MEMBERS[3]],
    progress: 10,
  },
  {
    id: 't5',
    title: 'API Integration',
    description: 'Connect frontend to the new REST API endpoints.',
    priority: 'Urgent',
    dueDate: 'Sep 12',
    commentsCount: 2,
    attachmentsCount: 0,
    assignees: [TEAM_MEMBERS[2]],
    progress: 90,
  },
  {
    id: 't6',
    title: 'User Profile Page',
    description: 'Create the settings and profile management view.',
    priority: 'Low Priority',
    dueDate: 'Oct 15',
    commentsCount: 1,
    attachmentsCount: 4,
    assignees: [TEAM_MEMBERS[1], TEAM_MEMBERS[2], TEAM_MEMBERS[3]],
    progress: 100,
  }
];

export const getTaskStatus = (id: string): TabStatus => {
    switch(id) {
        case 't1': return TabStatus.ToDo;
        case 't2': return TabStatus.ToDo;
        case 't3': return TabStatus.InProgress;
        case 't4': return TabStatus.UnderReview;
        case 't5': return TabStatus.InProgress;
        case 't6': return TabStatus.Completed;
        default: return TabStatus.ToDo;
    }
}

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Michie',
    text: 'Morning Team 👋',
    time: '07:00',
    isMe: false
  },
  {
    id: 'm2',
    sender: 'Michie',
    text: 'Today we will have a scrum meeting at 10 am.',
    time: '07:01',
    isMe: false
  },
  {
    id: 'm3',
    sender: 'Brenda',
    text: 'Okay Michie 👍',
    time: '07:03',
    isMe: true
  }
];

export const CALENDAR_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);