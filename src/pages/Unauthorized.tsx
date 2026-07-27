import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col justify-center items-center px-4 font-sans text-center">
      <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 mb-6 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-3">
        403 Access Forbidden
      </span>

      <h1 className="text-2xl font-light text-white tracking-tight mb-2">Unauthorized Portal Access</h1>

      <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-8">
        Your account (<strong className="text-slate-200">{userProfile?.email}</strong>) has the <strong className="text-indigo-400 uppercase">{userProfile?.role}</strong> role, which does not have permission to view this administrative resource.
      </p>

      <Link
        to={userProfile?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold px-5 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Authorized Workspace</span>
      </Link>
    </div>
  );
};
