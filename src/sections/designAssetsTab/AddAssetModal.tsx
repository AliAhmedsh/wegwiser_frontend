import VehicleMultiSelect from '@/components/VehicleMultiSelect';
import { showToast } from '@/lib/utils/toast';
import Spinner from '@/shared/ui/Spinner';
import { XIcon } from 'lucide-react';
import { Poppins } from 'next/font/google';
import React, { useRef, useState } from 'react';

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (assetData: { files: File[]; associatedVehicleIds: number[] }) => Promise<void>;
}

export default function AddAssetModal({ isOpen, onClose, onSave }: AddAssetModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDone = async () => {
    if (isSaving) return; // Prevent multiple clicks
    
    
    // Validate that at least one file is selected
    if (selectedFiles.length === 0) {
      console.error('No files selected');
      showToast.error('Please select at least one file to upload.');
      return;
    }
    
    setIsSaving(true);
    
    try {
      if (onSave) {
        await onSave({
          files: selectedFiles,
          associatedVehicleIds: selectedVehicleIds
        });
      } else {
        console.error('No onSave function provided');
      }
    } catch (error) {
      console.error('Error in handleDone:', error);
    } finally {
      setIsSaving(false);
      setSelectedFiles([]);
      setSelectedVehicleIds([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="p-6 relative flex flex-col"
        style={{
          width: '549px',
          height: '390px',
          flexShrink: 0,
          borderRadius: '12px',
          background: '#FFF',
          boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.15) inset',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-lg font-semibold text-[#181818] ${Poppins600.className}`}>
            Add new asset
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XIcon className="w-5 h-5 text-black stroke-2" />
          </button>
        </div>


        <div className="flex flex-col">

          <div className="flex justify-center mb-4">
            <div
              className={`cursor-pointer transition-colors ${isDragOver
                ? 'bg-blue-50'
                : 'hover:bg-gray-50'
                }`}
              style={{
                display: 'flex',
                width: '385px',
                height: '171px',
                padding: '42px 78px',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
                flexShrink: 0,
                borderRadius: '12px',
                border: '1.449px solid #535354',
                background: '#FFF',
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
            >
              <div className="text-center">
                <div
                  className={`${Poppins600.className}`}
                  style={{
                    color: '#000',
                    textAlign: 'center',
                    fontFamily: 'Poppins',
                    fontSize: '16px',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    lineHeight: '140%',
                    marginBottom: '27px',
                  }}
                >
                  Drag or upload
                </div>
                <button
                  className="text-[#535354] text-sm font-medium hover:bg-[#D9DCE3] transition-colors"
                  style={{
                    width: '203px',
                    borderRadius: '12px',
                    background: '#EAEDF2',
                    boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                    padding: '8px 16px',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadClick();
                  }}
                >
                  Upload
                </button>
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-[#535354] mb-2">
                      Selected files ({selectedFiles.length}):
                    </div>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="text-sm text-[#535354] bg-gray-50 px-2 py-1 rounded mb-1">
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
          />



          <div className="mb-2">
            <VehicleMultiSelect
              selectedVehicleIds={selectedVehicleIds}
              onVehicleChange={setSelectedVehicleIds}
              placeholder="Select vehicles..."
            />
            <label
              className="block mt-2"
              style={{
                color: '#535354',
                fontFamily: 'Poppins',
                fontSize: '13px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '140%'
              }}
            >
              Associated vehicles
            </label>
          </div>
        </div>


        <div className="flex justify-end">
          <button
            onClick={handleDone}
            disabled={isSaving || selectedFiles.length === 0}
            className={`transition-colors ${
              isSaving || selectedFiles.length === 0 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#D9DCE3]'
            }`}
            style={{
              borderRadius: '12px',
              background: '#EAEDF2',
              boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
              display: 'flex',
              width: '90px',
              height: '34px',
              padding: '12px 20px',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
              color: '#535354',
              fontFamily: 'Poppins',
              fontSize: '13.284px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '19.927px',
            }}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" color="#535354" />
                <span>Saving...</span>
              </div>
            ) : (
              'Done'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
