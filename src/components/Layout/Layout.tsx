import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useWorkModeTimer } from '../../store/workModeStore';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { fetchWorkspaces, currentWorkspace, setCurrentWorkspace, workspaces } = useWorkspaceStore();

  // Initialize work mode timer
  useWorkModeTimer();

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Set default workspace if none selected
  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [currentWorkspace, workspaces, setCurrentWorkspace]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'}
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
        `}
      >
        <Sidebar
          isCollapsed={!isSidebarOpen && !isMobile}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};