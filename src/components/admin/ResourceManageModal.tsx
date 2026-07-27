import React, { useState, useEffect } from 'react';
import { Lesson, LessonResource } from '../../types';
import {
  getLessonResources,
  addResourceToLesson,
  updateLessonResource,
  deleteLessonResource,
} from '../../lib/firestoreService';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import {
  X,
  BookOpen,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  Link,
  Save,
  Globe,
} from 'lucide-react';

interface ResourceManageModalProps {
  isOpen: boolean;
  lesson: Lesson | null;
  onClose: () => void;
}

const RESOURCE_TYPES: Array<LessonResource['type']> = [
  'Documentation',
  'Tutorial',
  'Video',
  'GitHub',
  'Other',
];

export const ResourceManageModal: React.FC<ResourceManageModalProps> = ({
  isOpen,
  lesson,
  onClose,
}) => {
  const [resources, setResources] = useState<LessonResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State for Add / Edit Resource
  const [editingResource, setEditingResource] = useState<LessonResource | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<LessonResource['type']>('Documentation');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal State
  const [deletingResource, setDeletingResource] = useState<LessonResource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch resources when lesson changes
  const loadResources = async () => {
    if (!lesson) return;
    setLoading(true);
    try {
      const resList = await getLessonResources(lesson.id);
      setResources(resList);
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && lesson) {
      loadResources();
      resetForm();
    }
  }, [isOpen, lesson]);

  if (!isOpen || !lesson) return null;

  const resetForm = () => {
    setEditingResource(null);
    setTitle('');
    setUrl('');
    setType('Documentation');
    setFormErrors({});
  };

  const startEdit = (res: LessonResource) => {
    setEditingResource(res);
    setTitle(res.title);
    setUrl(res.url);
    setType(res.type);
    setFormErrors({});
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) errors.title = 'Resource title is required';
    if (!url.trim()) {
      errors.url = 'Resource URL is required';
    } else if (!isValidUrl(url.trim())) {
      errors.url = 'Must be a valid Web URL starting with http:// or https://';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingResource) {
        // Edit existing resource
        await updateLessonResource(lesson.id, editingResource.id, {
          title: title.trim(),
          url: url.trim(),
          type,
        });
      } else {
        // Add new resource
        await addResourceToLesson(lesson.id, {
          title: title.trim(),
          url: url.trim(),
          type,
        });
      }

      await loadResources();
      resetForm();
    } catch (err) {
      console.error('Error saving resource:', err);
      setFormErrors({ submit: 'Failed to save resource link. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingResource) return;
    setIsDeleting(true);
    try {
      await deleteLessonResource(lesson.id, deletingResource.id);
      await loadResources();
      setDeletingResource(null);
    } catch (err) {
      console.error('Error deleting resource:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">MANAGE_LESSON_RESOURCES</h2>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Lesson: <strong className="text-slate-200">{lesson.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Resources List */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Attached Learning Resources ({resources.length})</span>
            {editingResource && (
              <button
                onClick={resetForm}
                className="text-[10px] text-indigo-400 hover:underline lowercase font-sans"
              >
                + Switch to Add New
              </button>
            )}
          </h3>

          {loading ? (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              Loading lesson resources from Firestore...
            </div>
          ) : resources.length === 0 ? (
            <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-center space-y-1">
              <Globe className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No external resources attached yet.</p>
              <p className="text-[10px] text-slate-500">Add external documentation, video tutorials, or GitHub links below.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 pr-3 space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">{res.title}</span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {res.type}
                      </span>
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center space-x-1 truncate"
                    >
                      <span className="truncate">{res.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => startEdit(res)}
                      className="p-1.5 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-800 transition-colors"
                      title="Edit Resource"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingResource(res)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="Delete Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add / Edit Resource Form */}
        <form onSubmit={handleSubmit} className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Link className="w-3.5 h-3.5" />
              <span>{editingResource ? 'EDIT RESOURCE LINK' : 'ADD NEW RESOURCE LINK'}</span>
            </span>
          </div>

          {formErrors.submit && (
            <p className="text-rose-400 text-xs font-mono">{formErrors.submit}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-slate-400 font-mono text-[10px] uppercase">
                Resource Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Official Python Tutorial"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-sans"
              />
              {formErrors.title && <p className="text-rose-400 text-[10px] font-mono">{formErrors.title}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-mono text-[10px] uppercase">
                Resource Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[10px] uppercase">
              Resource Web URL (http:// or https://) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://docs.python.org/3/..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
            />
            {formErrors.url && <p className="text-rose-400 text-[10px] font-mono">{formErrors.url}</p>}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            {editingResource && (
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold flex items-center space-x-1.5 shadow-md disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingResource ? 'Update Resource' : 'Add Resource Link'}</span>
            </button>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmModal
          isOpen={Boolean(deletingResource)}
          title="Delete Learning Resource"
          message="Are you sure you want to remove this resource link from the lesson?"
          itemTitle={deletingResource?.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingResource(null)}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};
