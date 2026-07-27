import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lesson, GlobalResource } from '../types';
import {
  getStudentStats,
  getLessonsFromFirestore,
  createLessonInFirestore,
  updateLessonInFirestore,
  deleteLessonFromFirestore,
  getGlobalResources,
  createGlobalResource,
  updateGlobalResource,
  deleteGlobalResource,
} from '../lib/firestoreService';
import { LessonFormModal } from '../components/admin/LessonFormModal';
import { ResourceManageModal } from '../components/admin/ResourceManageModal';
import { GlobalResourceFormModal } from '../components/admin/GlobalResourceFormModal';
import { DeleteConfirmModal } from '../components/admin/DeleteConfirmModal';
import {
  Shield,
  Users,
  BookOpen,
  CheckCircle2,
  EyeOff,
  Plus,
  Search,
  Edit2,
  Trash2,
  Link as LinkIcon,
  LogOut,
  RefreshCw,
  Lock,
  Globe,
  ExternalLink,
  UserCheck,
  AlertTriangle,
  X,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();

  // Summary Stats & Data State
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [globalResources, setGlobalResources] = useState<GlobalResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Search & Filter States
  const [lessonSearchQuery, setLessonSearchQuery] = useState('');
  const [lessonStatusFilter, setLessonStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [resourceTopicFilter, setResourceTopicFilter] = useState<string>('all');

  // Modal Control States
  const [lessonFormOpen, setLessonFormOpen] = useState(false);
  const [selectedLessonForEdit, setSelectedLessonForEdit] = useState<Lesson | null>(null);

  const [lessonResourceModalOpen, setLessonResourceModalOpen] = useState(false);
  const [selectedLessonForResources, setSelectedLessonForResources] = useState<Lesson | null>(null);

  // Global Resource Form Modal State
  const [globalResourceModalOpen, setGlobalResourceModalOpen] = useState(false);
  const [selectedGlobalResourceForEdit, setSelectedGlobalResourceForEdit] = useState<GlobalResource | null>(null);

  // Delete Confirm States
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);
  const [deletingGlobalResource, setDeletingGlobalResource] = useState<GlobalResource | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all dashboard data from Firestore
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [stats, lessonList, resourceList] = await Promise.all([
        getStudentStats(),
        getLessonsFromFirestore(false), // Fetch all (published & drafts) for admin
        getGlobalResources(),
      ]);
      setTotalStudents(stats.totalStudents);
      setLessons(lessonList);
      setGlobalResources(resourceList);
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      showToast('Failed to load dashboard data from Firestore', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Summary calculations
  const totalLessons = lessons.length;
  const publishedLessons = lessons.filter((l) => l.published !== false).length;
  const totalResourcesCount = globalResources.length;

  // Filtered lessons
  const filteredLessons = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
      l.moduleTitle.toLowerCase().includes(lessonSearchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(lessonSearchQuery.toLowerCase());

    const isPub = l.published !== false;
    if (lessonStatusFilter === 'published' && !isPub) return false;
    if (lessonStatusFilter === 'unpublished' && isPub) return false;

    return matchesSearch;
  });

  // Filtered global resources
  const availableTopics = Array.from(new Set(globalResources.map((r) => r.topic)));
  const filteredGlobalResources = globalResources.filter((res) => {
    const matchesSearch =
      res.title.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
      res.topic.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
      res.url.toLowerCase().includes(resourceSearchQuery.toLowerCase());

    if (resourceTopicFilter !== 'all' && res.topic !== resourceTopicFilter) {
      return false;
    }

    return matchesSearch;
  });

  // Toggle Publish Status Handler
  const handleTogglePublish = async (lesson: Lesson) => {
    const updatedPublished = lesson.published === false ? true : false;
    try {
      await updateLessonInFirestore(lesson.id, { published: updatedPublished });
      setLessons((prev) =>
        prev.map((l) => (l.id === lesson.id ? { ...l, published: updatedPublished } : l))
      );
      showToast(
        `Lesson "${lesson.title}" ${updatedPublished ? 'published' : 'saved as draft'}.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      showToast('Failed to update lesson status', 'error');
    }
  };

  // Lesson Handlers
  const handleOpenEditLesson = (lesson: Lesson) => {
    setSelectedLessonForEdit(lesson);
    setLessonFormOpen(true);
  };

  const handleOpenCreateLesson = () => {
    setSelectedLessonForEdit(null);
    setLessonFormOpen(true);
  };

  const handleSaveLesson = async (lessonData: Partial<Lesson>) => {
    try {
      if (selectedLessonForEdit) {
        await updateLessonInFirestore(selectedLessonForEdit.id, lessonData);
        showToast(`Lesson "${lessonData.title || selectedLessonForEdit.title}" updated successfully.`);
      } else {
        await createLessonInFirestore(lessonData as Omit<Lesson, 'id'>);
        showToast(`Lesson "${lessonData.title}" created successfully.`);
      }
      await loadDashboardData();
    } catch (err) {
      console.error('Error saving lesson:', err);
      showToast('Failed to save lesson. Please try again.', 'error');
      throw err;
    }
  };

  const handleDeleteLessonConfirm = async () => {
    if (!deletingLesson) return;
    setIsDeleting(true);
    try {
      await deleteLessonFromFirestore(deletingLesson.id);
      showToast(`Lesson "${deletingLesson.title}" deleted successfully.`);
      await loadDashboardData();
      setDeletingLesson(null);
    } catch (err) {
      console.error('Error deleting lesson:', err);
      showToast('Failed to delete lesson.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Global Resource Handlers
  const handleOpenCreateGlobalResource = () => {
    setSelectedGlobalResourceForEdit(null);
    setGlobalResourceModalOpen(true);
  };

  const handleOpenEditGlobalResource = (res: GlobalResource) => {
    setSelectedGlobalResourceForEdit(res);
    setGlobalResourceModalOpen(true);
  };

  const handleSaveGlobalResource = async (data: Omit<GlobalResource, 'id' | 'createdAt'>) => {
    try {
      if (selectedGlobalResourceForEdit) {
        await updateGlobalResource(selectedGlobalResourceForEdit.id, data);
        showToast(`Resource "${data.title}" updated successfully.`);
      } else {
        await createGlobalResource(data);
        showToast(`Resource "${data.title}" added successfully.`);
      }
      await loadDashboardData();
    } catch (err) {
      console.error('Error saving resource:', err);
      showToast('Failed to save resource.', 'error');
      throw err;
    }
  };

  const handleDeleteGlobalResourceConfirm = async () => {
    if (!deletingGlobalResource) return;
    setIsDeleting(true);
    try {
      await deleteGlobalResource(deletingGlobalResource.id);
      showToast(`Resource "${deletingGlobalResource.title}" deleted successfully.`);
      await loadDashboardData();
      setDeletingGlobalResource(null);
    } catch (err) {
      console.error('Error deleting global resource:', err);
      showToast('Failed to delete resource.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-2xl font-mono text-xs flex items-center space-x-3 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Header */}
      <header className="h-16 border-b border-amber-500/20 bg-slate-900/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center font-bold text-slate-950 text-base shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-white font-mono uppercase">
              Admin Dashboard
            </h1>
            <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase">
              Permanent System Administrator
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadDashboardData}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-900 rounded-full border border-amber-500/30 text-xs font-mono">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-slate-300">{userProfile?.email || 'ms1234@gmail.com'}</span>
            <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
              Permanent Admin
            </span>
          </div>

          <button
            onClick={logout}
            className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center space-x-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8 flex-1">
        
        {/* TOP SECTION: Admin Information Card + System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Admin Information Card */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Identity</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Fixed System Role</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg font-mono shadow-inner">
                    {userProfile?.displayName?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {userProfile?.displayName || 'MS'}
                    </h2>
                    <p className="text-xs font-mono text-slate-400">
                      {userProfile?.email || 'ms1234@gmail.com'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Name:</span>
                    <span className="text-slate-200 font-bold">MS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200 font-bold">{userProfile?.email || 'ms1234@gmail.com'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Permanent Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-4 italic border-t border-slate-800/80 pt-3">
              Single permanent administrator. No admin creation or promotion permitted.
            </p>
          </div>

          {/* System Overview */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                    System Overview
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Live Database Metrics</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Registered Students */}
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-mono uppercase">Total Students</span>
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-white">{totalStudents}</p>
                  <p className="text-[9px] text-slate-500 font-mono">Registered learners</p>
                </div>

                {/* Total Lessons */}
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-mono uppercase">Total Lessons</span>
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-amber-400">{totalLessons}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{publishedLessons} published</p>
                </div>

                {/* Total Resources */}
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-mono uppercase">Total Resources</span>
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-mono font-bold text-emerald-400">{totalResourcesCount}</p>
                  <p className="text-[9px] text-slate-500 font-mono">Learning web links</p>
                </div>

                {/* Database Status */}
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-mono uppercase">Database Status</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <p className="text-sm font-mono font-bold text-teal-400 mt-1">Firestore Active</p>
                  <p className="text-[9px] text-slate-500 font-mono">Cloud synchronized</p>
                </div>
              </div>
            </div>

            {/* Enforced Admin Privacy & Restrictions Notice */}
            <div className="bg-slate-950/90 border border-rose-500/20 rounded-xl p-3.5 space-y-2 mt-2">
              <div className="flex items-center space-x-2 text-rose-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Admin Privacy Restrictions</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400">
                <div className="flex items-center space-x-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No AI Chat Access</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No Progress Editing</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No Private Notes</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span>No Account Mutation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESOURCE MANAGEMENT SECTION */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
                  Resource Management ({filteredGlobalResources.length})
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Add, edit, delete, search, and filter programming learning resources for students
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-wrap">
              {/* Search Resources */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={resourceSearchQuery}
                  onChange={(e) => setResourceSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 w-40 sm:w-56 font-sans"
                />
              </div>

              {/* Filter Resources by Topic */}
              {availableTopics.length > 0 && (
                <select
                  value={resourceTopicFilter}
                  onChange={(e) => setResourceTopicFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="all">All Topics ({globalResources.length})</option>
                  {availableTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              )}

              {/* Add Resource Button */}
              <button
                onClick={handleOpenCreateGlobalResource}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs py-2 px-3.5 rounded-xl shadow-lg transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>
          </div>

          {/* Resources Grid / List */}
          {loading ? (
            <div className="py-12 text-center font-mono text-xs text-slate-500">
              Loading resources from Firestore...
            </div>
          ) : filteredGlobalResources.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <Globe className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300">No resources found</p>
              <p className="text-xs text-slate-500">Click "Add Resource" to create learning resources for students.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGlobalResources.map((res) => (
                <div
                  key={res.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all shadow-md group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-100 text-xs line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {res.title}
                      </h3>
                      <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        {res.topic}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {res.description}
                    </p>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center space-x-1 truncate pt-1"
                    >
                      <span className="truncate">{res.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                    <span>
                      Created: {res.createdAt ? new Date(res.createdAt).toLocaleDateString() : 'Active'}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEditGlobalResource(res)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingGlobalResource(res)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CURRICULUM MANAGEMENT SECTION */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
                  Curriculum Management ({filteredLessons.length})
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Add, edit, delete, search, filter, and publish/unpublish curriculum lessons
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-wrap">
              {/* Search Lessons */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={lessonSearchQuery}
                  onChange={(e) => setLessonSearchQuery(e.target.value)}
                  placeholder="Search lessons..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 w-44 sm:w-60 font-sans"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setLessonStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    lessonStatusFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLessonStatusFilter('published')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    lessonStatusFilter === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => setLessonStatusFilter('unpublished')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    lessonStatusFilter === 'unpublished'
                      ? 'bg-slate-800 text-slate-200 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Drafts
                </button>
              </div>

              {/* Add New Lesson Button */}
              <button
                onClick={handleOpenCreateLesson}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs py-2 px-3.5 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Lesson</span>
              </button>
            </div>
          </div>

          {/* Lessons Table */}
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-slate-500">Loading curriculum lessons from Firestore...</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="py-12 text-center bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <h3 className="text-sm font-medium text-slate-300">No lessons found</h3>
              <p className="text-xs text-slate-500">Click "Add Lesson" to create custom Python curriculum lessons.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Order</th>
                    <th className="py-3 px-3">Lesson Title</th>
                    <th className="py-3 px-3">Module</th>
                    <th className="py-3 px-3">Difficulty</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredLessons.map((lesson) => {
                    const isPub = lesson.published !== false;

                    return (
                      <tr key={lesson.id} className="hover:bg-slate-900/80 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-400 font-bold">
                          #{lesson.order ?? 0}
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="font-bold text-white text-xs truncate">{lesson.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">{lesson.description}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                          {lesson.moduleTitle}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              lesson.difficulty === 'Beginner'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : lesson.difficulty === 'Intermediate'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {lesson.difficulty}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <button
                            onClick={() => handleTogglePublish(lesson)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase flex items-center space-x-1.5 border transition-all ${
                              isPub
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                            title={isPub ? 'Click to Unpublish (Set to Draft)' : 'Click to Publish'}
                          >
                            {isPub ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Published</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 text-slate-400" />
                                <span>Draft</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedLessonForResources(lesson);
                              setLessonResourceModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono text-[11px] inline-flex items-center space-x-1 transition-colors"
                            title="Manage Lesson Attached Links"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Links</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditLesson(lesson)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-mono text-xs inline-flex items-center transition-colors"
                            title="Edit Lesson"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingLesson(lesson)}
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 font-mono text-xs inline-flex items-center transition-colors"
                            title="Delete Lesson"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Lesson Form Modal */}
      <LessonFormModal
        isOpen={lessonFormOpen}
        lesson={selectedLessonForEdit}
        onSave={handleSaveLesson}
        onClose={() => setLessonFormOpen(false)}
      />

      {/* Lesson Attached Resource Links Modal */}
      <ResourceManageModal
        isOpen={lessonResourceModalOpen}
        lesson={selectedLessonForResources}
        onClose={() => setLessonResourceModalOpen(false)}
      />

      {/* Global Resource Form Modal */}
      <GlobalResourceFormModal
        isOpen={globalResourceModalOpen}
        resource={selectedGlobalResourceForEdit}
        onSave={handleSaveGlobalResource}
        onClose={() => setGlobalResourceModalOpen(false)}
      />

      {/* Delete Confirmation Modal for Lessons */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingLesson)}
        title="Delete Lesson"
        message="Are you sure you want to permanently delete this lesson from the curriculum database? This action cannot be undone."
        itemTitle={deletingLesson?.title}
        onConfirm={handleDeleteLessonConfirm}
        onCancel={() => setDeletingLesson(null)}
        isDeleting={isDeleting}
      />

      {/* Delete Confirmation Modal for Global Resources */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingGlobalResource)}
        title="Delete Learning Resource"
        message="Are you sure you want to permanently delete this learning resource link?"
        itemTitle={deletingGlobalResource?.title}
        onConfirm={handleDeleteGlobalResourceConfirm}
        onCancel={() => setDeletingGlobalResource(null)}
        isDeleting={isDeleting}
      />
    </div>
  );
};
