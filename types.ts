export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  email?: string;
  status?: 'Online' | 'Offline' | 'Busy';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'Urgent' | 'Low Priority' | 'Medium' | 'High';
  dueDate: string;
  commentsCount: number;
  attachmentsCount: number;
  assignees: User[];
  progress?: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}

export enum TabStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  UnderReview = 'Under Review',
  Completed = 'Completed'
}