import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MessageCircle,
  Paperclip,
  User,
  Flag,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { Task, TaskPriority } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { clsx } from 'clsx';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

const priorityConfig: Record<TaskPriority, { color: string; icon: string }> = {
  low: { color: 'text-gray-500', icon: '⬇️' },
  medium: { color: 'text-yellow-500', icon: '➡️' },
  high: { color: 'text-orange-500', icon: '⬆️' },
  urgent: { color: 'text-red-500', icon: '🔥' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { updateTask, startTimeTracking, stopTimeTracking } = useTaskStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isTimeTracking = task.timeTracking.some(entry => !entry.endTime);
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleToggleSubtask = async (subtaskId: string) => {
    setIsUpdating(true);
    try {
      const updatedSubtasks = task.subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed, completedAt: !subtask.completed ? new Date() : undefined }
          : subtask
      );
      await updateTask(task.id, { subtasks: updatedSubtasks });
    } catch (error) {
      console.error('Failed to update subtask:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeTracking = async () => {
    try {
      if (isTimeTracking) {
        await stopTimeTracking(task.id);
      } else {
        await startTimeTracking(task.id);
      }
    } catch (error) {
      console.error('Failed to toggle time tracking:', error);
    }
  };

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  const getDueDateColor = (date: Date) => {
    if (isPast(date) && !isToday(date)) return 'text-red-600 bg-red-50';
    if (isToday(date)) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Flag className={clsx('w-4 h-4', priorityConfig[task.priority].color)} />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {task.priority}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50">
                Edit
              </button>
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50">
                Duplicate
              </button>
              <button className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${tag.color}20`,
                color: tag.color,
              }}
            >
              {tag.name}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Subtasks</span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          {/* Subtask List */}
          <div className="mt-2 space-y-1">
            {task.subtasks.slice(0, 2).map((subtask) => (
              <button
                key={subtask.id}
                onClick={() => handleToggleSubtask(subtask.id)}
                disabled={isUpdating}
                className="flex items-center w-full text-left text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                {subtask.completed ? (
                  <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                ) : (
                  <Circle className="w-3 h-3 mr-2" />
                )}
                <span className={clsx(subtask.completed && 'line-through')}>
                  {subtask.title}
                </span>
              </button>
            ))}
            {task.subtasks.length > 2 && (
              <div className="text-xs text-gray-400 pl-5">
                +{task.subtasks.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Due Date */}
          {task.dueDate && (
            <div className={clsx(
              'flex items-center px-2 py-1 rounded-full',
              getDueDateColor(task.dueDate)
            )}>
              <Calendar className="w-3 h-3 mr-1" />
              {formatDueDate(task.dueDate)}
            </div>
          )}

          {/* Time Estimate */}
          {task.estimatedHours && (
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {task.estimatedHours}h
            </div>
          )}

          {/* Comments */}
          {task.comments.length > 0 && (
            <div className="flex items-center">
              <MessageCircle className="w-3 h-3 mr-1" />
              {task.comments.length}
            </div>
          )}

          {/* Attachments */}
          {task.attachments.length > 0 && (
            <div className="flex items-center">
              <Paperclip className="w-3 h-3 mr-1" />
              {task.attachments.length}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Tracking */}
          <button
            onClick={handleTimeTracking}
            className={clsx(
              'p-1 rounded transition-colors',
              isTimeTracking
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-400 hover:bg-gray-100'
            )}
            title={isTimeTracking ? 'Stop tracking' : 'Start tracking'}
          >
            {isTimeTracking ? (
              <Pause className="w-3 h-3" />
            ) : (
              <Play className="w-3 h-3" />
            )}
          </button>

          {/* Assignee */}
          {task.assignee ? (
            <div className="flex items-center">
              {task.assignee.avatar ? (
                <img
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Time Tracking Indicator */}
      {isTimeTracking && (
        <div className="mt-2 flex items-center justify-center">
          <div className="flex items-center px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
            Time tracking active
          </div>
        </div>
      )}
    </div>
  );
};