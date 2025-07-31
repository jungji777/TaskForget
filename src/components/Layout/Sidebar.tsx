import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  Timer,
  Users,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useWorkModeStore } from '../../store/workModeStore';
import { clsx } from 'clsx';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { currentWorkspace, projects } = useWorkspaceStore();
  const { currentMode, isActive } = useWorkModeStore();
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    projects: true,
    workModes: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const mainNavItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      badge: null,
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      badge: null,
    },
    {
      name: 'Notes',
      href: '/notes',
      icon: FileText,
      badge: null,
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'Team',
      href: '/team',
      icon: Users,
      badge: null,
    },
  ];

  const workModeItems = [
    {
      name: 'Pomodoro',
      type: 'pomodoro' as const,
      duration: '25 min',
      color: 'bg-red-500',
    },
    {
      name: 'Deep Work',
      type: 'deep-work' as const,
      duration: '90 min',
      color: 'bg-purple-500',
    },
    {
      name: 'Sprint',
      type: 'sprint' as const,
      duration: '15 min',
      color: 'bg-blue-500',
    },
    {
      name: 'Focus',
      type: 'focus' as const,
      duration: '45 min',
      color: 'bg-green-500',
    },
  ];

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <nav className="flex-1 px-2 space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center justify-center w-12 h-12 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
                title={item.name}
              >
                <Icon className="w-5 h-5" />
              </NavLink>
            );
          })}
        </nav>

        {currentMode && isActive && (
          <div className="p-2">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary-100">
              <Timer className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentWorkspace?.name || 'Workspace'}
          </h2>
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronDown className="w-4 h-4 transform rotate-90" />
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={clsx(
                'sidebar-item',
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Projects Section */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('projects')}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {expandedSections.projects ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            <FolderOpen className="w-4 h-4 mr-2" />
            <span className="flex-1">Projects</span>
            <button className="p-1 rounded hover:bg-gray-100">
              <Plus className="w-3 h-3" />
            </button>
          </button>

          {expandedSections.projects && (
            <div className="ml-6 mt-1 space-y-1">
              {projects.map((project) => (
                <NavLink
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center px-3 py-2 text-sm rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 truncate">{project.name}</span>
                  <span className="text-xs text-gray-400">
                    {project.progress}%
                  </span>
                </NavLink>
              ))}
              
              {projects.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No projects yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Work Modes Section */}
        <div className="pt-4">
          <button
            onClick={() => toggleSection('workModes')}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            {expandedSections.workModes ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            <Timer className="w-4 h-4 mr-2" />
            <span className="flex-1">Work Modes</span>
            {currentMode && isActive && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </button>

          {expandedSections.workModes && (
            <div className="ml-6 mt-1 space-y-1">
              {workModeItems.map((mode) => (
                <button
                  key={mode.type}
                  onClick={() => {
                    // This would trigger the work mode start
                    console.log(`Starting ${mode.type} mode`);
                  }}
                  className={clsx(
                    'flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors',
                    currentMode?.type === mode.type && isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className={clsx('w-3 h-3 rounded-full mr-3', mode.color)} />
                  <span className="flex-1">{mode.name}</span>
                  <span className="text-xs text-gray-400">{mode.duration}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Current Work Mode Status */}
      {currentMode && isActive && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-primary-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-primary-900">
                {currentMode.name}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="text-xs text-primary-700">
              Active session in progress
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              'sidebar-item',
              isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
            )
          }
        >
          <Settings className="w-5 h-5 mr-3" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};