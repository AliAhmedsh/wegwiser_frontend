'use client';

import { useGuidelineStore } from '@/store/guidelinesStore';
import Design from '@/widgets/design/Design';
import Engineering from '@/widgets/engineering/Engineering';
import Product from '@/widgets/product/Product';
import MainSection from '@/widgets/mainSection/MainSection';
import NoteButton from '../header/components/NoteButton';
import HelpButton from '../header/components/HelpButton';
import MessageButton from '../header/components/messageButton';
import AiButton from '../header/components/AiButton';
import VehicleCanvasWrapper from './vehicleCanvasWrapper';
import useWorkspaceStore from '@/store/workSpaceStore';
import ProductIsCreated from '@/features/createProduct/ui/ProductIsCreated';
import SimulationCreatedModal from '@/features/createVehicle/ui/SimulationCreatedModal';
import { useModalWindowStore } from '@/store/modalWindowsStore';
import AIChat from '@/features/AiChat/AiChat';
import useAiStore from '@/store/AiStore';
import GuideLineBlock, {
  GuideLineBlockInterface,
} from '@/lib/shepherdGuidelines/guideLineBlocks/default/guideLineBlock';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useEffect, useState } from 'react';
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/utils/toast';
import CreateProductModal from '@/components/CreateProductModal';
import AddVehiclesModal from '@/components/AddVehiclesModal';
import { useProductsQuery, getValidProducts } from '@/entities/product';
import { useProductStore } from '@/entities/product/store';
import { useCreationProductStore } from '@/features/createProduct';
import { useIsProductManager } from '@/lib/utils/userRole';

const isNewUser = (createdAt: string | Date | null | undefined): boolean => {
  if (!createdAt) return false;
  
  const createdDate = new Date(createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceCreation < 24;
};

export default function Home() {
  const { isGuidelining, step, tutorialCompleted, setIsGuidelining, setTutorialCompleted } = useGuidelineStore();
  const { postProductCreation, simulationCreated, iconographyPopupOpen } = useModalWindowStore();
  const { isFullScreen } = useWorkspaceStore();
  const { isShowAiWindow, toggleAiWindow, sendMessage } = useAiStore();
  const { user, logout } = useLoginStore();
  const router = useRouter();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showGeneratePrdModal, setShowGeneratePrdModal] = useState(false);
  const [showAddVehiclesModal, setShowAddVehiclesModal] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  
  const isProductManager = useIsProductManager();
  const { chosenProduct } = useProductStore();
  
  const { resetAll: resetAllProdCreation } = useCreationProductStore();
  
  const { data: productsResponse, isLoading: productsLoading } = useProductsQuery();
  const allProducts = productsResponse?.products || [];
  const products = getValidProducts(allProducts);
  const hasNoProducts = !productsLoading && products.length === 0;

  useEffect(() => {
    if (!user) {
      setShowPrivacyModal(false);
      setIsGuidelining(false);
      return;
    }
    
    const userEmail = user.email;
    const userPrivacyKey = `privacy_policy_accepted_${userEmail}`;
    const userPrivacyAccepted = localStorage.getItem(userPrivacyKey);
    const privacyAccepted = localStorage.getItem('privacy_policy_accepted');
    
    let userIsNew = false;
    if (user.createdAt) {
      userIsNew = isNewUser(user.createdAt);
    } else {
      userIsNew = !privacyAccepted && !userPrivacyAccepted;
    }
    
    console.log('Privacy check (FIRST PRIORITY):', { 
      userIsNew, 
      privacyAccepted, 
      userPrivacyAccepted, 
      userEmail, 
      createdAt: user.createdAt,
      hasCreatedAt: !!user.createdAt,
      shouldShowPrivacy: userIsNew && !privacyAccepted && !userPrivacyAccepted
    });
    
    if (userIsNew && !privacyAccepted && !userPrivacyAccepted) {
      console.log('Showing privacy modal (FIRST PRIORITY)');
      setShowPrivacyModal(true);
      setIsGuidelining(false);
      setShowGeneratePrdModal(false);
    } else {
      setShowPrivacyModal(false);
      if (user.createdAt && !isNewUser(user.createdAt)) {
        setTutorialCompleted(true);
        setIsGuidelining(false);
      }
    }
  }, [user, setIsGuidelining, setTutorialCompleted]);

  useEffect(() => {
    if (!user) return;
    
    if (showPrivacyModal) {
      setIsGuidelining(false);
      setShowGeneratePrdModal(false);
      return;
    }
    
    if (tutorialCompleted) {
      setIsGuidelining(false);
      return;
    }
    
    const userEmail = user.email;
    const userPrivacyKey = `privacy_policy_accepted_${userEmail}`;
    const userPrivacyAccepted = localStorage.getItem(userPrivacyKey);
    const privacyAccepted = localStorage.getItem('privacy_policy_accepted');
    
    const userIsNew = user.createdAt ? isNewUser(user.createdAt) : (!privacyAccepted && !userPrivacyAccepted);
    
    if (userIsNew && (privacyAccepted || userPrivacyAccepted) && !tutorialCompleted) {
      console.log('Showing tutorial (after privacy accepted)', { userIsNew, privacyAccepted, userPrivacyAccepted, tutorialCompleted, createdAt: user.createdAt });
      setIsGuidelining(true);
      setShowGeneratePrdModal(false);
    } else if (user.createdAt && !isNewUser(user.createdAt)) {
      setIsGuidelining(false);
    } else {
      setIsGuidelining(false);
    }
  }, [user, tutorialCompleted, setIsGuidelining, setTutorialCompleted, showPrivacyModal]);

  const handlePrivacyAccept = () => {
    if (user?.email) {
      const userPrivacyKey = `privacy_policy_accepted_${user.email}`;
      localStorage.setItem('privacy_policy_accepted', 'true');
      localStorage.setItem(userPrivacyKey, 'true');
      
      const userIsNew = isNewUser(user.createdAt);
      
      setShowPrivacyModal(false);
      showToast.success('Privacy policy accepted');
      
      if (userIsNew && !tutorialCompleted) {
        console.log('Privacy accepted - showing tutorial', { userIsNew, tutorialCompleted, userEmail: user.email });
        setTimeout(() => {
          setIsGuidelining(true);
          console.log('Tutorial state set to true');
        }, 600);
      } else {
        console.log('Tutorial not shown after privacy accept', { userIsNew, tutorialCompleted });
      }
    }
  };

  const handlePrivacyDecline = () => {
    showToast.error('You must accept the privacy policy to use this service');
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (!user || productsLoading) return;
    
    if (showPrivacyModal || isGuidelining) {
      setShowGeneratePrdModal(false);
      return;
    }
    
    if (isProductManager && hasNoProducts && !showPrivacyModal && !isGuidelining && tutorialCompleted) {
      const timer = setTimeout(() => {
        setShowGeneratePrdModal(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!hasNoProducts || !isProductManager) {
      setShowGeneratePrdModal(false);
    }
  }, [user, productsLoading, hasNoProducts, showPrivacyModal, isGuidelining, isProductManager, tutorialCompleted]);

  const handleCreateProductConfirm = () => {
    setShowGeneratePrdModal(false);
    resetAllProdCreation();
    router.push('/product-creation');
  };

  const handleCreateProductDecline = () => {
    setShowGeneratePrdModal(false);
  };

  useEffect(() => {
    if (chosenProduct?.id && !postProductCreation && !showAddVehiclesModal) {
      const wasProductJustCreated = localStorage.getItem('product_just_created');
      if (wasProductJustCreated === 'true') {
        setCreatedProductId(chosenProduct.id);
        const timer = setTimeout(() => {
          setShowAddVehiclesModal(true);
          localStorage.removeItem('product_just_created');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [postProductCreation, chosenProduct?.id, showAddVehiclesModal]);

  const positionList: GuideLineBlockInterface[] = [
    {
      styles: 'top-[74px] left-[60px]',
      buttonText: 'Next',
      title: 'Professor Wiser',
      text: "Learn more about the subject you're working on. Tip: Select items on the screen before clicking to get more specific information.",
    },
    {
      styles: 'left-[60px] bottom-[50px]',
      buttonText: 'Next',
      title: 'Messages',
      text: 'Have one on one conversations or create groups for quick and easy communication with your teammates.',
    },
    {
      styles: 'right-[56px] bottom-[45px]',
      buttonText: 'Next',
      title: 'Contextual AI Assist',
      text: 'This always-available button lets you start a context-aware conversation with Wegwiser anytime.',
    },
    {
      styles: 'top-[57px] right-[58px]',
      buttonText: 'Next',
      title: 'Notes',
      text: 'Add sticky notes for yourself or anyone you tag.',
    },
    {
      styles: 'bottom-[120px] left-1/2 translate-x-[-50%] w-[725px] h-[370px]',
      text: 'The tray lets you manage products and vehicles, switch workspaces (Product, Design, Engineering) and view your analytics.',
      buttonText: 'Done',
      title: 'The Tray',
    },
  ];


  return (
    <div className="max-h-[100vh]">
      {showPrivacyModal && (
        <PrivacyPolicyModal
          onAccept={handlePrivacyAccept}
          onDecline={handlePrivacyDecline}
        />
      )}
      {postProductCreation && <ProductIsCreated />}
      {simulationCreated && <SimulationCreatedModal />}
      {isGuidelining && (
        <div className="fixed inset-0 z-100 pointer-events-auto bg-[rgba(0,0,0,0.3)]">
          <GuideLineBlock
            amount={positionList.length}
            {...positionList[step - 1]}
          />
        </div>
      )}
      
      {showGeneratePrdModal && (
        <CreateProductModal
          isOpen={showGeneratePrdModal}
          onClose={handleCreateProductDecline}
          onConfirm={handleCreateProductConfirm}
        />
      )}

      {showAddVehiclesModal && createdProductId && (
        <AddVehiclesModal
          isOpen={showAddVehiclesModal}
          onClose={() => setShowAddVehiclesModal(false)}
          productId={createdProductId}
        />
      )}

      <div
        className={`${
          isFullScreen ? 'z-60 cursor-pointer bg-red-500' : 'opacity-100 z-0'
        }`}
      >
        <HelpButton />
      </div>
      <div className={`${isFullScreen ? 'z-60' : 'opacity-100 z-0'}`}>
        <NoteButton />
      </div>
      <div className={`${isFullScreen ? 'z-60' : 'opacity-100 z-0'}`}>
        <MessageButton />
      </div>
      <div className={`${isFullScreen ? 'z-60' : 'z-60'}`}>
        <AiButton />
      </div>

      {isShowAiWindow && (
        <div className="fixed z-100 right-20 top-5">
          <AIChat />
        </div>
      )}

      <div className={`absolute w-full h-full`}>
        <Design />
        <Engineering />
        <Product />
        <div className={`${isFullScreen ? 'z-60' : 'opacity-100 z-0'}`}>
          <MainSection />
        </div>
      </div>

      <div className="fixed inset-0 z-0">
        <VehicleCanvasWrapper />
      </div>

    </div>
  );
}
