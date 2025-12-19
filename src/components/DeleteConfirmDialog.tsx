import { AlertCircle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm, isDeleting }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 sm:p-6 flex flex-col items-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-3 sm:mt-4">Delete Note</h3>
        </div>
        
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-slate-700 text-center mb-4 sm:mb-6">
            Are you sure you want to delete this note? This action cannot be undone.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 rounded-lg font-semibold transition-all disabled:opacity-50 touch-manipulation text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 touch-manipulation text-sm sm:text-base"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
