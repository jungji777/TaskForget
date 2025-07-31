import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, Filter, Search, MoreHorizontal } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { TaskCard } from './TaskCard';
import { CreateTaskModal } from '../Modals/CreateTaskModal';
import { Task, TaskStatus } from '../../types';
import { clsx } from 'clsx';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

interface KanbanBoardProps {
  projectId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const { tasks, fetchTasks, moveTask, filters, setFilters } = useTaskStore();
  const { currentProject } = useWorkspaceStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchTasks(projectId);
    }
  }, [projectId, fetchTasks]);

  // Filter tasks based on current filters and search
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Assignee filter
    if (filters.assignee && filters.assignee.length > 0 && task.assigneeId && !filters.assignee.includes(task.assigneeId)) {
      return false;
    }

    return true;
  });

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks
      .filter(task => task.status === column.id)
      .sort((a, b) => a.position - b.position);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;
    const newPosition = destination.index;

    try {
      await moveTask(draggableId, newStatus, newPosition);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };

  const getTaskCount = (status: TaskStatus) => {
    return tasksByStatus[status]?.length || 0;
  };

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : Boolean(filter)
  ) || searchQuery;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentProject?.name || 'Tasks'}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your tasks with drag-and-drop kanban board
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'btn-secondary',
              hasActiveFilters && 'bg-primary-50 border-primary-200 text-primary-700'
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {columns.map(column => (
                    <label key={column.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(column.id) || false}
                        onChange={(e) => {
                          const currentStatuses = filters.status || [];
                          if (e.target.checked) {
                            setFilters({ status: [...currentStatuses, column.id] });
                          } else {
                            setFilters({ status: currentStatuses.filter(s => s !== column.id) });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{column.title}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {['low', 'medium', 'high', 'urgent'].map(priority => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority?.includes(priority as any) || false}
                        onChange={(e) => {
                          const currentPriorities = filters.priority || [];
                          if (e.target.checked) {
                            setFilters({ priority: [...currentPriorities, priority as any] });
                          } else {
                            setFilters({ priority: currentPriorities.filter(p => p !== priority) });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilters({});
                    setSearchQuery('');
                  }}
                  className="btn-secondary w-full"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="h-full p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
              {columns.map((column) => (
                <div key={column.id} className="flex flex-col h-full">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={clsx('w-3 h-3 rounded-full', column.color)} />
                      <h3 className="font-medium text-gray-900">{column.title}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {getTaskCount(column.id)}
                      </span>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Column Content */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={clsx(
                          'flex-1 space-y-3 p-2 rounded-lg transition-colors',
                          snapshot.isDraggingOver && 'bg-primary-50 border-2 border-dashed border-primary-300'
                        )}
                      >
                        {tasksByStatus[column.id]?.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={clsx(
                                  snapshot.isDragging && 'transform rotate-2 shadow-lg'
                                )}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* Add Task Button */}
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors"
                        >
                          <Plus className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      </div>

      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        projectId={projectId}
      />
    </div>
  );
};