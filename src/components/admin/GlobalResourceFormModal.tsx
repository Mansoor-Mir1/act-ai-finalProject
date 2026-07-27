import React, { useState, useEffect } from 'react';
import { GlobalResource } from '../../types';
import { X, BookOpen, Save, Link as LinkIcon } from 'lucide-react';

interface GlobalResourceFormModalProps {
  isOpen: boolean;
  resource: GlobalResource | null;
  onSave: (data: Omit<GlobalResource, 'id' | 'createdAt'>) => Promise<void>;
  onClose: () => void;
}

const TOPIC_PRESETS = [
  'Python Fundamentals',
  'Data Structures & Algorithms',
  'Web Development & APIs',
  'Data Science & Machine Learning',
  'Object-Oriented Programming',
  'Standard Library & Tools',
];

export const GlobalResourceFormModal: React.FC<GlobalResourceFormModalProps> = ({
  isOpen,
  resource,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('Python Fundamentals');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (resource) {
      setTitle(resource.title || '');
      setDescription(resource.description || '');
      setTopic(resource.topic || 'Python Fundamentals');
      setUrl(resource.url || '');
    } else {
      setTitle('');
      setDescription('');
      setTopic('Python Fundamentals');
      setUrl('');
    }
    setErrors({});
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Resource title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!topic.trim()) newErrors.topic = 'Language or Topic is required';
    
    if (!url.trim()) {
      newErrors.url = 'Resource URL is required';
    } else {
      try {
        const parsed = new URL(url.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          newErrors.url = 'URL must start with http:// or https://';
        }
      } catch (_) {
        newErrors.url = 'Enter a valid URL (e.g., https://docs.python.org/3/)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        topic: topic.trim(),
        url: url.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Error saving global resource:', err);
      setErrors({ submit: 'Failed to save resource. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                {resource ? 'Edit Learning Resource' : 'Add Learning Resource Link'}
              </h2>
              <p className="text-xs text-slate-400">
                Resource will be published in the global learning resources collection
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

        {/* Submit level error */}
        {errors.submit && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono">
            {errors.submit}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official Python Tutorial"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
            {errors.title && <p className="text-rose-400 text-[10px] font-mono">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what students will learn from this resource..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
            />
            {errors.description && <p className="text-rose-400 text-[10px] font-mono">{errors.description}</p>}
          </div>

          {/* Language / Topic */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              Language / Topic <span className="text-rose-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Python Fundamentals"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
              />
              <select
                value={TOPIC_PRESETS.includes(topic) ? topic : ''}
                onChange={(e) => e.target.value && setTopic(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-2 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="">Presets...</option>
                {TOPIC_PRESETS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {errors.topic && <p className="text-rose-400 text-[10px] font-mono">{errors.topic}</p>}
          </div>

          {/* URL */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              Resource Web URL <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.python.org/3/tutorial/"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
            {errors.url && <p className="text-rose-400 text-[10px] font-mono">{errors.url}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold flex items-center space-x-2 shadow-lg disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : resource ? 'Update Resource' : 'Save Resource Link'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
