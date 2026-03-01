import { useDesignAssets } from '@/entities/designAssets';
import { designAssetsService } from '@/entities/designAssets/api/designAssetsService';
import { useDesignWorkspaceModalStore } from '@/entities/designWorkspaceModal/model';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { isDesigner } from '@/lib/utils/userRole';
import { showToast } from '@/lib/utils/toast';
import ArrowCircle from '@/shared/icons/ArrowCircle';
import { useSliderStore } from '@/store/sliderStore';
import { API_CONFIG } from '@/lib/config/api';
import { Open_Sans, Poppins } from 'next/font/google';
import { useEffect, useRef, useState } from 'react';
import AddAssetModal from './AddAssetModal';
import ModalWindow from '@/shared/portals/ModalWindow';
import { DesignAsset } from '@/entities/designAssets/api/designAssetsService';

// Component to preview text files in grid
const TextFilePreview: React.FC<{ fileUrl: string; fileName: string }> = ({ fileUrl, fileName }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Failed to load file');
        const text = await response.text();
        // Limit to first 300 characters for grid preview
        setContent(text.substring(0, 300) + (text.length > 300 ? '...' : ''));
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTextContent();
  }, [fileUrl]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <span className="text-gray-500 text-xs">Unable to preview</span>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full bg-white p-3 hide-scrollbar" 
      style={{ 
        overflow: 'hidden',
        height: '100%',
        position: 'relative'
      }}
    >
      <pre 
        className="text-xs text-gray-800 font-mono whitespace-pre-wrap break-words" 
        style={{ 
          overflow: 'hidden',
          maxHeight: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
          textOverflow: 'ellipsis'
        }}
      >
        {content || 'Empty file'}
      </pre>
    </div>
  );
};

// Component to view full asset in modal
const AssetViewer: React.FC<{
  asset: DesignAsset;
  onClose: () => void;
  getFullAssetUrl: (url: string) => string;
  getFileType: (asset: { name: string; mimeType?: string }) => 'image' | 'pdf' | 'word' | 'text' | 'other';
}> = ({ asset, onClose, getFullAssetUrl, getFileType }) => {
  const fileType = getFileType(asset);
  const fileUrl = getFullAssetUrl(asset.fileUrl);
  const [textContent, setTextContent] = useState<string>('');
  const [textLoading, setTextLoading] = useState(fileType === 'text');
  const [textError, setTextError] = useState(false);

  useEffect(() => {
    if (fileType === 'text') {
      const fetchTextContent = async () => {
        try {
          setTextLoading(true);
          setTextError(false);
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error('Failed to load file');
          const text = await response.text();
          setTextContent(text);
        } catch (err) {
          setTextError(true);
        } finally {
          setTextLoading(false);
        }
      };
      fetchTextContent();
    }
  }, [fileType, fileUrl]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-[90vw] max-w-[1200px] h-[85vh] bg-[#EAEDF2] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-[#E8E8E8]">
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-black truncate">
            {asset.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-xs">
              {asset.fileSize ? `${(asset.fileSize / 1024).toFixed(1)} KB` : 'Unknown size'}
            </span>
            {asset.createdAt && (
              <>
                <span>•</span>
                <span className="text-xs">
                  {new Date(asset.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#526889] transition-colors text-sm font-semibold"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white m-4 rounded-xl p-6">
        {fileType === 'image' && (asset.thumbnailUrl || asset.fileUrl) ? (
          <div className="flex items-center justify-center h-full">
            <img
              src={getFullAssetUrl(asset.thumbnailUrl || asset.fileUrl)}
              alt={asset.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
          </div>
        ) : fileType === 'pdf' && asset.fileUrl ? (
          <iframe
            src={`${fileUrl}#toolbar=1`}
            className="w-full h-full min-h-[600px] border-none rounded-lg"
            title={`PDF viewer: ${asset.name}`}
          />
        ) : fileType === 'word' && asset.fileUrl ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div
              className="w-full max-w-md h-96 flex flex-col items-center justify-center rounded-xl p-8 mb-4"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <svg
                className="w-24 h-24 mb-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-white text-lg font-semibold mb-2">Word Document</span>
              <span className="text-white/90 text-sm">{asset.name}</span>
            </div>
            <a
              href={fileUrl}
              download={asset.name}
              className="px-6 py-3 bg-[#627899] text-white rounded-lg hover:bg-[#526889] transition-colors text-sm font-semibold"
            >
              Download to View
            </a>
          </div>
        ) : fileType === 'text' && asset.fileUrl ? (
          <div className="h-full bg-gray-50 rounded-lg p-6 overflow-auto">
            {textLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              </div>
            ) : textError ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500">Unable to load file content</span>
              </div>
            ) : (
              <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap break-words bg-white p-4 rounded border border-gray-200">
                {textContent || 'Empty file'}
              </pre>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 mb-4">Preview not available for this file type</p>
              <a
                href={fileUrl}
                download={asset.name}
                className="inline-block px-6 py-2 bg-[#627899] text-white rounded-lg hover:bg-[#526889] transition-colors text-sm font-semibold"
              >
                Download File
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const OpenSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

interface DesignAssetsTabProps {
  workspaceId?: number;
  refreshTrigger?: number;
}

export default function DesignAssetsTab({ workspaceId: propWorkspaceId, refreshTrigger = 0 }: DesignAssetsTabProps) {
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const canCreateAssets = isDesigner();
  const [effectiveWorkspaceId, setEffectiveWorkspaceId] = useState<number | undefined>(propWorkspaceId);
  const [showVehiclesPopup, setShowVehiclesPopup] = useState<number | null>(null);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [selectedDateRanges, setSelectedDateRanges] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<DesignAsset | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const { closeModal } = useDesignWorkspaceModalStore();
  const { hideAllTabs } = useSliderStore();
  const popupRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Helper function to construct full URL for assets
  const getFullAssetUrl = (fileUrl: string) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http')) return fileUrl;
    
    // Construct the full URL: http://localhost:3001/uploads/filename
    const baseUrl = API_CONFIG.BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}/${fileUrl}`;
    
    return fullUrl;
  };

  // Helper function to get file extension
  const getFileExtension = (filename: string): string => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  // Helper function to determine file type
  const getFileType = (asset: { name: string; mimeType?: string }): 'image' | 'pdf' | 'word' | 'text' | 'other' => {
    const ext = getFileExtension(asset.name);
    const mimeType = asset.mimeType?.toLowerCase() || '';
    
    // Check by mimeType first
    if (mimeType.includes('image/')) return 'image';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('msword') || mimeType.includes('document')) return 'word';
    if (mimeType.includes('text/') || mimeType.includes('plain')) return 'text';
    
    // Check by extension
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'word';
    if (['txt', 'text'].includes(ext)) return 'text';
    
    return 'other';
  };



  useEffect(() => {

    setEffectiveWorkspaceId(propWorkspaceId);
  }, [propWorkspaceId]);


  const productIdForQuery = effectiveWorkspaceId ? undefined : chosenProduct?.id;

  const { assets, loading, uploadAsset, deleteAsset, refreshAssets } = useDesignAssets(
    effectiveWorkspaceId,
    productIdForQuery,
    { vehicleId: selectedVehicleId || undefined },
    refreshTrigger
  );
  

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showVehiclesPopup !== null) {
        const ref = popupRefs.current[showVehiclesPopup];
        if (ref && !ref.contains(event.target as Node)) {
          setShowVehiclesPopup(null);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVehiclesPopup]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilterPopup) {
        const target = event.target as Node;
        const isInsideFilterButton = filterButtonRef.current && filterButtonRef.current.contains(target);
        const filterPopup = document.querySelector('[data-filter-popup]');
        const isInsideFilterPopup = filterPopup && filterPopup.contains(target);

        if (!isInsideFilterButton && !isInsideFilterPopup) {
          setShowFilterPopup(false);
        }
      }
    };

    if (showFilterPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterPopup]);

  const handleDesignFileClick = (asset: DesignAsset) => {
    setSelectedAsset(asset);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedAsset(null);
  };

  const handleAddNewClick = () => {
    setIsAddAssetModalOpen(true);
  };

  const handleAssetSave = async (assetData: { files: File[]; associatedVehicleIds: number[] }) => {
    if (!chosenProduct?.id) {
      showToast.error('No product selected. Please select a product first.');
      return;
    }

    if (assetData.files.length === 0) {
      showToast.error('Please select at least one file to upload.');
      return;
    }

    try {
      let successCount = 0;
      let errorCount = 0;

      for (const file of assetData.files) {
        try {
          const vehicleIdToUse = selectedVehicleId || (assetData.associatedVehicleIds.length > 0 ? assetData.associatedVehicleIds[0] : undefined);
          
          if (!vehicleIdToUse) {
            showToast.error('Please select a vehicle first');
            continue;
          }
          
          const uploadResponse = await designAssetsService.uploadDesignAssetByProduct(chosenProduct.id, {
            name: file.name,
            file: file,
            vehicleId: vehicleIdToUse
          });

          if (uploadResponse.success && uploadResponse.asset) {
            successCount++;
            
            if (assetData.associatedVehicleIds.length > 0) {
              for (const vehicleId of assetData.associatedVehicleIds) {
                try {
                  await designAssetsService.associateAssetWithVehicle({
                    assetId: uploadResponse.asset.id,
                    vehicleId: vehicleId
                  });
                } catch (associationError) {
                  console.error('Error associating asset with vehicle:', associationError);
                }
              }
            }
          } else {
            errorCount++;
          }
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          errorCount++;
        }
      }

      if (successCount > 0 && errorCount === 0) {
        showToast.success(`Successfully uploaded ${successCount} asset(s)!`);
      } else if (successCount > 0 && errorCount > 0) {
        showToast.warning(`Uploaded ${successCount} asset(s) successfully, but ${errorCount} failed.`);
      } else {
        showToast.error('Failed to upload any assets. Please try again.');
        return;
      }

      await refreshAssets();
      
      try {
        const vehicleIdToUse = selectedVehicleId || (assetData.associatedVehicleIds.length > 0 ? assetData.associatedVehicleIds[0] : undefined);
        
        if (vehicleIdToUse) {
          await designAssetsService.getDesignAssetsByProduct(chosenProduct.id, {
            vehicleId: vehicleIdToUse
          });
        }
      } catch (error) {
        console.error('Error fetching product assets:', error);
      }
      
      if (successCount > 0) {
        setIsAddAssetModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      showToast.error('An error occurred while uploading assets. Please try again.');
    }
  };

  const handleFileTypeToggle = (fileType: string) => {
    setSelectedFileTypes((prev) =>
      prev.includes(fileType)
        ? prev.filter((d) => d !== fileType)
        : [...prev, fileType]
    );
  };

  const handleDateRangeToggle = (dateRange: string) => {
    setSelectedDateRanges((prev) =>
      prev.includes(dateRange)
        ? prev.filter((d) => d !== dateRange)
        : [...prev, dateRange]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((d) => d !== size)
        : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedFileTypes([]);
    setSelectedDateRanges([]);
    setSelectedSizes([]);
  };

  const applyFilters = () => {
    setShowFilterPopup(false);
  };

  return (
    <div className="w-full h-full pr-8 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Search here"
          className=" rounded-lg px-4 py-2 text-base text-[#535354] bg-[#E9ECF1] outline-none transition-all duration-300 ease-in-out border border-transparent focus:ring-2 focus:ring-transparent"
          style={{
            background:
              'linear-gradient(#E9ECF1, #E9ECF1) padding-box, linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%) border-box',
            border: '1px solid transparent',
            borderRadius: '0.5rem',
          }}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <button className="p-2 w-10 text-[#343330]">
              <ArrowCircle />
            </button>
            <button
              ref={filterButtonRef}
              onClick={() => setShowFilterPopup(!showFilterPopup)}
              className="text-gray-500 hover:text-gray-700 relative cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" strokeWidth={1} stroke="currentColor" className="w-5 h-5" viewBox="0 0 20 22" fill="none">
                <path d="M11.8119 20.9266L7.68965 18.1633C7.55736 18.0734 7.49121 17.9386 7.49121 17.7813V10.6151L1.09852 1.7415C0.988274 1.58422 0.966226 1.40446 1.05442 1.24717C1.14261 1.08988 1.29696 1 1.4513 1H18.558C18.7344 1 18.8887 1.08988 18.9549 1.24717C19.021 1.40445 19.021 1.58421 18.9108 1.71885L12.5176 10.6152V20.5447C12.5176 20.7245 12.4294 20.8593 12.2751 20.9492C12.2089 20.9941 12.1428 20.9941 12.0546 20.9941C11.9664 21.0164 11.8782 20.9715 11.8121 20.9267L11.8119 20.9266ZM2.3327 1.92055L8.30665 10.2105C8.37279 10.3003 8.39484 10.3902 8.39484 10.4801V17.5344L11.5912 19.6911V10.4804C11.5912 10.3905 11.6133 10.2782 11.6794 10.2108L17.6534 1.92087L2.3327 1.92055Z" fill="black" stroke="#D9D9D9" />
              </svg>

              {showFilterPopup && (
                <div
                  data-filter-popup
                  className="absolute top-8 right-0 bg-white p-4 z-60 flex flex-col overflow-hidden"
                  style={{
                    borderRadius: '12px',
                    background: '#FFF',
                    boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.15) inset',
                    width: '549px',
                    height: '283px',
                    flexShrink: 0
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3
                      className="font-semibold"
                      style={{
                        color: '#000',
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontStyle: 'normal',
                        fontWeight: 600,
                        lineHeight: '140%'
                      }}
                    >
                      Filter by
                    </h3>
                    <button
                      onClick={() => setShowFilterPopup(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="13" viewBox="0 0 12 13" fill="none">
                        <path d="M11.8332 1.84199L10.6582 0.666992L5.99984 5.32533L1.3415 0.666992L0.166504 1.84199L4.82484 6.50033L0.166504 11.1587L1.3415 12.3337L5.99984 7.67533L10.6582 12.3337L11.8332 11.1587L7.17484 6.50033L11.8332 1.84199Z" fill="black" />
                      </svg>
                    </button>
                  </div>

                  <button
                    onClick={clearAllFilters}
                    className="mb-6 hover:bg-gray-50"
                    style={{
                      display: 'flex',
                      width: '140px',
                      height: '34px',
                      padding: '12px 16px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '10px',
                      flexShrink: 0,
                      borderRadius: '12px',
                      border: '1px solid #627899',
                      color: 'var(--Text-Dark-Grey, #535354)',
                      fontFamily: 'Poppins',
                      fontSize: '13.284px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '19.927px'
                    }}
                  >
                    Clear all filters
                  </button>

                  <div className="flex-1 flex flex-col gap-4 w-full">
                    <div className="flex items-center w-full">
                      <label className="text-sm font-medium text-gray-700 w-20 text-left">File type:</label>
                      <div className="flex gap-0 flex-1">
                        {['Document', 'Image/Video', 'Other'].map((fileType, index) => (
                          <label key={fileType} className="flex items-center justify-start" style={{ width: index === 0 ? '130px' : index === 1 ? '150px' : '100px' }}>
                            <input
                              type="checkbox"
                              checked={selectedFileTypes.includes(fileType)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleFileTypeToggle(fileType);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mr-2 w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                              style={{
                                accentColor: 'rgb(98, 120, 153)'
                              }}
                            />
                            <span className="text-sm text-gray-700 text-left">{fileType}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center w-full">
                      <label className="text-sm font-medium text-gray-700 w-20 text-left">Date:</label>
                      <div className="flex gap-0 flex-1">
                        {['This week', 'This month', 'This year'].map((dateRange, index) => (
                          <label key={dateRange} className="flex items-center justify-start" style={{ width: index === 0 ? '130px' : index === 1 ? '150px' : '100px' }}>
                            <input
                              type="checkbox"
                              checked={selectedDateRanges.includes(dateRange)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleDateRangeToggle(dateRange);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mr-2 w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                              style={{
                                accentColor: 'rgb(98, 120, 153)'
                              }}
                            />
                            <span className="text-sm text-gray-700 text-left">{dateRange}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center w-full">
                      <label className="text-sm font-medium text-gray-700 w-20 text-left">Size:</label>
                      <div className="flex gap-0 flex-1">
                        {['<10 MB', '11 - 100 MB', '> 100 MB'].map((size, index) => (
                          <label key={size} className="flex items-center justify-start" style={{ width: index === 0 ? '130px' : index === 1 ? '150px' : '100px' }}>
                            <input
                              type="checkbox"
                              checked={selectedSizes.includes(size)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSizeToggle(size);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="mr-2 w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer flex-shrink-0"
                              style={{
                                accentColor: 'rgb(98, 120, 153)'
                              }}
                            />
                            <span className="text-sm text-gray-700 text-left">{size}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-auto">
                    <button
                      onClick={applyFilters}
                      className="shadow-[2px_2px_2px_rgba(167,177,196,0.6),_-2px_-2px_2px_rgba(255,255,255,1)] bg-[#EAEDF2] text-[#535354] text-sm font-semibold rounded-[12px] hover:bg-gray-300 transition duration-300"
                      style={{
                        display: 'flex',
                        width: '95px',
                        height: '34px',
                        padding: '12px 22px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        flexShrink: 0
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </button>
          </div>
          {canCreateAssets && (
            <button
              onClick={handleAddNewClick}
              className="flex justify-center items-center w-[102px] h-[34px] px-[12px] gap-[10px] flex-shrink-0 rounded-[12px] border border-[#627899] text-[#535354] text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Add New
            </button>
          )}
        </div>

   

        {(assets.length > 0 ? assets : []).map((asset) => {
          const fileType = getFileType(asset);
          const fileUrl = getFullAssetUrl(asset.fileUrl);
          
          return (
          <div
            key={asset.id}
            className="flex-grow basis-[260px] max-w-[260px] flex flex-col relative "
          >
            <div
              className="w-full h-40 rounded-xl mb-2 relative cursor-pointer overflow-hidden bg-white hide-scrollbar"
              onClick={() => handleDesignFileClick(asset)}
            >
              {/* Image files - show preview */}
              {fileType === 'image' && (asset.thumbnailUrl || asset.fileUrl) ? (
                <img
                  src={getFullAssetUrl(asset.thumbnailUrl || asset.fileUrl)}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : fileType === 'pdf' && asset.fileUrl ? (
                // PDF preview - first page (no scrollbar)
                <div 
                  className="w-full h-full overflow-hidden hide-scrollbar" 
                  style={{ 
                    position: 'relative'
                  }}
                >
                  <iframe
                    src={`${fileUrl}#page=1&zoom=fit&toolbar=0&navpanes=0`}
                    className="w-full h-full border-none pointer-events-none"
                    style={{ 
                      minHeight: '160px',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      border: 'none',
                      pointerEvents: 'none'
                    }}
                    title={`PDF preview: ${asset.name}`}
                    scrolling="no"
                    frameBorder="0"
                  />
                </div>
              ) : fileType === 'word' && asset.fileUrl ? (
                // Word document preview - show styled placeholder
                <div
                  className="w-full h-full flex flex-col items-center justify-center p-4"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <svg
                    className="w-16 h-16 mb-2 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-xs font-semibold">Word Document</span>
                </div>
              ) : fileType === 'text' && asset.fileUrl ? (
                // Text file preview (no scrollbar)
                <TextFilePreview fileUrl={fileUrl} fileName={asset.name} />
              ) : null}
              
              {/* Fallback placeholder when no preview or image fails */}
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `
                    repeating-conic-gradient(
                    #eee 0% 25%,
                    #ddd 0% 50%
                  )
                  `,
                  backgroundSize: '24px 24px',
                  display: (fileType === 'image' && (asset.thumbnailUrl || asset.fileUrl)) ? 'none' : 'flex'
                }}
              >
                <span className="text-gray-500 text-sm">No preview</span>
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                <div className={`text-black ${Poppins600.className}`}>
                  {asset.name}
                </div>
                <div className="text-black font-normal text-sm">
                  <button
                    className={`text-[#535354] underline text-sm font-normal hover:no-underline ${OpenSans400.className}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowVehiclesPopup(asset.id);
                    }}
                  >
                    {asset.associatedVehicleCount || 0} Associated Vehicle{asset.associatedVehicleCount !== 1 ? 's' : ''}
                  </button>
                  {showVehiclesPopup === asset.id && (
                    <div
                      ref={(el) => {
                        popupRefs.current[asset.id] = el;
                      }}
                      className="absolute z-10 mt-2 w-36 bg-white rounded-xl border-[1px] border-[#D9D9D9] py-2 overflow-hidden"
                    >
                      {asset.associatedVehicles && asset.associatedVehicles.length > 0 ? (
                        asset.associatedVehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            {vehicle.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">No associated vehicles</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      <AddAssetModal
        isOpen={isAddAssetModalOpen}
        onClose={() => setIsAddAssetModalOpen(false)}
        onSave={handleAssetSave}
      />

      {/* File/Image Viewer Modal */}
      <ModalWindow isOpen={isViewerOpen} onClose={handleCloseViewer}>
        {selectedAsset && (
          <AssetViewer asset={selectedAsset} onClose={handleCloseViewer} getFullAssetUrl={getFullAssetUrl} getFileType={getFileType} />
        )}
      </ModalWindow>
    </div>
  );
}

