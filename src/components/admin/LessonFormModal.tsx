import React, { useState, useEffect } from 'react';
import { Lesson } from '../../types';
import { X, BookOpen, Code, FileText, CheckCircle, AlertCircle, Save } from 'lucide-react';

interface LessonFormModalProps {
  isOpen: boolean;
  lesson?: Lesson | null; // null for Create Mode, Lesson for Edit Mode
  onSave: (lessonData: Partial<Lesson>) => Promise<void>;
  onClose: () => void;
}

const PRESET_MODULES = [
  { id: 'mod-1', title: 'Module 1: Python Fundamentals' },
  { id: 'mod-2', title: 'Module 2: Control Flow & Logic' },
  { id: 'mod-3', title: 'Module 3: Functions & Modules' },
  { id: 'mod-4', title: 'Module 4: Data Structures' },
  { id: 'mod-5', title: 'Module 5: Object-Oriented Programming' },
];

export const LessonFormModal: React.FC<LessonFormModalProps> = ({
  isOpen,
  lesson,
  onSave,
  onClose,
}) => {
  const isEditMode = Boolean(lesson);

  const [title, setTitle] = useState('');
  const [moduleId, setModuleId] = useState('mod-1');
  const [moduleTitle, setModuleTitle] = useState('Module 1: Python Fundamentals');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [duration, setDuration] = useState('15 mins');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState<boolean>(true);
  const [description, setDescription] = useState('');
  const [theoryMarkdown, setTheoryMarkdown] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [exerciseTitle, setExerciseTitle] = useState('');
  const [exerciseInstructions, setExerciseInstructions] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setModuleId(lesson.moduleId || 'mod-1');
      setModuleTitle(lesson.moduleTitle || 'Module 1: Python Fundamentals');
      setDifficulty(lesson.difficulty || 'Beginner');
      setDuration(lesson.duration || '15 mins');
      setOrder(lesson.order ?? 1);
      setPublished(lesson.published !== undefined ? lesson.published : true);
      setDescription(lesson.description || '');
      setTheoryMarkdown(lesson.theoryMarkdown || '');
      setStarterCode(lesson.exercise?.initialCode || '# Write your Python code here\n');
      setExerciseTitle(lesson.exercise?.title || 'Lesson Challenge');
      setExerciseInstructions(lesson.exercise?.instructions || '');
      setExpectedOutput(lesson.exercise?.expectedOutput || '');
    } else {
      // Defaults for Create Mode
      setTitle('');
      setModuleId('mod-1');
      setModuleTitle('Module 1: Python Fundamentals');
      setDifficulty('Beginner');
      setDuration('15 mins');
      setOrder(1);
      setPublished(true);
      setDescription('');
      setTheoryMarkdown('');
      setStarterCode('def main():\n    print("Hello, Python!")\n\nif __name__ == "__main__":\n    main()');
      setExerciseTitle('Lesson Challenge');
      setExerciseInstructions('');
      setExpectedOutput('');
    }
    setErrors({});
  }, [lesson, isOpen]);

  if (!isOpen) return null;

  const handleModuleSelect = (modId: string) => {
    setModuleId(modId);
    const found = PRESET_MODULES.find((m) => m.id === modId);
    if (found) {
      setModuleTitle(found.title);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Lesson title is required';
    if (!description.trim()) newErrors.description = 'Short description is required';
    if (!theoryMarkdown.trim()) newErrors.theoryMarkdown = 'Markdown theory notes are required';
    if (!starterCode.trim()) newErrors.starterCode = 'Python starter code is required';
    if (!exerciseInstructions.trim()) newErrors.exerciseInstructions = 'Exercise instructions are required';
    if (isNaN(order) || order < 1) newErrors.order = 'Lesson order must be a positive number';

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
        moduleId,
        moduleTitle,
        difficulty,
        duration: duration.trim() || '15 mins',
        order: Number(order),
        published,
        description: description.trim(),
        theoryMarkdown: theoryMarkdown.trim(),
        exercise: {
          id: lesson?.exercise?.id || `ex-${Date.now()}`,
          title: exerciseTitle.trim() || `${title} Challenge`,
          instructions: exerciseInstructions.trim(),
          initialCode: starterCode,
          expectedOutput: expectedOutput.trim() || undefined,
          hints: lesson?.exercise?.hints || ['Review the markdown theory above.'],
        },
      });
      onClose();
    } catch (err) {
      console.error('Error saving lesson:', err);
      setErrors({ submit: 'Failed to save lesson to Firestore. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full my-8 p-6 shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-mono">
                {isEditMode ? 'EDIT_LESSON_CONTENT' : 'CREATE_NEW_LESSON'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode ? `Updating lesson: ${lesson?.id}` : 'Fill in the curriculum details below'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.submit && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-mono flex items-center space-x-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form id="lesson-form" onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-2 flex-1 text-xs">
          {/* Row 1: Title & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">
                Lesson Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Understanding Lists & Tuples"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
              />
              {errors.title && <p className="text-rose-400 text-[10px] font-mono mt-1">{errors.title}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">
                Order Position <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              {errors.order && <p className="text-rose-400 text-[10px] font-mono mt-1">{errors.order}</p>}
            </div>
          </div>

          {/* Row 2: Module & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">
                Module Category
              </label>
              <select
                value={moduleId}
                onChange={(e) => handleModuleSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
              >
                {PRESET_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-sans"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Row 3: Duration & Publish Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">
                Estimated Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 15 mins"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-end">
              <label className="block text-slate-400 font-mono text-[11px] uppercase mb-2">
                Publication Status
              </label>
              <label className="flex items-center space-x-3 cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-0 bg-slate-900 cursor-pointer"
                />
                <span className={`font-mono text-xs font-bold ${published ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {published ? 'Published (Visible to Students)' : 'Draft / Unpublished (Admin Only)'}
                </span>
              </label>
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[11px] uppercase">
              Short Description <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what students will learn in this lesson..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
            />
            {errors.description && <p className="text-rose-400 text-[10px] font-mono mt-1">{errors.description}</p>}
          </div>

          {/* Markdown Theory Notes */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[11px] uppercase flex items-center justify-between">
              <span>Markdown Theory Notes <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-slate-500">Supports headers, code blocks & list formatting</span>
            </label>
            <textarea
              rows={6}
              value={theoryMarkdown}
              onChange={(e) => setTheoryMarkdown(e.target.value)}
              placeholder="# Lesson Topic\n\nExplain core concept here...\n\n```python\n# Example code snippet\n```"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
            />
            {errors.theoryMarkdown && (
              <p className="text-rose-400 text-[10px] font-mono mt-1">{errors.theoryMarkdown}</p>
            )}
          </div>

          {/* Python Starter Code */}
          <div className="space-y-1">
            <label className="block text-slate-400 font-mono text-[11px] uppercase flex items-center justify-between">
              <span>Python Starter Code <span className="text-rose-400">*</span></span>
              <span className="text-[10px] text-indigo-400 font-mono">Loaded into IDE for exercise</span>
            </label>
            <textarea
              rows={4}
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              placeholder="# Python starter template for students\n"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-400 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            {errors.starterCode && <p className="text-rose-400 text-[10px] font-mono mt-1">{errors.starterCode}</p>}
          </div>

          {/* Exercise Instructions & Target Output */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">
                Exercise Challenge Goal <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={exerciseInstructions}
                onChange={(e) => setExerciseInstructions(e.target.value)}
                placeholder="e.g. Modify the code to calculate the sum of numbers from 1 to 10..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
              />
              {errors.exerciseInstructions && (
                <p className="text-rose-400 text-[10px] font-mono mt-1">{errors.exerciseInstructions}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-slate-400 font-mono text-[11px] uppercase">
                Expected Output (Optional)
              </label>
              <textarea
                rows={3}
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                placeholder="e.g. Sum: 55"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="lesson-form"
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center space-x-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Saving Lesson...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEditMode ? 'Update Lesson' : 'Create Lesson'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
