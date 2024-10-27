import React,{useState} from 'react';

const FileUploadProgress: React.FC<{ progress: number; fileName?: string; error?: string }> = ({ progress, fileName, error }) => {
  const isComplete = progress === 100;
  const isError = error !== undefined;
    const [closePopUp,setClosePopUp]=useState<boolean>(true);
  if(progress===100){
    setTimeout(()=>{
        setClosePopUp(false);
    },1000)
  }
  return (
    <>
    {closePopUp && 
    <div className="w-full max-w-md p-4 border rounded-lg shadow-sm">
      {/* File name and status */}
      <div className="flex items-center mb-3">
        <svg 
          className={`w-5 h-5 mr-2 ${
            isComplete ? 'text-green-500' : 
            isError ? 'text-red-500' : 'text-blue-500'
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isComplete ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7"
            />
          ) : isError ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          )}
        </svg>
        <span className="text-sm font-medium truncate">
          {fileName || 'Uploading file...'}
        </span>
      </div>

      {/* Progress bar container */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Progress bar fill */}
        <div 
          className={`h-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 
            isError ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{Math.round(progress)}% complete</span>
        <span>{isComplete ? 'Done!' : 'Uploading...'}</span>
      </div>

      {/* Status messages */}
      {(isComplete || isError) && (
        <div className={`mt-3 p-3 rounded-md ${
          isComplete ? 'bg-green-50 text-green-700' : 
          'bg-red-50 text-red-700'
        }`}>
          {isComplete && (
            <div className="flex items-center">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p>Upload completed successfully!</p>
            </div>
          )}
          {isError && (
            <div className="flex items-center">
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p>{error || 'Upload failed. Please try again.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
}
    </>
  );
};

export default FileUploadProgress;