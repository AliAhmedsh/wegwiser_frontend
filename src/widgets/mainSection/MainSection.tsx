'use client';

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDesignWorkspaceModalStore } from '@/entities/designWorkspaceModal/model';
import { useMessagingModalStore } from '@/entities/messagingModal/model';
import { getValidProducts, useProductsQuery, useProductStore, useProductPRDQuery } from '@/entities/product';
import { useWorkspaceStore } from '@/entities/workspace';
import { fastApiService } from '@/lib/api/services/fastApiService';
import GeneratePrdOutlineModal from '@/sections/generatePrdOutlineModal/GeneratePrdOutlineModal';
import PrdMissingModal from '@/components/PrdMissingModal';
import IconographyPopup from '@/sections/iconographyPopup/IconographyPopup';
import PrdUpdateFlowModal from '@/components/PrdUpdateFlowModal';
import MainSettingsTabPopup from '@/sections/mainSettignsTabPopup/MainSettingsTabPopup';
import MainWorkspacePopup from '@/sections/mainWorkspacePopup/MainWorkspacePopup';
import MessagingModal from '@/sections/messaging/MessagingModal';
import PersonalAnalyticsModal from '@/sections/personalAnalyticsModal/PersonalAnalyticsModal';
import ProductModal from '@/sections/productModal/ProductModal';
import ProfileModal from '@/sections/profileModal/ProfileModal';
import AddVehiclesModal from '@/components/AddVehiclesModal';
import Modal from '@/shared/portals/ModalWindow';
import { useGuidelineStore } from '@/store/guidelinesStore';
import { useModalWindowStore } from '@/store/modalWindowsStore';
import { useInvitationStore } from '@/store/invitationStore';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import useMainWorkspaceStore from '@/store/workSpaceStore';
import useAiStore from '@/store/AiStore';
import DesignWorkspaceModal from '@/workspaces/designWorkspace/designWorkspace';
import ProductWorkspace from '@/workspaces/productWorkspace/ProductWorkspace';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Spinner from '@/shared/ui/Spinner';
import BottomWidgetBtn from '../../assets/widget-btns/bottom-widget-btn.svg';

const PRD_MODAL_DISMISSED_KEY = 'prd_modal_dismissed_products';

const getDismissedProducts = (): number[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PRD_MODAL_DISMISSED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const addDismissedProduct = (productId: number) => {
  if (typeof window === 'undefined') return;
  try {
    const dismissed = getDismissedProducts();
    if (!dismissed.includes(productId)) {
      dismissed.push(productId);
      localStorage.setItem(PRD_MODAL_DISMISSED_KEY, JSON.stringify(dismissed));
    }
  } catch (error) {
    console.error('Error saving dismissed product:', error);
  }
};

const isProductDismissed = (productId: number): boolean => {
  return getDismissedProducts().includes(productId);
};

function determinePRDModalState(hasPRD: boolean | null): 'prd-missing' | null {
  if (hasPRD === false) {
    return 'prd-missing';
  }
  
  return null;
}

export default function MainSection() {
  const step = useGuidelineStore((state) => state.step);
  const router = useRouter();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductWorkspace, setShowProductWorkspace] = useState(false);
  const [showGeneratePrdOutlineModal, setShowGeneratePrdOutlineModal] =
    useState(false);
  const [showPrdMissingModal, setShowPrdMissingModal] = useState(false);
  const [showPersonalAnalyticsModal, setShowPersonalAnalyticsModal] =
    useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddVehiclesModal, setShowAddVehiclesModal] = useState(false);

  const { chosenProduct, setChosenProduct } = useProductStore();
  const { toggleAiWindow, isShowAiWindow, sendMessage } = useAiStore();
  
  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useProductsQuery();
  const allProducts = productsResponse?.products || [];
  const products = getValidProducts(allProducts);

  const { data: prdData, isLoading: prdLoading } = useProductPRDQuery(
    chosenProduct?.id || 0,
    !!chosenProduct?.id
  );
  const hasPRD = prdData?.success && prdData?.prd !== null;

  const {
    openModal: openDesignWorkspaceModal,
    closeModal: closeDesignWorkspaceModal,
  } = useDesignWorkspaceModalStore();
  const {
    openWorkspace: openEngineeringWorkspace,
    closeWorkspace: closeEngineeringWorkspace,
  } = useWorkspaceStore();
  const { isOpen: isMessagingModalOpen, closeModal: closeMessagingModal } =
    useMessagingModalStore();
  const { iconographyPopupOpen, setIconographyPopupOpen, openProductWorkspaceForPrdUpdate, setOpenProductWorkspaceForPrdUpdate } = useModalWindowStore();
  const { setFullScreen } = useMainWorkspaceStore();

  useEffect(() => {
    if (openProductWorkspaceForPrdUpdate) {
      setShowProductWorkspace(true);
      setOpenProductWorkspaceForPrdUpdate(false);
    }
  }, [openProductWorkspaceForPrdUpdate, setOpenProductWorkspaceForPrdUpdate]);

  const { logout, user } = useLoginStore();
  const { isAcceptingInvitation } = useInvitationStore();

  const handleCloseProductWorkspace = () => {
    setShowProductWorkspace(false);
    setShowPrdMissingModal(false);
    setShowGeneratePrdOutlineModal(false);
    setFullScreen(false);
  };

  useEffect(() => {
    if (user && !chosenProduct && products && products.length > 0 && !productsLoading) {
      const firstProduct = products[0];
      setChosenProduct(firstProduct);
      
      (async () => {
        try {
          const result = await fastApiService.getPrdByProduct(firstProduct.id);
          if (result?.prd_id) {
            localStorage.setItem('prd_id', result.prd_id);
            console.log('[MainSection] PRD ID saved to localStorage:', result.prd_id);
          } else if (result?.id) {
            localStorage.setItem('prd_id', result.id);
            console.log('[MainSection] PRD ID saved to localStorage:', result.id);
          }
        } catch (error: any) {
          console.warn('[MainSection] Failed to fetch PRD by product:', error.response?.data || error.message);
        }
      })();
    }
  }, [user, chosenProduct, products, setChosenProduct, productsLoading]);

  useEffect(() => {
    if (!user && chosenProduct) {
      setChosenProduct(null);
    }
  }, [user, chosenProduct, setChosenProduct]);

  const handleWorkspaceSelect = (option: string) => {
    setShowProductModal(false);
    setShowProductWorkspace(false);
    setShowGeneratePrdOutlineModal(false);
    setShowPersonalAnalyticsModal(false);
    closeDesignWorkspaceModal();
    closeEngineeringWorkspace();
    closeMessagingModal();

    if (option === 'Product workspace') {
      setShowProductWorkspace(true);

    } else if (option === 'Design workspace') {
      openDesignWorkspaceModal();
    } else if (option === 'Engineering workspace') {
      openEngineeringWorkspace();
    }
  };

  const handleProductLabelClick = () => {
    if (!chosenProduct) {
      router.push('/product-creation');
      return;
    }

    setShowProductModal(true);
  };

  const handleGeneratePrdConfirm = async () => {
    setShowGeneratePrdOutlineModal(false);
    
    if (!chosenProduct) return;
    

    if (!isShowAiWindow) {
      toggleAiWindow();
    }
    

    const query = `Generate a PRD outline for ${chosenProduct.name}`;
    await sendMessage(query);
  };

  const handleGeneratePrdDecline = () => {
    setShowGeneratePrdOutlineModal(false);
    

    if (chosenProduct) {
      addDismissedProduct(chosenProduct.id);
    }
  };

  const handlePrdMissingOk = async () => {
    setShowPrdMissingModal(false);
    
    if (!chosenProduct) return;
    
 
    if (!isShowAiWindow) {
      toggleAiWindow();
    }
    
    // Send query to AI to generate PRD
    const query = `Generate a PRD outline for ${chosenProduct.name}`;
    await sendMessage(query);
  };

  const onMainSettingsTabSelect = (option: string) => {
    if (option === 'Log out') {
      logout();
      router.push('/login');
      return;
    }
    if (option === 'My Profile') {
      setShowProfileModal(true);
      setShowProductModal(false);
      setShowProductWorkspace(false);
      setShowGeneratePrdOutlineModal(false);
      setShowPersonalAnalyticsModal(false);
      closeDesignWorkspaceModal();
      closeEngineeringWorkspace();
      closeMessagingModal();
      return;
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-[-3px] right-1/2 translate-x-1/2 w-full max-w-1/3 flex justify-center ${step === 5 ? 'z-100' : 'z-10'
          }`}
      >
        <div className="widget-btn w-full h-[40px] relative top-1 flex justify-center items-center">
          <BottomWidgetBtn
            className="absolute w-full h-full z-0"
            style={{ filter: 'drop-shadow(0px -2px 2px #A7B1C499)' }}
          />
          <button
            onClick={() => handleProductLabelClick()}
            className="text-[12px] z-10 text-white ml-6 flex items-center justify-center bg-[#627899] w-1/2 rounded-xl cursor-pointer"
          >
            {productsLoading || isAcceptingInvitation ? (
              <>
                <Spinner size="xs" color="white" className="mr-2" />
                Loading...
              </>
            ) : (
              chosenProduct?.name || (products && products.length > 0 ? 'Select a product' : 'Create a product')
            )}
          </button>
          <div className="flex justify-center gap-3 w-[125px] z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Image
                  src="icons/Dashboard.svg"
                  className="w-auto h-auto cursor-pointer hover:scale-95 transition-all transform active:scale-90"
                  alt="dashboard"
                  width={24}
                  height={24}
                />
              </DropdownMenuTrigger>
              <MainWorkspacePopup onSelect={handleWorkspaceSelect} />
            </DropdownMenu>
            <Image
              src="icons/Analytics.svg"
              className="w-auto h-auto cursor-pointer hover:scale-95 transition-all transform active:scale-90"
              alt="analytics"
              width={24}
              height={24}
              onClick={() => {
                if (showPersonalAnalyticsModal) {
                  setShowPersonalAnalyticsModal(false);
                } else {
                  setShowPersonalAnalyticsModal(true);
                  setShowProductModal(false);
                  setShowProductWorkspace(false);
                  setShowGeneratePrdOutlineModal(false);
                  closeDesignWorkspaceModal();
                  closeEngineeringWorkspace();
                  closeMessagingModal();
                }
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Image
                  src="icons/Settings.svg"
                  className="w-auto cursor-pointer hover:scale-95 transition-all transform active:scale-90"
                  alt="settings"
                  width={24}
                  height={24}
                />
              </DropdownMenuTrigger>
              <MainSettingsTabPopup onSelect={onMainSettingsTabSelect} />
            </DropdownMenu>
            {chosenProduct?.id && (
              <Image
                src="icons/Vehicle.svg"
                className="w-auto h-auto cursor-pointer hover:scale-95 transition-all transform active:scale-90"
                alt="add vehicles"
                width={24}
                height={24}
                onClick={() => setShowAddVehiclesModal(true)}
                title="Add Vehicles To Your Product"
              />
            )}
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />

      <Modal
        isOpen={showProductWorkspace}
        onClose={handleCloseProductWorkspace}
      >
        <ProductWorkspace onClose={handleCloseProductWorkspace} />
      </Modal>

      <GeneratePrdOutlineModal
        isOpen={showGeneratePrdOutlineModal}
        onClose={handleGeneratePrdDecline}
        onConfirm={handleGeneratePrdConfirm}
      />

      <PrdMissingModal
        isOpen={showPrdMissingModal}
        onConfirm={handlePrdMissingOk}
        mode="prd-missing"
      />

      <PersonalAnalyticsModal
        isOpen={showPersonalAnalyticsModal}
        onClose={() => setShowPersonalAnalyticsModal(false)}
        noDimming={true}
      />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      {chosenProduct?.id && (
        <AddVehiclesModal
          isOpen={showAddVehiclesModal}
          onClose={() => setShowAddVehiclesModal(false)}
          productId={chosenProduct.id}
        />
      )}
      <MessagingModal
        isOpen={isMessagingModalOpen}
        onClose={closeMessagingModal}
      />

      <IconographyPopup
        isOpen={iconographyPopupOpen}
        onClose={() => setIconographyPopupOpen(false)}
      />

      <PrdUpdateFlowModal />

      <DesignWorkspaceModal />
    </>
  );
}
