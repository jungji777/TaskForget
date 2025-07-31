import { create } from 'zustand';
import { Workspace, Project, CreateWorkspaceForm, CreateProjectForm } from '../types';

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
}

interface WorkspaceActions {
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (data: CreateWorkspaceForm) => Promise<void>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  
  fetchProjects: (workspaceId: string) => Promise<void>;
  createProject: (data: CreateProjectForm) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  clearError: () => void;
}

type WorkspaceStore = WorkspaceState & WorkspaceActions;

// Mock data
const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Personal Workspace',
    description: 'My personal projects and tasks',
    color: '#3b82f6',
    icon: '🏠',
    ownerId: '1',
    members: [],
    projects: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    settings: {
      isPublic: false,
      allowGuestAccess: false,
      defaultTaskView: 'kanban',
      workModes: ['pomodoro', 'deep-work', 'focus'],
      integrations: [],
    },
  },
  {
    id: '2',
    name: 'Team Alpha',
    description: 'Collaborative workspace for Team Alpha',
    color: '#10b981',
    icon: '👥',
    ownerId: '1',
    members: [],
    projects: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    settings: {
      isPublic: false,
      allowGuestAccess: true,
      defaultTaskView: 'kanban',
      workModes: ['sprint', 'focus', 'break'],
      integrations: [],
    },
  },
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete redesign of the company website',
    color: '#8b5cf6',
    workspaceId: '1',
    ownerId: '1',
    members: [],
    tasks: [],
    notes: [],
    tags: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    dueDate: new Date('2024-03-01'),
    status: 'active',
    progress: 65,
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Native mobile app for iOS and Android',
    color: '#f59e0b',
    workspaceId: '1',
    ownerId: '1',
    members: [],
    tasks: [],
    notes: [],
    tags: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    dueDate: new Date('2024-06-01'),
    status: 'active',
    progress: 30,
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    description: 'Q1 marketing campaign planning and execution',
    color: '#ef4444',
    workspaceId: '2',
    ownerId: '1',
    members: [],
    tasks: [],
    notes: [],
    tags: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    dueDate: new Date('2024-04-01'),
    status: 'active',
    progress: 80,
  },
];

// Mock API functions
const mockFetchWorkspaces = async (): Promise<Workspace[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockWorkspaces;
};

const mockCreateWorkspace = async (data: CreateWorkspaceForm): Promise<Workspace> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newWorkspace: Workspace = {
    id: Math.random().toString(36).substr(2, 9),
    name: data.name,
    description: data.description,
    color: data.color,
    icon: data.icon,
    ownerId: '1', // Current user ID
    members: [],
    projects: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      isPublic: data.isPublic,
      allowGuestAccess: false,
      defaultTaskView: 'kanban',
      workModes: ['pomodoro', 'deep-work', 'focus'],
      integrations: [],
    },
  };
  
  mockWorkspaces.push(newWorkspace);
  return newWorkspace;
};

const mockFetchProjects = async (workspaceId: string): Promise<Project[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockProjects.filter(project => project.workspaceId === workspaceId);
};

const mockCreateProject = async (data: CreateProjectForm): Promise<Project> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newProject: Project = {
    id: Math.random().toString(36).substr(2, 9),
    name: data.name,
    description: data.description,
    color: data.color,
    workspaceId: data.workspaceId,
    ownerId: '1', // Current user ID
    members: [],
    tasks: [],
    notes: [],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: data.dueDate,
    status: 'active',
    progress: 0,
  };
  
  mockProjects.push(newProject);
  return newProject;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  // Initial state
  workspaces: [],
  currentWorkspace: null,
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Workspace actions
  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const workspaces = await mockFetchWorkspaces();
      set({ workspaces, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch workspaces',
        isLoading: false,
      });
    }
  },

  createWorkspace: async (data: CreateWorkspaceForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const newWorkspace = await mockCreateWorkspace(data);
      const { workspaces } = get();
      set({
        workspaces: [...workspaces, newWorkspace],
        currentWorkspace: newWorkspace,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create workspace',
        isLoading: false,
      });
      throw error;
    }
  },

  updateWorkspace: async (id: string, updates: Partial<Workspace>) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      const { workspaces, currentWorkspace } = get();
      const updatedWorkspaces = workspaces.map(workspace =>
        workspace.id === id ? { ...workspace, ...updates, updatedAt: new Date() } : workspace
      );
      
      const updatedCurrentWorkspace = currentWorkspace?.id === id
        ? { ...currentWorkspace, ...updates, updatedAt: new Date() }
        : currentWorkspace;
      
      set({
        workspaces: updatedWorkspaces,
        currentWorkspace: updatedCurrentWorkspace,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update workspace',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteWorkspace: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      const { workspaces, currentWorkspace } = get();
      const filteredWorkspaces = workspaces.filter(workspace => workspace.id !== id);
      const updatedCurrentWorkspace = currentWorkspace?.id === id ? null : currentWorkspace;
      
      set({
        workspaces: filteredWorkspaces,
        currentWorkspace: updatedCurrentWorkspace,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete workspace',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentWorkspace: (workspace: Workspace | null) => {
    set({ currentWorkspace: workspace });
  },

  // Project actions
  fetchProjects: async (workspaceId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const projects = await mockFetchProjects(workspaceId);
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  createProject: async (data: CreateProjectForm) => {
    set({ isLoading: true, error: null });
    
    try {
      const newProject = await mockCreateProject(data);
      const { projects } = get();
      set({
        projects: [...projects, newProject],
        currentProject: newProject,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (id: string, updates: Partial<Project>) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      const { projects, currentProject } = get();
      const updatedProjects = projects.map(project =>
        project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project
      );
      
      const updatedCurrentProject = currentProject?.id === id
        ? { ...currentProject, ...updates, updatedAt: new Date() }
        : currentProject;
      
      set({
        projects: updatedProjects,
        currentProject: updatedCurrentProject,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      const { projects, currentProject } = get();
      const filteredProjects = projects.filter(project => project.id !== id);
      const updatedCurrentProject = currentProject?.id === id ? null : currentProject;
      
      set({
        projects: filteredProjects,
        currentProject: updatedCurrentProject,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  clearError: () => {
    set({ error: null });
  },
}));