import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Spinner from '@/shared/ui/Spinner';
import { CreateDependencyRequest } from '../api/dependenciesService';

interface AddDependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDependencyRequest) => void;
  isLoading?: boolean;
}

interface FormData {
  name: string;
  issue: string;
  blockedBy: string;
  status: 'at_risk' | 'on_track' | 'blocked' | 'completed';
  description: string;
}

export default function AddDependencyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}: AddDependencyModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      issue: '',
      blockedBy: '',
      status: 'at_risk',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  const handleFormSubmit = (data: FormData) => {
    const submitData = {
      name: data.name,
      description: data.description,
      type: 'library' as const, // Default type for compatibility
      status: 'active' as const, // Map to original status
      version: '', // Default empty version
    };
    onSubmit(submitData);
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      reset();
    }, 200);
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-2xl relative"
          style={{
            width: '549px',
            height: '420px',
            flexShrink: 0
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            className="absolute cursor-pointer"
            style={{ top: '26px', right: '26px' }}
            onClick={handleClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M11.8337 1.3415L10.6587 0.166504L6.00033 4.82484L1.34199 0.166504L0.166992 1.3415L4.82533 5.99984L0.166992 10.6582L1.34199 11.8332L6.00033 7.17484L10.6587 11.8332L11.8337 10.6582L7.17533 5.99984L11.8337 1.3415Z" fill="black" />
            </svg>
          </button>

          <h2
            className="mb-6"
            style={{
              color: '#000',
              fontFamily: 'Poppins',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 600,
              lineHeight: '140%'
            }}
          >
            Add new dependency
          </h2>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            <div className="-mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    className="w-full pr-2 pl-0 py-0 border-0 border-b bg-transparent text-gray-900 focus:outline-none focus:border-b-2"
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#535354',
                      opacity: 0.5
                    }}
                    placeholder=""
                  />
                  <label
                    className="block mt-1"
                    style={{
                      color: '#535354',
                      fontFamily: 'Poppins',
                      fontSize: '13px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '140%'
                    }}
                  >
                    Name
                  </label>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 -mt-6">
              <div>
                <input
                  {...register('issue', { required: 'Issue is required' })}
                  className="w-full pr-2 pl-0 py-0 border-0 border-b bg-transparent text-gray-900 focus:outline-none focus:border-b-2"
                  style={{
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: '#535354',
                    opacity: 0.5
                  }}
                  placeholder=""
                />
                <label
                  className="block mt-1"
                  style={{
                    color: '#535354',
                    fontFamily: 'Poppins',
                    fontSize: '13px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '140%'
                  }}
                >
                  Issue
                </label>
                {errors.issue && (
                  <p className="text-red-500 text-sm mt-1">{errors.issue.message}</p>
                )}
              </div>

              <div>
                <input
                  {...register('blockedBy')}
                  className="w-full pr-2 pl-0 py-0 border-0 border-b bg-transparent text-gray-900 focus:outline-none focus:border-b-2"
                  style={{
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: '#535354',
                    opacity: 0.5
                  }}
                  placeholder=""
                />
                <label
                  className="block mt-1"
                  style={{
                    color: '#535354',
                    fontFamily: 'Poppins',
                    fontSize: '13px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '140%'
                  }}
                >
                  Blocked by
                </label>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="w-full pr-8 pl-0 py-0 border-0 border-b bg-transparent text-gray-900 focus:outline-none focus:border-b-2 appearance-none"
                    style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#535354',
                      opacity: 0.5
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setIsDropdownOpen(false)}
                  >
                    <option value="at_risk">At risk</option>
                    <option value="on_track">On track</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>
                  <div className="absolute top-0 right-2 h-full flex items-center pb-6 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        transform: isDropdownOpen ? 'rotate(0deg)' : 'rotate(90deg)'
                      }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <label
                    className="block mt-1"
                    style={{
                      color: '#535354',
                      fontFamily: 'Poppins',
                      fontSize: '13px',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      lineHeight: '140%'
                    }}
                  >
                    Status
                  </label>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '-10px' }}>
              <textarea
                {...register('description', { required: 'Description is required' })}
                className="w-full pr-2 pl-0 py-0 border-0 border-b bg-transparent text-gray-900 focus:outline-none focus:border-b-2 resize-none"
                style={{
                  borderBottomWidth: '1px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: '#535354',
                  opacity: 0.5
                }}
                placeholder=""
                rows={1}
              />
              <label
                className="block mt-1"
                style={{
                  color: '#535354',
                  fontFamily: 'Poppins',
                  fontSize: '13px',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  lineHeight: '140%'
                }}
              >
                Description
              </label>
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="cursor-pointer disabled:opacity-50 transition-colors"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" />
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
    </AnimatePresence>
  );
}
