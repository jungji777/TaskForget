// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  lastActive: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'kanban' | 'list' | 'calendar';
  workMode: WorkModeType;
  notifications: NotificationSettings;
  timezone: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  workModeAlerts: boolean;
  collaborationUpdates: boolean;
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  ownerId: string;
  members: WorkspaceMember[];
  projects: Project[];
  createdAt: Date;
  updatedAt: Date;
  settings: WorkspaceSettings;
}

export interface WorkspaceMember {
  userId: string;
  user: User;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
  permissions: Permission[];
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowGuestAccess: boolean;
  defaultTaskView: ViewType;
  workModes: WorkModeType[];
  integrations: Integration[];
}

export interface Permission {
  resource: 'workspace' | 'project' | 'task' | 'note';
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  ownerId: string;
  members: ProjectMember[];
  tasks: Task[];
  notes: Note[];
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  status: 'active' | 'completed' | 'archived';
  progress: number;
}

export interface ProjectMember {
  userId: string;
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  assignee?: User;
  creatorId: string;
  creator: User;
  status: TaskStatus;
  priority: TaskPriority;
  tags: Tag[];
  subtasks: Subtask[];
  dependencies: TaskDependency[];
  attachments: Attachment[];
  comments: Comment[];
  timeTracking: TimeEntry[];
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  position: number;
  estimatedHours?: number;
  actualHours?: number;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskDependency {
  id: string;
  dependentTaskId: string;
  dependsOnTaskId: string;
  type: 'blocks' | 'relates-to';
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt?: Date;
  mentions: string[];
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  userId: string;
  user: User;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
  workMode?: WorkModeType;
}

// Note Types
export interface Note {
  id: string;
  title: string;
  content: string;
  projectId?: string;
  authorId: string;
  author: User;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  collaborators: string[];
  version: number;
  history: NoteHistory[];
}

export interface NoteHistory {
  id: string;
  version: number;
  content: string;
  changedBy: string;
  changedAt: Date;
  changeType: 'create' | 'update' | 'delete';
}

// Tag Types
export interface Tag {
  id: string;
  name: string;
  color: string;
  projectId?: string;
  workspaceId: string;
  createdAt: Date;
}

// Work Mode Types
export type WorkModeType = 'pomodoro' | 'deep-work' | 'sprint' | 'focus' | 'break';

export interface WorkMode {
  id: string;
  type: WorkModeType;
  name: string;
  description: string;
  duration: number; // in minutes
  breakDuration?: number; // in minutes
  settings: WorkModeSettings;
  isActive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  userId: string;
}

export interface WorkModeSettings {
  autoStartBreaks: boolean;
  notifications: boolean;
  blockDistractions: boolean;
  playFocusMusic: boolean;
  trackTime: boolean;
  customDuration?: number;
}

// View Types
export type ViewType = 'kanban' | 'list' | 'calendar' | 'timeline' | 'dashboard';

export interface ViewSettings {
  type: ViewType;
  filters: FilterSettings;
  sorting: SortSettings;
  grouping?: GroupSettings;
}

export interface FilterSettings {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  tags?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
}

export interface SortSettings {
  field: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface GroupSettings {
  field: 'status' | 'priority' | 'assignee' | 'project';
}

// Analytics Types
export interface Analytics {
  productivity: ProductivityMetrics;
  workModes: WorkModeMetrics;
  tasks: TaskMetrics;
  collaboration: CollaborationMetrics;
  timeRange: {
    from: Date;
    to: Date;
  };
}

export interface ProductivityMetrics {
  tasksCompleted: number;
  averageCompletionTime: number;
  focusTime: number;
  breakTime: number;
  productivityScore: number;
  trends: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
}

export interface WorkModeMetrics {
  totalSessions: number;
  averageSessionLength: number;
  mostUsedMode: WorkModeType;
  modeDistribution: Record<WorkModeType, number>;
  completionRate: number;
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageTaskDuration: number;
  priorityDistribution: Record<TaskPriority, number>;
  statusDistribution: Record<TaskStatus, number>;
}

export interface CollaborationMetrics {
  commentsAdded: number;
  tasksAssigned: number;
  tasksReceived: number;
  collaborationScore: number;
  activeCollaborators: number;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  type: 'calendar' | 'email' | 'storage' | 'communication' | 'development';
  isEnabled: boolean;
  settings: Record<string, any>;
  lastSync?: Date;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'task' | 'workmode' | 'collaboration' | 'system';
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface CreateWorkspaceForm {
  name: string;
  description?: string;
  color: string;
  icon: string;
  isPublic: boolean;
}

export interface CreateProjectForm {
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  dueDate?: Date;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  priority: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  tags: string[];
  estimatedHours?: number;
}

export interface CreateNoteForm {
  title: string;
  content: string;
  projectId?: string;
  tags: string[];
  isPublic: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Theme Types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}