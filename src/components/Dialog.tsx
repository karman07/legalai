import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: DialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'confirm':
        return <AlertCircle className="w-12 h-12 text-amber-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'from-green-50 to-emerald-50';
      case 'error':
        return 'from-red-50 to-rose-50';
      case 'confirm':
        return 'from-amber-50 to-orange-50';
      default:
        return 'from-blue-50 to-indigo-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`bg-gradient-to-r ${getColors()} p-4 sm:p-6 flex flex-col items-center`}>
          {getIcon()}
          {title && <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-3 sm:mt-4">{title}</h3>}
        </div>
        
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-slate-700 text-center mb-4 sm:mb-6">{message}</p>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {type === 'confirm' && onConfirm ? (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 rounded-lg font-semibold transition-all touch-manipulation text-sm sm:text-base"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 text-white rounded-lg font-semibold transition-all touch-manipulation text-sm sm:text-base"
                >
                  {confirmText}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:from-amber-700 active:to-orange-700 text-white rounded-lg font-semibold transition-all touch-manipulation text-sm sm:text-base"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
