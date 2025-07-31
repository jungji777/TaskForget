import React, { useState } from 'react';
import { X, Calendar, Palette } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { CreateProjectForm } from '../../types';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const projectColors = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6b7280', // Gray
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createProject, isLoading, currentWorkspace } = useWorkspaceStore();
  const [formData, setFormData] = useState<CreateProjectForm>({
    name: '',
    description: '',
    color: projectColors[0],
    workspaceId: currentWorkspace?.id || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (currentWorkspace) {
      setFormData(prev => ({ ...prev, workspaceId: currentWorkspace.id }));
    }
  }, [currentWorkspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.workspaceId) {
      newErrors.workspaceId = 'Please select a workspace';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createProject(formData);
      onClose();
      setFormData({
        name: '',
        description: '',
        color: projectColors[0],
        workspaceId: currentWorkspace?.id || '',
      });
      setErrors({});
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleInputChange = (field: keyof CreateProjectForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={clsx(
                'input-field',
                errors.name && 'border-red-300 focus:border-red-500 focus:ring-red-500'
              )}
              placeholder="Enter project name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
              placeholder="Describe your project (optional)"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Color
            </label>
            <div className="grid grid-cols-10 gap-2">
              {projectColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleInputChange('color', color)}
                  className={clsx(
                    'w-8 h-8 rounded-lg transition-all',
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate ? format(formData.dueDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => handleInputChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
              className="input-field"
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Workspace Info */}
          {currentWorkspace && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Workspace</p>
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: currentWorkspace.color }}
                >
                  {currentWorkspace.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentWorkspace.name}</p>
                  <p className="text-sm text-gray-500">
                    {currentWorkspace.members?.length || 0} members
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {formData.name || 'Project Name'}
                </p>
                <p className="text-sm text-gray-500">
                  {formData.description || 'No description'}
                </p>
                {formData.dueDate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Due: {format(formData.dueDate, 'MMM dd, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>

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
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};