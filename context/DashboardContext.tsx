import React, { createContext, useContext } from 'react';
import { Doc, Id } from '../convex/_generated/dataModel';

// Define the shape of our shared data
export interface DashboardData {
  tasks: Doc<'tasks'>[] | undefined;
  projects: Doc<'projects'>[] | undefined;
  teamMembers: any[] | undefined; // Using any for now to match the enriched member object from queries
  users: Doc<'users'>[] | undefined;
  messages: any[] | undefined;
  notifications: Doc<'notifications'>[] | undefined;
  currentUser: Doc<'users'> | null | undefined;
  isLoading: boolean;
}

// Create the context
const DashboardContext = createContext<DashboardData | undefined>(undefined);

// Provider Component
export const DashboardProvider: React.FC<{ value: DashboardData; children: React.ReactNode }> = ({ value, children }) => {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook to consume the context
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
