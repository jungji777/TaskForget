import React, { useState } from 'react';
import { ChevronDown, Plus, Settings, Users } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { CreateWorkspaceModal } from '../Modals/CreateWorkspaceModal';
import { clsx } from 'clsx';

export const WorkspaceSelector: React.FC = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleWorkspaceSelect = (workspace: any) => {
    setCurrentWorkspace(workspace);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <div className="flex items-center flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                style={{ backgroundColor: currentWorkspace?.color || '#3b82f6' }}
              >
                {currentWorkspace?.icon || '🏠'}
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentWorkspace?.name || 'Select Workspace'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentWorkspace?.members?.length || 0} members
              </p>
            </div>
          </div>
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-gray-400 transition-transform',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="py-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className={clsx(
                    'flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors',
                    currentWorkspace?.id === workspace.id && 'bg-primary-50'
                  )}
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                    style={{ backgroundColor: workspace.color }}
                  >
                    {workspace.icon}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {workspace.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {workspace.members?.length || 0} members
                    </p>
                  </div>
                  {currentWorkspace?.id === workspace.id && (
                    <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  )}
                </button>
              ))}
              
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-3 text-gray-400" />
                  Create workspace
                </button>
                
                {currentWorkspace && (
                  <>
                    <button className="flex items-center w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Users className="w-4 h-4 mr-3 text-gray-400" />
                      Manage members
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Workspace settings
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
};