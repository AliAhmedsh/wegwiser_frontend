import { useState, useRef } from 'react';
import { useCreationVehicleStore } from '@/features/createVehicle/store';
import { useUploadVehicleFilesMutation } from '@/lib/api/hooks/useVehicle';

export default function FileForm() {
  const { vehicleId, addStep3File, step3Files, removeStep3File } = useCreationVehicleStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFilesMutation = useUploadVehicleFilesMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log('FileForm - Files selected:', files);
    console.log('FileForm - Files count:', files.length);
    if (files.length > 0) {
      files.forEach(file => {
        console.log('FileForm - Adding file to store:', file.name, file.size);
        addStep3File(file);
      });
      
      // if (vehicleId) {
      //   setIsUploading(true);
      //   uploadFilesMutation.mutateAsync({
      //     vehicleId,
      //     files: files
      //   }).finally(() => {
      //     setIsUploading(false);
      //     if (fileInputRef.current) {
      //       fileInputRef.current.value = '';
      //     }
      //   });
      // }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[25%] rounded-4xl">
      <input 
        type="file" 
        className="opacity-0 fixed" 
        id="business-files" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
      />
      <label htmlFor="business-files" className="cursor-pointer">
        <div className="w-[65px] h-[65px] flex items-center justify-center mx-auto rounded-full bg-[#D9D9D9]">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="28" viewBox="0 0 11 28" fill="none">
            <path d="M5.49996 28C6.95803 27.9985 8.35628 27.3461 9.38749 26.186C10.4185 25.0262 10.9985 23.4532 11 21.8127V4.50387C11 4.16903 10.8411 3.85937 10.5832 3.69196C10.3254 3.52454 10.0077 3.52454 9.74998 3.69196C9.49217 3.85938 9.33323 4.16902 9.33323 4.50387V21.8034C9.33323 23.3441 8.60268 24.7675 7.41659 25.538C6.2305 26.3083 4.76918 26.3083 3.58315 25.538C2.39706 24.7675 1.66651 23.3441 1.66651 21.8034V4.31966C1.69429 3.42612 2.13409 2.61321 2.82718 2.17519C3.52002 1.73713 4.3658 1.73713 5.05892 2.17519C5.75176 2.61324 6.19158 3.42612 6.21936 4.31966V21.8189C6.21936 22.2659 5.89738 22.6284 5.5 22.6284C5.10263 22.6284 4.78043 22.2659 4.78043 21.8189V4.51318C4.78043 4.1781 4.62169 3.86867 4.36389 3.70126C4.10587 3.53384 3.78821 3.53384 3.5304 3.70126C3.27259 3.86868 3.11386 4.17808 3.11386 4.51318V21.8034C3.11386 22.7624 3.56852 23.6484 4.30684 24.1279C5.04517 24.6074 5.95469 24.6074 6.69296 24.1279C7.43129 23.6484 7.88616 22.7624 7.88616 21.8034V4.31966C7.84933 2.76294 7.08994 1.34169 5.88489 0.575116C4.68006 -0.191705 3.20605 -0.191705 2.00105 0.575116C0.796054 1.34169 0.0366103 2.76294 0 4.31966V21.8189C0.00279986 23.4582 0.58345 25.0295 1.61444 26.188C2.64543 27.3469 4.04257 27.9984 5.50004 27.9999L5.49996 28Z" fill="white"/>
          </svg>
        </div>

        <div className="text-center">
          <div className="mt-5 text-[14px]">
            Drag and upload supporting files if necessary
          </div>
          <div className="mt-1 text-gray-300">(Jpg, doc, ...)</div>
        </div>
      </label>

      {step3Files.length > 0 && (
        <div className="mt-4 w-full max-h-[200px] overflow-y-auto">
          <div className="text-[12px] font-semibold mb-2 text-gray-700">Selected Files:</div>
          <div className="space-y-2">
            {step3Files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded text-[11px]">
                <span className="text-gray-700 truncate flex-1">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeStep3File(index);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700 text-[12px] font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
