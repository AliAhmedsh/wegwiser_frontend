'use client';

import { useProductStore } from '@/entities/product';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { Open_Sans, Poppins } from 'next/font/google';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Spinner from '@/shared/ui/Spinner';
import { useCreateTicketMutation } from '../api/hooks';
import { useEngineeringFilesQuery } from '../api/hooks/useEngineeringFiles';
import { CreateTicketRequest } from '../api/ticketsService';
import { notesService } from '@/entities/note/api/notesService';
import { formatRole } from '@/lib/utils/formatRole';

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const openSans = Open_Sans({
  weight: ['400'],
  subsets: ['latin'],
});

interface AddTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
}

interface TicketFormData {
  file: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'qa_failed' | 'pending_feedback';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  ticketType: 'bug' | 'feature' | 'task' | 'improvement';
  assignedTo?: string;
}

export default function AddTicketModal({ isOpen, onClose, productId }: AddTicketModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const fileDropdownRef = useRef<HTMLDivElement>(null);
  const { selectedVehicleId } = useSelectedVehicleStore();
  const { chosenProduct } = useProductStore();
  const [vehicleMembers, setVehicleMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const { data: filesResponse, isLoading: filesLoading, error: filesError } = useEngineeringFilesQuery(productId, !!productId);
  const createTicketMutation = useCreateTicketMutation();

  // Fetch vehicle members when modal opens and vehicleId is available
  useEffect(() => {
    const fetchVehicleMembers = async () => {
      if (!selectedVehicleId || !chosenProduct?.id) {
        setVehicleMembers([]);
        return;
      }

      setIsLoadingMembers(true);
      try {
        const response = await notesService.searchUsersForMention({
          vehicleId: selectedVehicleId,
          productId: chosenProduct.id,
          limit: 100
        });
        
        if (response.success && response.users) {
          setVehicleMembers(response.users);
        } else {
          setVehicleMembers([]);
        }
      } catch (error) {
        console.error('Failed to fetch vehicle members:', error);
        setVehicleMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    if (isOpen) {
      fetchVehicleMembers();
    }
  }, [isOpen, selectedVehicleId, chosenProduct?.id]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TicketFormData>({
    defaultValues: {
      status: 'pending',
      priority: 'medium',
      ticketType: 'task',
    },
  });

  // Mock files for testing when API fails
  const mockFiles = [
    { id: 1, name: 'src.jade', type: 'file' as const, parentId: null, productId: productId, createdAt: '', updatedAt: '' },
    { id: 2, name: 'mynewCreation.py', type: 'file' as const, parentId: null, productId: productId, createdAt: '', updatedAt: '' },
    { id: 3, name: 'routes.ts', type: 'file' as const, parentId: null, productId: productId, createdAt: '', updatedAt: '' },
    { id: 4, name: 'index.jade', type: 'file' as const, parentId: null, productId: productId, createdAt: '', updatedAt: '' },
    { id: 5, name: 'test.py', type: 'file' as const, parentId: null, productId: productId, createdAt: '', updatedAt: '' },
  ];

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    const files = filesResponse?.files && filesResponse.files.length > 0 ? filesResponse.files : mockFiles;
    if (!fileSearchQuery.trim()) return files;

    return files.filter(file =>
      file.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
    );
  }, [filesResponse?.files, fileSearchQuery, productId]);

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName);
    setValue('file', fileName);
    setFileSearchQuery(fileName);
    setShowFileDropdown(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileDropdownRef.current && !fileDropdownRef.current.contains(event.target as Node)) {
        setShowFileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onSubmit = async (data: TicketFormData) => {
    try {


      if (!productId || productId === 0) {

        alert('Please select a product first');
        return;
      }



      const ticketData: CreateTicketRequest = {
        file: data.file || 'Untitled File', // Ensure file is always provided
        name: data.file || 'Untitled Ticket', // Use file name as ticket name or default
        description: data.description,
        status: data.status,
        priority: data.priority,
        ticketType: data.ticketType,
        assignedTo: data.assignedTo || undefined,
        // vehicleId will be automatically added by useCreateTicketMutation hook
      };


      await createTicketMutation.mutateAsync({
        productId,
        data: ticketData,
      });

      reset();
      onClose();
    } catch (error) {
      console.error(' AddTicketModal: Failed to create ticket:', error);
    }
  };

  const handleClose = () => {
    reset();
    setFileSearchQuery('');
    setSelectedFile('');
    setShowFileDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  flex items-center justify-center z-50 transition-opacity duration-300">
      <style jsx global>{`
            select option:hover {
              background-color: #627899 !important;
              color: white !important;
            }
            select option:checked {
              background-color: transparent !important;
            }
            select option:focus {
              background-color: #627899 !important;
              color: white !important;
            }
          `}</style>
      <div className="bg-white p-6 rounded-[12px] shadow-2xl max-w-[650px] w-[90%] max-h-[95vh] overflow-y-auto animate-fade-in">
        {/* Header with title and close button */}
        <div className="flex justify-between items-center mb-6">
          <div className={`font-semibold ${poppins.className} text-[20px] text-[#000]`}>
            Add new ticket
          </div>
          <button
            onClick={handleClose}
            className="text-[#000] hover:text-gray-600 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Search file field */}
          <div className="relative" style={{ width: '320px' }} ref={fileDropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={fileSearchQuery}
                onChange={(e) => {
                  setFileSearchQuery(e.target.value);
                  setShowFileDropdown(true);
                  setValue('file', e.target.value);
                }}
                onFocus={() => setShowFileDropdown(true)}
                placeholder="Search file"
                className="gradient-input text-[16px] text-gray-900 focus:outline-none w-full"
                style={{
                  padding: '12px 16px',
                }}
              />

              {/* Dropdown arrow */}
              <div className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ right: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                  <path d="M9 0C4.02817 0 0 4.04225 0 9.01408C0 13.9859 4.02817 18.0282 9 18.0282C13.9718 18.0282 18 13.9859 18 9.01408C17.9859 4.04225 13.9577 0 9 0ZM9 17.2817C4.43662 17.2817 0.746479 13.5775 0.746479 9.01408C0.746479 4.4507 4.43662 0.746479 9 0.746479C13.5493 0.746479 17.2535 4.4507 17.2535 9.01408C17.2394 13.5775 13.5493 17.2817 9 17.2817ZM8.95775 4.05634L4.6338 8.38028L5.16901 8.91549L8.61972 5.46479V14.6479H9.3662V5.5493L12.7465 8.92958L13.2817 8.39437L8.95775 4.05634Z" fill="#627899" />
                </svg>
              </div>
            </div>

            {/* Dropdown */}
            {showFileDropdown && (
              <div
                className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg max-h-48 overflow-y-auto z-10"
                style={{ width: '320px' }}
              >
                {filesLoading ? (
                  <div className="p-3 text-gray-500 text-center">Loading files...</div>
                ) : filesError ? (
                  <div className="p-3 text-red-500 text-center">
                    Error loading files: {filesError.message || 'Unknown error'}
                  </div>
                ) : filteredFiles.length > 0 ? (
                  filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleFileSelect(file.name)}
                    >
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">
                          {file.type === 'folder' ? '📁' : '📄'}
                        </span>
                        <span className="text-gray-900">{file.name}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">
                    {fileSearchQuery ? 'No files found' : 'No files available'}
                    {filesResponse && !filesResponse.success && (
                      <div className="text-xs text-red-400 mt-1">
                        {filesResponse.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {errors.file && (
              <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
            )}
          </div>

          {/* Assign people field */}
          <div className="relative" style={{ width: '240px' }}>
            <div className="flex items-center pb-1 relative" style={{ width: '240px' }}>
              <svg
                className="mr-3 flex-shrink-0"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: 'translateY(-3px)' }}
              >
                <path d="M19.7364 18.7635L15.4335 14.4615C16.6806 12.9642 17.3025 11.0438 17.1698 9.09965C17.037 7.15552 16.1599 5.33741 14.7208 4.02352C13.2817 2.70964 11.3915 2.00114 9.44337 2.04541C7.49522 2.08969 5.63914 2.88333 4.26123 4.26123C2.88333 5.63914 2.08969 7.49522 2.04541 9.44337C2.00114 11.3915 2.70964 13.2817 4.02352 14.7208C5.33741 16.1599 7.15552 17.037 9.09965 17.1698C11.0438 17.3025 12.9642 16.6806 14.4615 15.4335L18.7635 19.7364C18.8274 19.8002 18.9033 19.8509 18.9867 19.8855C19.0702 19.92 19.1596 19.9378 19.25 19.9378C19.3403 19.9378 19.4297 19.92 19.5132 19.8855C19.5967 19.8509 19.6725 19.8002 19.7364 19.7364C19.8002 19.6725 19.8509 19.5967 19.8855 19.5132C19.92 19.4297 19.9378 19.3403 19.9378 19.25C19.9378 19.1596 19.92 19.0702 19.8855 18.9867C19.8509 18.9033 19.8002 18.8274 19.7364 18.7635ZM3.43745 9.62495C3.43745 8.40118 3.80034 7.20489 4.48023 6.18736C5.16013 5.16983 6.12648 4.37676 7.2571 3.90845C8.38772 3.44013 9.63182 3.3176 10.8321 3.55634C12.0323 3.79509 13.1348 4.38439 14.0002 5.24973C14.8655 6.11507 15.4548 7.21757 15.6936 8.41783C15.9323 9.61809 15.8098 10.8622 15.3415 11.9928C14.8731 13.1234 14.0801 14.0898 13.0625 14.7697C12.045 15.4496 10.8487 15.8125 9.62495 15.8125C7.98448 15.8106 6.41173 15.1582 5.25174 13.9982C4.09175 12.8382 3.43927 11.2654 3.43745 9.62495Z" fill="#181818" fillOpacity="0.5" />
              </svg>
              <select
                {...register('assignedTo')}
                className="border-0 text-[16px] text-gray-900 focus:outline-none bg-transparent appearance-none flex-1 pr-8"
                style={{
                  width: '240px',
                  backgroundColor: 'transparent'
                }}
                disabled={isLoadingMembers || !selectedVehicleId}
              >
                <option value="">Assign people</option>
                {!selectedVehicleId ? (
                  <option value="" disabled>Please select a vehicle first</option>
                ) : isLoadingMembers ? (
                  <option value="" disabled>Loading members...</option>
                ) : vehicleMembers.length === 0 ? (
                  <option value="" disabled>No members found for this vehicle</option>
                ) : (
                  vehicleMembers.map((user: any) => {
                    // Get the original role from user.role (global role) or productRole/vehicleRole
                    const rawRole = user.role || user.productRole || user.vehicleRole || 'member';
                    const formattedRole = formatRole(rawRole) || rawRole;
                    return (
                      <option key={user.id} value={user.id}>
                        {user.name} - {formattedRole}
                  </option>
                    );
                  })
                )}
              </select>
              <div className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ right: '6px', transform: 'translateY(-3px)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                  <path d="M9 0C4.02817 0 0 4.04225 0 9.01408C0 13.9859 4.02817 18.0282 9 18.0282C13.9718 18.0282 18 13.9859 18 9.01408C17.9859 4.04225 13.9577 0 9 0ZM9 17.2817C4.43662 17.2817 0.746479 13.5775 0.746479 9.01408C0.746479 4.4507 4.43662 0.746479 9 0.746479C13.5493 0.746479 17.2535 4.4507 17.2535 9.01408C17.2394 13.5775 13.5493 17.2817 9 17.2817ZM8.95775 4.05634L4.6338 8.38028L5.16901 8.91549L8.61972 5.46479V14.6479H9.3662V5.5493L12.7465 8.92958L13.2817 8.39437L8.95775 4.05634Z" fill="#627899" />
                </svg>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0"
              style={{
                background: '#8B8B8B',
                width: '240px',
                height: '1px'
              }}
            ></div>
            {!selectedVehicleId && (
              <p className="text-orange-500 text-sm mt-1">Please select a vehicle to assign people</p>
            )}
            {selectedVehicleId && vehicleMembers.length === 0 && !isLoadingMembers && (
              <p className="text-orange-500 text-sm mt-1">No members found for this vehicle</p>
            )}
          </div>

          {/* Status field */}
          <div className="relative" style={{ width: '240px' }}>
            <div className="flex items-center pb-1 relative" style={{ width: '240px' }}>
              <select
                {...register('status')}
                className="border-0 text-[16px] text-gray-900 focus:outline-none bg-transparent appearance-none flex-1 pr-8"
                style={{
                  width: '240px',
                  backgroundColor: 'transparent'
                }}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="qa_failed">QA Failed</option>
                <option value="pending_feedback">Pending Feedback</option>
              </select>
              <div className="absolute top-1/2 transform -translate-y-1/2 pointer-events-none" style={{ right: '6px', transform: 'translateY(-3px)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="19" viewBox="0 0 18 19" fill="none">
                  <path d="M9 0C4.02817 0 0 4.04225 0 9.01408C0 13.9859 4.02817 18.0282 9 18.0282C13.9718 18.0282 18 13.9859 18 9.01408C17.9859 4.04225 13.9577 0 9 0ZM9 17.2817C4.43662 17.2817 0.746479 13.5775 0.746479 9.01408C0.746479 4.4507 4.43662 0.746479 9 0.746479C13.5493 0.746479 17.2535 4.4507 17.2535 9.01408C17.2394 13.5775 13.5493 17.2817 9 17.2817ZM8.95775 4.05634L4.6338 8.38028L5.16901 8.91549L8.61972 5.46479V14.6479H9.3662V5.5493L12.7465 8.92958L13.2817 8.39437L8.95775 4.05634Z" fill="#627899" />
                </svg>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0"
              style={{
                background: '#8B8B8B',
                width: '240px',
                height: '1px'
              }}
            ></div>
          </div>

          {/* Description field */}
          <div
            className="flex flex-col items-start mt-12 relative"
            style={{
              width: '320px',
              gap: '4px'
            }}
          >
            <input
              {...register('description')}
              type="text"
              className="border-0 text-[16px] text-gray-900 focus:outline-none bg-transparent w-full"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                fontFamily: 'Poppins',
                fontWeight: 400
              }}
              placeholder=""
            />
            <div
              style={{
                width: '100%',
                height: '1px',
                background: '#535354',
                opacity: 0.5
              }}
            ></div>
            <span
              style={{
                color: 'var(--Text-Dark-Grey, #535354)',
                fontFamily: 'Poppins',
                fontSize: '16px',
                fontStyle: 'normal',
                fontWeight: 400,
                lineHeight: '140%'
              }}
            >
              Description
            </span>
          </div>

          {/* Create button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={createTicketMutation.isPending}
              className="hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                gap: '10px',
                flexShrink: 0
              }}
            >
              {createTicketMutation.isPending ? (
                <>
                  <Spinner size="sm"  />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
