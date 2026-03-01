'use client';

import { useCreateProductMutation, useUpdateProductMutation } from '@/entities/product/model/query';
import { productApiService } from '@/entities/product/api/api';
import { useProductStore } from '@/entities/product/store';
import { handleProductApiError, handleProductApiSuccess } from '@/entities/product/utils/errorHandler';
import useUserStore from '@/entities/worker/api/mock/userStore';
import { showToast } from '@/lib/utils/toast';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import Spinner from '@/shared/ui/Spinner';
import { useModalWindowStore } from '@/store/modalWindowsStore';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCreationProductStore } from '../../store';
import EditFilesForm from './forms/EditFilesForm';
import EditMemberForm from './forms/EditMembersForm';
import EditNameForm from './forms/EditNameForm';
import { useQueryClient } from '@tanstack/react-query';
import { fastApiService } from '@/lib/api/services/fastApiService';

const poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export default function ReviewInformation() {
  const decrimentStep = useCreationProductStore((state) => state.decrimentStep);
  const { setPostProductCreation } = useModalWindowStore();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { setChosenProduct } = useProductStore();
  const { getUserByEmail, updateUser } = useUserStore();

  const creationProdStore = useCreationProductStore();
  const { mutate: createProduct, status } = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  
  const onConfirmBtnClick = async () => {
    await createProductAPI();
  };

  const createProductAPI = async () => {
    const productData = {
      name: creationProdStore.name,
      description: '',
      materialLink: creationProdStore.materialLink,
      teamMembers: creationProdStore.members.map(member => ({
        email: member.email,
        name: member.name,
        role: member.position === 'PM' ? 'PM' :
          member.position === 'Design' ? 'Designer' :
            member.position === 'Engineer' ? 'Engineer/QA' :
              member.position === 'Founder' ? 'Founder / CEO / CPO' : 'PM'
      }))
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(productData));

    if (creationProdStore.materialFiles.length > 0) {
      creationProdStore.materialFiles.forEach((file, index) => {
        formData.append(`files`, file);
      });
    }

    try {
      createProduct(formData, {
        onSuccess: async (response) => {
         
          const newlyCreatedProduct = response.product;
          const productId = newlyCreatedProduct.id;
          setChosenProduct(newlyCreatedProduct);
          setPostProductCreation(true);
          localStorage.setItem('product_just_created', 'true');
          handleProductApiSuccess('Product created successfully!');

          const memberEmails = creationProdStore.members.map((m) => m.email);
          for (const email of memberEmails) {
            const user = getUserByEmail(email);
            if (!user) continue;

            updateUser(user.id, {
              relatedProducts: [
                ...user.relatedProducts,
                String(newlyCreatedProduct.id),
              ],
            });
          }

          // Call workflow/submit after product creation with product_id
          if (productId && creationProdStore.materialFiles && creationProdStore.materialFiles.length > 0) {
            try {
              const userId = localStorage.getItem('user_id');
              if (userId) {
                console.log('[Product Creation] Calling workflow/submit with product_id:', productId);
                
                // Check if PRD file exists in response
                const hasPRDFile = response.prdDetection?.hasPRDFile || false;
                
                if (hasPRDFile) {
                  // Get content from refine-doc if needed, or use existing content
                  let contentString = '';
                  
                  try {
                    const refineResult = await fastApiService.refineDoc(userId, creationProdStore.materialFiles);
                    if (refineResult.content) {
                      contentString = JSON.stringify(refineResult.content, null, 2);
                    } else if (refineResult.refined_prd) {
                      contentString = JSON.stringify(refineResult.refined_prd, null, 2);
                    } else if (refineResult.schema) {
                      contentString = JSON.stringify(refineResult.schema, null, 2);
                    } else {
                      contentString = JSON.stringify(refineResult, null, 2);
                    }
                  } catch (refineError) {
                    console.error('[Product Creation] Error refining doc:', refineError);
                    contentString = JSON.stringify({ productName: creationProdStore.name });
                  }
                  
                  const workflowResult = await fastApiService.submitWorkflow(
                    creationProdStore.name || 'Product PRD',
                    contentString,
                    userId,
                    productId
                  );
                  
                  console.log('[Product Creation] Workflow result:', workflowResult);
                  
                  if (workflowResult?.id) {
                    localStorage.setItem('prd_id', workflowResult.id);
                    console.log('[Product Creation] PRD ID stored:', workflowResult.id);
                  }
                }
              }
            } catch (workflowError: any) {
              console.error('[Product Creation] Error calling workflow/submit:', workflowError);
            }
          }

          // vehicleStep1Basics API call removed - will be called when user clicks "Create Vehicle" in modal

         
          (async () => {
            try {
              console.log('[PRD SAVE] Inside async IIFE, importing services...');
              const { default: swotFileService } = await import('@/lib/api/services/swotFileService');
              const { Descendant } = await import('slate');
              console.log('[PRD SAVE] Services imported successfully');
              
              const hasPRDFile = (files: File[]): boolean => {
                if (!files || files.length === 0) return false;
                const PRD_KEYWORDS = ['prd', 'product requirements document', 'product requirements', 'product requirement', 'requirements document', 'requirement doc', 'product spec', 'product specification', 'feature spec', 'feature specification', 'functional spec', 'functional specification'];
                return files.some(file => {
                  const lowerFilename = file.name.toLowerCase();
                  return PRD_KEYWORDS.some(keyword => lowerFilename.includes(keyword));
                });
              };
              
              const convertTextToSlate = (text: string): Descendant[] => {
                if (!text || text.trim() === '') {
                  return [{ type: 'paragraph', children: [{ text: '' }] }];
                }
                const lines = text.split('\n').filter(line => line.trim() !== '' || line === '');
                if (lines.length === 0) {
                  return [{ type: 'paragraph', children: [{ text: '' }] }];
                }
                return lines.map(line => ({
                  type: 'paragraph' as const,
                  children: [{ text: line || '' }],
                }));
              };
              
              const existingFiles = await swotFileService.getFiles(newlyCreatedProduct.id);
              let prdFile = existingFiles.files.find(f => f.title === 'PRD');
              
              let contentToSave = '';
              
            
              if (creationProdStore.materialFiles && creationProdStore.materialFiles.length > 0) {
                console.log('[PRD Extraction] File names from store:', creationProdStore.materialFiles.map(f => f.name));
              }
              
              try {
                const { productApiService } = await import('@/entities/product/api/api');
                const productDetails = await productApiService.getById(newlyCreatedProduct.id);
                console.log('[PRD Extraction] Product details from backend:', {
                  id: productDetails.product?.id,
                  filesCount: productDetails.product?.files?.length || 0,
                  files: productDetails.product?.files?.map((f: any) => ({
                    filename: f.filename,
                    originalName: f.originalName,
                    fileType: f.fileType
                  })) || []
                });
              } catch (err) {
                console.error('[PRD Extraction] Error fetching product details:', err);
              }
              
              const prdFileWasUploaded = hasPRDFile(creationProdStore.materialFiles);
              console.log('[PRD Extraction] prdFileWasUploaded (from store check):', prdFileWasUploaded);
              
              let prdFileExistsOnBackend = false;
              if (!prdFileWasUploaded) {
                try {
                  const { productApiService } = await import('@/entities/product/api/api');
                  const productDetails = await productApiService.getById(newlyCreatedProduct.id);
                  if (productDetails.product?.files && productDetails.product.files.length > 0) {
                    const hasPRDInBackend = productDetails.product.files.some((f: any) => {
                      const lowerName = (f.filename || f.originalName || '').toLowerCase();
                      return lowerName.includes('prd') || lowerName.includes('product requirements');
                    });
                    prdFileExistsOnBackend = hasPRDInBackend;
                    console.log('[PRD Extraction] Found PRD file in backend:', prdFileExistsOnBackend);
                  }
                } catch (err) {
                  console.error('[PRD Extraction] Error checking backend for PRD:', err);
                }
              }
              
              const shouldExtractPRD = prdFileWasUploaded || prdFileExistsOnBackend;
              console.log('[PRD Extraction] shouldExtractPRD:', shouldExtractPRD);
              console.log('='.repeat(80));
              
              if (shouldExtractPRD) {
                console.log('PRD file was uploaded, extracting text from backend...');
                try {
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  const { productApiService } = await import('@/entities/product/api/api');
                  
                  let extractResult = null;
                  let retries = 8;
                  let lastError = null;
                  
                  console.log('Starting PRD extraction for product:', newlyCreatedProduct.id);
                  
                  while (retries > 0) {
                    try {
                      console.log(`Attempt ${9 - retries}/8: Calling extractPRDFileText API...`);
                      extractResult = await productApiService.extractPRDFileText(newlyCreatedProduct.id);
                      console.log('API Response:', {
                        success: extractResult?.success,
                        hasText: !!extractResult?.text,
                        textLength: extractResult?.text?.length || 0,
                        error: extractResult?.error
                      });
                      
                      if (extractResult.success && extractResult.text && extractResult.text.trim()) {
                        const extractedText = extractResult.text;
                        const nonPrintableCount = (extractedText.match(/[^\x20-\x7E\n\r\t\u00A0-\uFFFF]/g) || []).length;
                        const totalLength = extractedText.length;
                        
                        if (totalLength > 0 && nonPrintableCount / totalLength > 0.3) {
                          console.error('Extracted text appears to be binary data, retrying...');
                          lastError = new Error('Extracted text is binary data');
                          retries--;
                          if (retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, 1500));
                          }
                          continue;
                        }
                        
                        if (extractedText.length < 10) {
                          console.error('Extracted text is too short, retrying...');
                          lastError = new Error('Extracted text is too short');
                          retries--;
                          if (retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, 1500));
                          }
                          continue;
                        }
                        
                        break;
                      } else {
                        lastError = new Error(extractResult.error || 'Extraction returned empty text');
                        console.error(`Attempt ${9 - retries} failed:`, {
                          error: extractResult.error,
                          success: extractResult.success,
                          hasText: !!extractResult.text,
                          textLength: extractResult.text?.length || 0
                        });
                      }
                    } catch (err: any) {
                      lastError = err;
                      console.error(`Attempt ${9 - retries} failed with exception:`, {
                        message: err.message,
                        status: err.response?.status,
                        statusText: err.response?.statusText,
                        data: err.response?.data,
                        fullError: err
                      });
                    }
                    
                    retries--;
                    if (retries > 0) {
                      await new Promise(resolve => setTimeout(resolve, 1500));
                    }
                  }
                  
                  if (extractResult?.success && extractResult.text && extractResult.text.trim()) {
                    contentToSave = extractResult.text;
                    console.log('PRD file text extracted successfully from backend (', extractResult.text.length, ' chars)');
                  } else {
                    console.error('Could not extract text from PRD file after', 8, 'retries');
                    if (lastError) {
                      console.error('Last error details:', {
                        message: lastError.message,
                        response: lastError.response?.data,
                        status: lastError.response?.status,
                        statusText: lastError.response?.statusText
                      });
                    }
                    if (extractResult) {
                      console.error('Last extraction result:', extractResult);
                    }
                    contentToSave = '';
                  }
                } catch (extractError: any) {
                  console.warn('Could not extract PRD file text from backend:', extractError.message);
                  contentToSave = creationProdStore.prdContent || '';
                }
              }
              
              if (!contentToSave && creationProdStore.prdContent && creationProdStore.prdContent.trim()) {
                contentToSave = creationProdStore.prdContent;
                console.log('Using AI-generated PRD content');
              }
              
              let prdFileCreated = false;
              let createdFileId: number | null = null;
              
              if (contentToSave && contentToSave.trim()) {
                const slateContent = convertTextToSlate(contentToSave);
                console.log('Saving PRD content, length:', contentToSave.length);
                
                if (prdFile) {
                  console.log('Updating existing PRD file:', prdFile.id);
                  const updateResult = await swotFileService.updateFile(prdFile.id, {
                    content: slateContent
                  });
                  console.log('PRD file updated:', updateResult);
                  createdFileId = prdFile.id;
                  prdFileCreated = true;
                } else {
                  console.log('Creating new PRD file...');
                  const newFile = await swotFileService.createFile({
                    title: 'PRD',
                    productId: newlyCreatedProduct.id
                  });
                  console.log('PRD file created:', newFile);
                  prdFile = newFile.file;
                  createdFileId = prdFile.id;
                  
                  await new Promise(resolve => setTimeout(resolve, 500));
                  
                  console.log('Updating PRD file content...');
                  const updateResult = await swotFileService.updateFile(prdFile.id, {
                    content: slateContent
                  });
                  console.log('PRD file content updated:', updateResult);
                  prdFileCreated = true;
                }
              } else if (prdFileWasUploaded && !contentToSave) {
                console.error('PRD file uploaded but extraction failed completely after all retries');
                console.error('This indicates a backend issue - file path or extraction logic needs fixing');
              } else {
                console.log('No PRD content to save (neither uploaded file nor AI-generated)');
              }
              
              if (prdFileCreated && createdFileId) {
                console.log('Triggering Product Workspace refresh for file:', createdFileId);
                setTimeout(() => {
                  window.dispatchEvent(new Event('product-changed'));
                  window.dispatchEvent(new CustomEvent('prd-file-created', { 
                    detail: { productId: newlyCreatedProduct.id, fileId: createdFileId } 
                  }));
                  console.log('Events dispatched for Product Workspace refresh');
                }, 1500);
              }
            } catch (prdError: any) {
              console.error('[PRD SAVE] Error saving PRD file:', prdError);
              console.error('[PRD SAVE] Error stack:', prdError?.stack);
              console.error('[PRD SAVE] Error message:', prdError?.message);
              console.error('[PRD SAVE] Full error:', JSON.stringify(prdError, Object.getOwnPropertyNames(prdError), 2));
              if (creationProdStore.materialFiles && creationProdStore.materialFiles.length > 0) {
                const hasPRDFile = (files: File[]): boolean => {
                  if (!files || files.length === 0) return false;
                  const PRD_KEYWORDS = ['prd', 'product requirements document', 'product requirements', 'product requirement', 'requirements document', 'requirement doc', 'product spec', 'product specification', 'feature spec', 'feature specification', 'functional spec', 'functional specification'];
                  return files.some(file => {
                    const lowerFilename = file.name.toLowerCase();
                    return PRD_KEYWORDS.some(keyword => lowerFilename.includes(keyword));
                  });
                };
                if (hasPRDFile(creationProdStore.materialFiles)) {
                  try {
                    const { default: swotFileService } = await import('@/lib/api/services/swotFileService');
                    const existingFiles = await swotFileService.getFiles(newlyCreatedProduct.id);
                    const prdFile = existingFiles.files.find(f => f.title === 'PRD');
                    if (!prdFile) {
                      const newFile = await swotFileService.createFile({
                        title: 'PRD',
                        productId: newlyCreatedProduct.id
                      });
                      console.log('PRD placeholder file created as fallback');
                      setTimeout(() => {
                        window.dispatchEvent(new Event('product-changed'));
                      }, 500);
                    }
                  } catch (fallbackError) {
                    console.error('Failed to create PRD file even as fallback:', fallbackError);
                  }
                }
              }
            }
            console.log('[PRD SAVE] PRD save logic completed (success or error)');
          })();

          try {
            const [refineDocResponse, askDescriptionResponse, proposeVehicleResponse] = await Promise.all([
              productApiService.refineDoc(newlyCreatedProduct.id).catch(err => {
                console.error('Error calling refine-doc:', err);
                return null;
              }),
              productApiService.askDescription(newlyCreatedProduct.id).catch(err => {
                console.error('Error calling ask-description:', err);
                return null;
              }),
              productApiService.proposeVehicle(newlyCreatedProduct.id).catch(err => {
                console.error('Error calling propose-vehicle:', err);
                return null;
              })
            ]);

            // Call FastAPI refine-doc directly to get structured PRD, then submit workflow
            (async () => {
              try {
                // Build the file to send: prefer uploaded material files, then AI-generated PRD text
                let filesToRefine: File[] = [];
                const uploadedFiles = creationProdStore.materialFiles || [];
                const prdText = creationProdStore.prdContent || '';

                if (uploadedFiles.length > 0) {
                  // Use uploaded files directly (they're already File objects)
                  filesToRefine = [...uploadedFiles];
                  console.log('FastAPI refine-doc: using uploaded files:', uploadedFiles.map(f => f.name));
                } else if (prdText.trim()) {
                  // Fallback: create a text file from AI-generated PRD content
                  filesToRefine = [new File([prdText], 'prd.txt', { type: 'text/plain' })];
                  console.log('FastAPI refine-doc: using AI-generated PRD text (' + prdText.length + ' chars)');
                }

                if (filesToRefine.length > 0) {
                  const userId = localStorage.getItem('user_id') || '1';
                  const refineResult = await fastApiService.pmRefineDoc({
                    user_id: userId,
                    files: filesToRefine,
                  });
                  console.log('FastAPI refine-doc result:', refineResult);

                  // If refine succeeded, submit the refined PRD to workflow for structuralizing
                  if (refineResult?.status === 'success' && refineResult?.content) {
                    const prdContentString = Object.entries(refineResult.content)
                      .map(([key, value]) => `## ${key}\n${value}`)
                      .join('\n\n');

                    const workflowResult = await fastApiService.workflowSubmit({
                      content: prdContentString,
                      title: newlyCreatedProduct.name || 'Product PRD',
                      user_id: userId,
                    });
                    console.log('FastAPI workflow submit result:', workflowResult);

                    // Poll for status completion in background
                    if (workflowResult?.id) {
                      const pollStatus = async () => {
                        let retries = 30; // ~2 minutes
                        while (retries > 0) {
                          const status = await fastApiService.workflowStatus(workflowResult.id);
                          if (status?.status === 'COMPLETED' || status?.status === 'completed') {
                            console.log('Workflow completed:', status);
                            return;
                          }
                          if (status?.status === 'FAILED' || status?.status === 'failed') {
                            console.error('Workflow failed:', status);
                            return;
                          }
                          await new Promise(r => setTimeout(r, 4000));
                          retries--;
                        }
                        console.warn('Workflow polling timed out');
                      };
                      pollStatus(); // Fire and forget
                    }
                  }
                } else {
                  console.log('FastAPI refine-doc: skipped — no uploaded files and no PRD content');
                }
              } catch (fastApiError) {
                console.error('FastAPI refine-doc/workflow failed (non-blocking):', fastApiError);
              }
            })();

            if (proposeVehicleResponse?.success && proposeVehicleResponse?.data) {
              console.log('Proposed vehicles saved to database for product:', newlyCreatedProduct.id);
              queryClient.invalidateQueries({ queryKey: ['proposedVehicles', newlyCreatedProduct.id] });
            }

            if (askDescriptionResponse?.success && askDescriptionResponse?.data) {
              try {
                const description = askDescriptionResponse.data?.response || 
                                   askDescriptionResponse.data?.data?.response ||
                                   askDescriptionResponse.data?.description ||
                                   askDescriptionResponse.data?.data?.description ||
                                   askDescriptionResponse.data?.text ||
                                   askDescriptionResponse.data?.data?.text;
                
                if (description && description.trim()) {
                  const trimmedDescription = description.trim();
                  
                  const updatedProduct = {
                    ...newlyCreatedProduct,
                    description: trimmedDescription
                  };
                  setChosenProduct(updatedProduct);
                  
                  await updateProductMutation.mutateAsync({
                    id: newlyCreatedProduct.id,
                    data: { description: trimmedDescription }
                  });
                  
                  queryClient.invalidateQueries({ queryKey: ['products'] });
                  queryClient.invalidateQueries({ queryKey: ['product', newlyCreatedProduct.id] });
                  
                  queryClient.setQueryData(['products'], (oldData: any) => {
                    if (oldData?.products) {
                      return {
                        ...oldData,
                        products: oldData.products.map((p: any) => 
                          p.id === newlyCreatedProduct.id 
                            ? { ...p, description: trimmedDescription }
                            : p
                        )
                      };
                    }
                    return oldData;
                  });
                  
                  queryClient.setQueryData(['product', newlyCreatedProduct.id], (oldData: any) => {
                    if (oldData?.product) {
                      return {
                        ...oldData,
                        product: {
                          ...oldData.product,
                          description: trimmedDescription
                        }
                      };
                    }
                    return oldData;
                  });
                  
                  queryClient.refetchQueries({ queryKey: ['products'] });
                  
                  console.log('Product description updated from FastAPI response (optimistic update)');
                } else {
                  console.warn('ask-description response received but description not found in expected format');
                  console.warn('Response structure:', JSON.stringify(askDescriptionResponse.data, null, 2));
                }
              } catch (updateError) {
                console.error('Error updating product description:', updateError);
              }
            }
          } catch (error) {
            console.error('Error calling FastAPI endpoints:', error);
          }

          router.push('/');
        },
        onError: (err: any) => {
          try {
            handleProductApiError(err, 'Failed to create product. Please try again.');
          } catch (handlerError) {
            showToast.error('Failed to create product. Please try again.');
          }
        },
      });
    } catch (error: any) {
      try {
        handleProductApiError(error, 'Failed to create product. Please try again.');
      } catch (handlerError) {
        showToast.error('Failed to create product. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (status === 'success') {
      setPostProductCreation(true);
      router.push('/');
    }
  }, [status, router, setPostProductCreation]);

  return (
    <div className="bg-white h-[85vh] w-[85vw] pb-[30px] flex flex-col rounded-[24px]">
        <div className="pt-5 w-[86%] h-full mx-auto flex flex-col">
          <div className="flex justify-center">
            <Image
              src={'creation-product-steps/fourth-step.svg'}
              alt="step-five"
              height={27}
              width={320}
            />
          </div>
          <div
            className={`font-poppins text-[24px] mt-5 font-semibold text-center ${poppins600.className}`}
          >
            Review Your Product Information
          </div>

          <div className="  flex flex-col grow overflow-y-auto">
            <EditNameForm />
            <EditFilesForm />
            <EditMemberForm />
          </div>

          <div className="flex justify-between items-center mt-5">
            <div
              className="hover:scale-90 active:scale-90 cursor-pointer transition-all duration-300"
              onClick={() => decrimentStep()}
            >
              <Image
                src={'icons/arrow-to-left.svg'}
                height={30}
                width={30}
                alt="arrow-to-back"
              />
            </div>
            <div className="text-[14px] w-[189px]" onClick={onConfirmBtnClick}>
              <ConfirmBtn
                className="h-[45px]"
                text={status === 'pending' ? 'Creating Product...' : 'Create product'}
                isLoading={status === 'pending'}
              />
            </div>
          </div>
        </div>
      </div>
  );
}
