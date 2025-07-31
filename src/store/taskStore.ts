import { create } from 'zustand';
import { Task, CreateTaskForm, TaskStatus, TaskPriority, Comment, TimeEntry } from '../types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: TaskStatus[];
    priority?: TaskPriority[];
    assignee?: string[];
    search?: string;
  };
}

interface TaskActions {
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (data: CreateTaskForm) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => Promise<void>;
  setCurrentTask: (task: Task | null) => void;
  
  addComment: (taskId: string, content: string) => Promise<void>;
  updateComment: (taskId: string, commentId: string, content: string) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;
  
  startTimeTracking: (taskId: string) => Promise<void>;
  stopTimeTracking: (taskId: string) => Promise<void>;
  
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  clearFilters: () => void;
  clearError: () => void;
}

type TaskStore = TaskState & TaskActions;

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design homepage mockup',
    description: 'Create a modern, responsive design for the homepage with focus on user experience',
    projectId: '1',
    assigneeId: '1',
    assignee: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    creatorId: '1',
    creator: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    status: 'in-progress',
    priority: 'high',
    tags: [
      { id: '1', name: 'Design', color: '#8b5cf6', workspaceId: '1', createdAt: new Date() },
      { id: '2', name: 'Frontend', color: '#3b82f6', workspaceId: '1', createdAt: new Date() },
    ],
    subtasks: [
      { id: '1', title: 'Research competitor designs', completed: true, createdAt: new Date(), completedAt: new Date() },
      { id: '2', title: 'Create wireframes', completed: true, createdAt: new Date(), completedAt: new Date() },
      { id: '3', title: 'Design high-fidelity mockup', completed: false, createdAt: new Date() },
    ],
    dependencies: [],
    attachments: [],
    comments: [
      {
        id: '1',
        content: 'Looking great so far! Can we make the hero section more prominent?',
        authorId: '2',
        author: {
          id: '2',
          email: 'jane@example.com',
          name: 'Jane Smith',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
          role: 'user',
          createdAt: new Date(),
          lastActive: new Date(),
          preferences: {
            theme: 'light',
            defaultView: 'list',
            workMode: 'focus',
            notifications: {
              email: true,
              push: false,
              taskReminders: true,
              workModeAlerts: false,
              collaborationUpdates: true,
            },
            timezone: 'UTC',
          },
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        mentions: [],
        reactions: [
          { emoji: '👍', userId: '1', createdAt: new Date() },
        ],
      },
    ],
    timeTracking: [
      {
        id: '1',
        userId: '1',
        user: {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          role: 'admin',
          createdAt: new Date(),
          lastActive: new Date(),
          preferences: {
            theme: 'light',
            defaultView: 'kanban',
            workMode: 'pomodoro',
            notifications: {
              email: true,
              push: true,
              taskReminders: true,
              workModeAlerts: true,
              collaborationUpdates: true,
            },
            timezone: 'UTC',
          },
        },
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        duration: 120, // 2 hours
        description: 'Working on wireframes and initial design concepts',
        workMode: 'deep-work',
      },
    ],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(),
    position: 0,
    estimatedHours: 8,
    actualHours: 2,
  },
  {
    id: '2',
    title: 'Implement responsive navigation',
    description: 'Build a mobile-friendly navigation component with smooth animations',
    projectId: '1',
    assigneeId: '1',
    assignee: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    creatorId: '1',
    creator: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    status: 'todo',
    priority: 'medium',
    tags: [
      { id: '2', name: 'Frontend', color: '#3b82f6', workspaceId: '1', createdAt: new Date() },
      { id: '3', name: 'React', color: '#10b981', workspaceId: '1', createdAt: new Date() },
    ],
    subtasks: [
      { id: '4', title: 'Create navigation component', completed: false, createdAt: new Date() },
      { id: '5', title: 'Add mobile menu functionality', completed: false, createdAt: new Date() },
      { id: '6', title: 'Implement smooth animations', completed: false, createdAt: new Date() },
    ],
    dependencies: [
      { id: '1', dependentTaskId: '2', dependsOnTaskId: '1', type: 'blocks' },
    ],
    attachments: [],
    comments: [],
    timeTracking: [],
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(),
    position: 1,
    estimatedHours: 6,
    actualHours: 0,
  },
  {
    id: '3',
    title: 'Set up CI/CD pipeline',
    description: 'Configure automated testing and deployment pipeline',
    projectId: '1',
    creatorId: '1',
    creator: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    status: 'review',
    priority: 'low',
    tags: [
      { id: '4', name: 'DevOps', color: '#f59e0b', workspaceId: '1', createdAt: new Date() },
    ],
    subtasks: [],
    dependencies: [],
    attachments: [],
    comments: [],
    timeTracking: [],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(),
    position: 0,
    estimatedHours: 4,
    actualHours: 3,
  },
  {
    id: '4',
    title: 'Write project documentation',
    description: 'Create comprehensive documentation for the project setup and usage',
    projectId: '1',
    creatorId: '1',
    creator: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    status: 'done',
    priority: 'medium',
    tags: [
      { id: '5', name: 'Documentation', color: '#6b7280', workspaceId: '1', createdAt: new Date() },
    ],
    subtasks: [
      { id: '7', title: 'Write README', completed: true, createdAt: new Date(), completedAt: new Date() },
      { id: '8', title: 'Create API documentation', completed: true, createdAt: new Date(), completedAt: new Date() },
    ],
    dependencies: [],
    attachments: [],
    comments: [],
    timeTracking: [],
    completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    position: 0,
    estimatedHours: 3,
    actualHours: 2.5,
  },
];

// Mock API functions
const mockFetchTasks = async (projectId: string): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTasks.filter(task => task.projectId === projectId);
};

const mockCreateTask = async (data: CreateTaskForm): Promise<Task> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newTask: Task = {
    id: Math.random().toString(36).substr(2, 9),
    title: data.title,
    description: data.description,
    projectId: data.projectId,
    assigneeId: data.assigneeId,
    creatorId: '1', // Current user ID
    creator: {
      id: '1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
      role: 'admin',
      createdAt: new Date(),
      lastActive: new Date(),
      preferences: {
        theme: 'light',
        defaultView: 'kanban',
        workMode: 'pomodoro',
        notifications: {
          email: true,
          push: true,
          taskReminders: true,
          workModeAlerts: true,
          collaborationUpdates: true,
        },
        timezone: 'UTC',
      },
    },
    status: 'todo',
    priority: data.priority,
    tags: data.tags.map(tagName => ({
      id: Math.random().toString(36).substr(2, 9),
      name: tagName,
      color: '#3b82f6',
      workspaceId: '1',
      createdAt: new Date(),
    })),
    subtasks: [],
    dependencies: [],
    attachments: [],
    comments: [],
    timeTracking: [],
    dueDate: data.dueDate,
    startDate: data.startDate,
    createdAt: new Date(),
    updatedAt: new Date(),
    position: mockTasks.filter(t => t.projectId === data.projectId && t.status === 'todo').length,
    estimatedHours: data.estimatedHours,
    actualHours: 0,
  };
  
  mockTasks.push(newTask);
  return newTask;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  filters: {},

  // Task actions
  fetchTasks: async (projectId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const tasks = await mockFetchTasks(projectId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        isLoading: false,
      });
    }
  },

  createTask: async (data: CreateTaskForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const newTask = await mockCreateTask(data);
      const { tasks } = get();
      set({
        tasks: [...tasks, newTask],
        currentTask: newTask,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create task',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      const { tasks, currentTask } = get();
      const updatedTasks = tasks.map(task =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
      );
      
      const updatedCurrentTask = currentTask?.id === id
        ? { ...currentTask, ...updates, updatedAt: new Date() }
        : currentTask;
      
      set({
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update task',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      const { tasks, currentTask } = get();
      const filteredTasks = tasks.filter(task => task.id !== id);
      const updatedCurrentTask = currentTask?.id === id ? null : currentTask;
      
      // Remove from mock data
      const taskIndex = mockTasks.findIndex(task => task.id === id);
      if (taskIndex > -1) {
        mockTasks.splice(taskIndex, 1);
      }
      
      set({
        tasks: filteredTasks,
        currentTask: updatedCurrentTask,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete task',
        isLoading: false,
      });
      throw error;
    }
  },

  moveTask: async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 200)); // Mock API delay
      
      const { tasks } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId 
          ? { ...task, status: newStatus, position: newPosition, updatedAt: new Date() }
          : task
      );
      
      set({ tasks: updatedTasks });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to move task',
      });
      throw error;
    }
  },

  setCurrentTask: (task: Task | null) => {
    set({ currentTask: task });
  },

  // Comment actions
  addComment: async (taskId: string, content: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Mock API delay
      
      const newComment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        authorId: '1', // Current user ID
        author: {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          role: 'admin',
          createdAt: new Date(),
          lastActive: new Date(),
          preferences: {
            theme: 'light',
            defaultView: 'kanban',
            workMode: 'pomodoro',
            notifications: {
              email: true,
              push: true,
              taskReminders: true,
              workModeAlerts: true,
              collaborationUpdates: true,
            },
            timezone: 'UTC',
          },
        },
        createdAt: new Date(),
        mentions: [],
        reactions: [],
      };
      
      const { tasks, currentTask } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId 
          ? { ...task, comments: [...task.comments, newComment], updatedAt: new Date() }
          : task
      );
      
      const updatedCurrentTask = currentTask?.id === taskId
        ? { ...currentTask, comments: [...currentTask.comments, newComment], updatedAt: new Date() }
        : currentTask;
      
      set({
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add comment',
      });
      throw error;
    }
  },

  updateComment: async (taskId: string, commentId: string, content: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Mock API delay
      
      const { tasks, currentTask } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId 
          ? {
              ...task,
              comments: task.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, content, updatedAt: new Date() }
                  : comment
              ),
              updatedAt: new Date(),
            }
          : task
      );
      
      const updatedCurrentTask = currentTask?.id === taskId
        ? {
            ...currentTask,
            comments: currentTask.comments.map(comment =>
              comment.id === commentId
                ? { ...comment, content, updatedAt: new Date() }
                : comment
            ),
            updatedAt: new Date(),
          }
        : currentTask;
      
      set({
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update comment',
      });
      throw error;
    }
  },

  deleteComment: async (taskId: string, commentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Mock API delay
      
      const { tasks, currentTask } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId 
          ? {
              ...task,
              comments: task.comments.filter(comment => comment.id !== commentId),
              updatedAt: new Date(),
            }
          : task
      );
      
      const updatedCurrentTask = currentTask?.id === taskId
        ? {
            ...currentTask,
            comments: currentTask.comments.filter(comment => comment.id !== commentId),
            updatedAt: new Date(),
          }
        : currentTask;
      
      set({
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete comment',
      });
      throw error;
    }
  },

  // Time tracking actions
  startTimeTracking: async (taskId: string) => {
    try {
      const newTimeEntry: TimeEntry = {
        id: Math.random().toString(36).substr(2, 9),
        userId: '1', // Current user ID
        user: {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
          role: 'admin',
          createdAt: new Date(),
          lastActive: new Date(),
          preferences: {
            theme: 'light',
            defaultView: 'kanban',
            workMode: 'pomodoro',
            notifications: {
              email: true,
              push: true,
              taskReminders: true,
              workModeAlerts: true,
              collaborationUpdates: true,
            },
            timezone: 'UTC',
          },
        },
        startTime: new Date(),
        duration: 0,
        workMode: 'focus',
      };
      
      const { tasks, currentTask } = get();
      const updatedTasks = tasks.map(task =>
        task.id === taskId 
          ? { ...task, timeTracking: [...task.timeTracking, newTimeEntry], updatedAt: new Date() }
          : task
      );
      
      const updatedCurrentTask = currentTask?.id === taskId
        ? { ...currentTask, timeTracking: [...currentTask.timeTracking, newTimeEntry], updatedAt: new Date() }
        : currentTask;
      
      set({
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start time tracking',
      });
      throw error;
    }
  },

  stopTimeTracking: async (taskId: string) => {
    try {
      const { tasks, currentTask } = get();
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      const activeTimeEntry = task.timeTracking.find(entry => !entry.endTime);
      if (!activeTimeEntry) return;
      
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - activeTimeEntry.startTime.getTime()) / (1000 * 60)); // in minutes
      
      const updatedTasks = tasks.map(t =>
        t.id === taskId 
          ? {
              ...t,
              timeTracking: t.timeTracking.map(entry =>
                entry.id === activeTimeEntry.id
                  ? { ...entry, endTime, duration }
                  : entry
              ),
              actualHours: (t.actualHours || 0) + (duration / 60),
              updatedAt: new Date(),
            }
          : t
      );
      
      const updatedCurrentTask = currentTask?.id === taskId
        ? {
            ...currentTask,
            timeTracking: currentTask.timeTracking.map(entry =>
              entry.id === activeTimeEntry.id
                ? { ...entry, endTime, duration }
                : entry
            ),
            actualHours: (currentTask.actualHours || 0) + (duration / 60),
            updatedAt: new Date(),
          }
        : currentTask;
      
      set({
        tasks: updatedTasks,
        currentTask: updatedCurrentTask,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to stop time tracking',
      });
      throw error;
    }
  },

  // Filter actions
  setFilters: (filters: Partial<TaskState['filters']>) => {
    const { filters: currentFilters } = get();
    set({ filters: { ...currentFilters, ...filters } });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => {
    set({ error: null });
  },
}));