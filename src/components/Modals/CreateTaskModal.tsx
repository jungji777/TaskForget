import React, { useState } from 'react';
import { X, Calendar, User, Flag, Clock, Tag } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { CreateTaskForm, TaskPriority } from '../../types';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-orange-600' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { createTask, isLoading } = useTaskStore();
  const { currentProject, projects } = useWorkspaceStore();
  const [formData, setFormData] = useState<CreateTaskForm>({
    title: '',
    description: '',
    projectId: projectId || currentProject?.id || '',
    priority: 'medium',
    tags: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  React.useEffect(() => {
    if (projectId) {
      setFormData(prev => ({ ...prev, projectId }));
    } else if (currentProject) {
      setFormData(prev => ({ ...prev, projectId: currentProject.id }));
    }
  }, [projectId, currentProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Please select a project';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createTask(formData);
      onClose();
      setFormData({
        title: '',
        description: '',
        projectId: projectId || currentProject?.id || '',
        priority: 'medium',
        tags: [],
      });
      setErrors({});
      setTagInput('');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleInputChange = (field: keyof CreateTaskForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        handleInputChange('tags', [...formData.tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const selectedProject = projects.find(p => p.id === formData.projectId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={clsx(
                'input-field',
                errors.title && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter task title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="input-field resize-none"
              placeholder="Describe the task (optional)"
            />
          </div>

          {/* Project Selection */}
          <div>
            <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              id="projectId"
              value={formData.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className={clsx(
                'input-field',
                errors.projectId && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Flag className="w-4 h-4 inline mr-1" />
              Priority
            </label>
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('priority', option.value)}
                  className={clsx(
                    'p-3 rounded-lg border text-left transition-colors',
                    formData.priority === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className={clsx('font-medium', option.color)}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assignee
            </label>
            <select
              id="assigneeId"
              value={formData.assigneeId || ''}
              onChange={(e) => handleInputChange('assigneeId', e.target.value || undefined)}
              className="input-field"
            >
              <option value="">Unassigned</option>
              <option value="1">Demo User (You)</option>
              {/* In a real app, this would be populated with workspace members */}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleInputChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                className="input-field"
                min={formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Estimated Hours
            </label>
            <input
              type="number"
              id="estimatedHours"
              min="0"
              step="0.5"
              value={formData.estimatedHours || ''}
              onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="input-field"
              placeholder="0"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="input-field"
              placeholder="Type a tag and press Enter"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Project Info */}
          {selectedProject && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Project</p>
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <div>
                  <p className="font-medium text-gray-900">{selectedProject.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedProject.description || 'No description'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="loading-spinner w-4 h-4 mr-2" />
                  Creating...
                </div>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};