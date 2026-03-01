import VehicleMultiSelect from '@/components/VehicleMultiSelect';
import { useDesignFilesStore } from '@/entities/designFiles';
import { designFilesService } from '@/entities/designFiles/api';
import { useDesignWorkspaceModalStore } from '@/entities/designWorkspaceModal/model';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { isDesigner } from '@/lib/utils/userRole';
import { showToast } from '@/lib/utils/toast';
import FilterIconFirst from '@/shared/icons/FilterIconFirst';
import Spinner from '@/shared/ui/Spinner';
import { useSliderStore } from '@/store/sliderStore';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';


interface DesignFilesTabProps {
  workspaceId?: number;
  refreshTrigger?: number;
}

export default function DesignFilesTab({ workspaceId, refreshTrigger = 0 }: DesignFilesTabProps) {
  const [isCreateFileModalOpen, setIsCreateFileModalOpen] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      fileName: '',
    },
  });

  const { createDesignFile } = useDesignFilesStore();

  const handleCreateFile = async (data: any) => {
    if (isCreating) {
      return;
    }

    if (!chosenProduct?.id) {
      showToast.error('Please select a product first to create design files.');
      return;
    }

    setIsCreating(true);

    try {
      // Directly call POST API with product ID
      const response = await designFilesService.createDesignFileByProduct(chosenProduct.id, {
        name: data.fileName,
        vehicleIds: selectedVehicleIds.length > 0 ? selectedVehicleIds : undefined,
      });

        if (response.success) {
          if (workspaceId) {
            fetchDesignFiles(workspaceId, selectedVehicleId || undefined);
          } else if (chosenProduct?.id) {
            fetchDesignFilesByProduct(chosenProduct.id, selectedVehicleId || undefined);
          }
          setIsCreateFileModalOpen(false);
          reset();
        setSelectedVehicleIds([]);
      }
    } catch (error: any) {
      showToast.error('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseModal = () => {
    if (isCreating) return;
    setIsCreateFileModalOpen(false);
    reset();
    setSelectedVehicleIds([]);
    setIsCreating(false);
  };

  const { openModal: openDesignWorkspaceModal, closeModal } = useDesignWorkspaceModalStore();
  const { hideAllTabs } = useSliderStore();
  const { files, isLoading, fetchDesignFiles, fetchDesignFilesByProduct, clearFiles } = useDesignFilesStore();
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const canCreateDesignFiles = isDesigner();

  useEffect(() => {
    if (workspaceId) {
      fetchDesignFiles(workspaceId, selectedVehicleId || undefined);
    } else if (chosenProduct?.id) {
      // Auto-fetch design files for the selected product
      fetchDesignFilesByProduct(chosenProduct.id, selectedVehicleId || undefined);
    } else {
      clearFiles();
    }
  }, [workspaceId, chosenProduct?.id, selectedVehicleId, fetchDesignFiles, fetchDesignFilesByProduct, clearFiles, refreshTrigger]);

  const handleDesignFileClick = () => {
    closeModal();
    hideAllTabs();
  };

  return (
    <div className="w-full h-full pr-8 overflow-y-auto custom-scrollbar">
      <div className='grid grid-cols-2 gap-4'>
        <input
          placeholder="Search here"
          className="rounded-lg px-4 py-2 text-base text-[#535354] bg-white outline-none transition-all duration-300 ease-in-out border border-transparent focus:ring-2 focus:ring-transparent w-full"
          style={{
            background:
              'linear-gradient(#fff, #fff) padding-box, linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%) border-box',
            border: '1px solid transparent',
            borderRadius: '0.5rem',
          }}
        />
        <div className='flex justify-between'>
          <button className="p-2 w-10 text-[#343330] justify-self-start">
            <FilterIconFirst />
          </button>
          {canCreateDesignFiles && (
            <button
              className="h-[34px] rounded-xl text-[#535354] text-sm font-semibold cursor-pointer"
              style={{
                boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                width: '150px',
                marginLeft: 'auto',
              }}
              onClick={() => setIsCreateFileModalOpen(true)}
            >
              Create New File
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="col-span-2 flex items-center justify-center py-8">
            <div className="text-gray-500">Loading design files...</div>
          </div>
        ) : files.length === 0 ? (
          <div className="col-span-2 flex items-center justify-center py-8">
            <div className="text-gray-500">No design files found</div>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex-grow basis-[260px] max-w-[270px] flex flex-col relative h-fit"
            >
              <div
                className="w-full h-40 rounded-xl mb-2 relative cursor-pointer"
                style={{
                  background: `
                    repeating-conic-gradient(
                    #eee 0% 25%,
                    #ddd 0% 50%
                  )
                  `,
                  backgroundSize: '24px 24px',
                }}
                onClick={handleDesignFileClick}
              >
                {file.ready && (
                  <p className="absolute bottom-2 right-10 text-black font-normal text-xs">
                    Ready for handoff
                  </p>
                )}
                <div
                  className={`absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center rounded-full border-2 ${file.ready
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-400'
                    }`}
                  title={
                    file.ready ? 'AI generated design guidelines available' : ''
                  }
                >
                  {file.ready && (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="#22C55E" />
                      <path
                        d="M6 10.5L9 13.5L14 8.5"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <div>
                  <div className="text-black font-semibold text-base">
                    {file.name}
                  </div>
                  <div className="text-black font-normal text-sm">
                    {file.subtitle || 'Design file'}
                  </div>
                </div>
                <div className="text-xs font-normal text-black">
                  <p>Last Update {formatDistanceToNow(new Date(file.updatedAt), { addSuffix: true })}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create New File Modal */}
      <AnimatePresence>
        {isCreateFileModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-2xl relative"
              style={{
                width: '500px',
                minHeight: '250px',
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                className="absolute cursor-pointer"
                style={{ top: '20px', right: '20px' }}
                onClick={handleCloseModal}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M11.8337 1.3415L10.6587 0.166504L6.00033 4.82484L1.34199 0.166504L0.166992 1.3415L4.82533 5.99984L0.166992 10.6582L1.34199 11.8332L6.00033 7.17484L10.6587 11.8332L11.8337 10.6582L7.17533 5.99984L11.8337 1.3415Z" fill="black" />
                </svg>
              </button>

              <h2
                className="mb-3"
                style={{
                  color: '#000',
                  fontFamily: 'Poppins',
                  fontSize: '16px',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '140%'
                }}
              >
                Create new file
              </h2>

              <form onSubmit={handleSubmit(handleCreateFile)} className="space-y-2">
                <div>
                  <input
                    {...register('fileName', { required: 'File name is required' })}
                    name="fileName"
                    className="w-full max-w-48 px-0 py-1 border-0 border-b bg-transparent text-gray-900 focus:outline-none focus:border-b-2 focus:border-gray-600"
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#535354',
                      opacity: 0.5,
                      fontSize: '16px',
                      fontFamily: 'Poppins',
                    }}
                    placeholder=""
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
                    File name
                  </label>
                  {errors.fileName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fileName.message}</p>
                  )}
                </div>

                <div>
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

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={`transition-colors ${isCreating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    style={{
                      borderRadius: '12px',
                      background: '#EAEDF2',
                      boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                      color: 'var(--Text-Dark-Grey, #535354)',
                      fontFamily: 'Poppins',
                      fontSize: '13.284px',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      lineHeight: '19.927px',
                      display: 'flex',
                      width: '110px',
                      height: '38px',
                      padding: '6px 6px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '5px',
                      flexShrink: 0
                    }}
                  >
                    {isCreating ? (
                      <>
                        <Spinner size="md" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
