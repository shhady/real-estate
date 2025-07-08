import { useEffect } from 'react';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onStartAgain, 
  actionAtTop = false, 
  actionButton = null,
  closeButtonText = 'Close',
  startAgainButtonText = 'Start Again',
  isRtl = false
}) {
  // Close on escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    // Prevent scrolling on background when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Component to render main action button 
  const ActionButton = () => (
    <div className={`flex items-center ${isRtl ? 'space-x-reverse space-x-2' : 'space-x-2'} flex-wrap sm:flex-nowrap`}>
      {actionButton && (
        <button
          type="button"
          onClick={actionButton.onClick}
          className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
  
  // Utility buttons (Close and Start Again) now separated from main action buttons
  const UtilityButtons = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={onStartAgain}
        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 transition-colors whitespace-nowrap border border-gray-300"
      >
        {startAgainButtonText}
      </button>
      <button 
        onClick={onClose} 
        className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 rounded-full p-1 transition-colors"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden ${isRtl ? 'rtl' : ''}`}>
        {/* Header with title and utility buttons */}
        <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <UtilityButtons />
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
        
        {/* Footer with main action button - if needed */}
        {actionButton && !actionAtTop && (
          <div className={`px-4 sm:px-6 py-3 border-t border-gray-200 flex ${isRtl ? 'justify-start' : 'justify-end'}`}>
            <ActionButton />
          </div>
        )}
      </div>
    </div>
  );
} 