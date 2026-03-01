import { useModalWindowStore } from '@/store/modalWindowsStore';
import { Poppins, Open_Sans } from 'next/font/google';

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const openSans = Open_Sans({
  weight: ['400'],
  subsets: ['latin'],
});

// Utility function to show the simulation created modal
export const showSimulationCreatedModal = () => {
  const { setSimulationCreated } = useModalWindowStore.getState();
  setSimulationCreated(true);
};

export default function SimulationCreatedModal() {
  const { setSimulationCreated } = useModalWindowStore();

  const handleClose = () => {
    setSimulationCreated(false);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-110 transition-opacity duration-300"
    >
      <div className="inline-flex h-[190px]  w-[480px] px-[60px] py-[100px] justify-center items-center gap-[10px] flex-shrink-0 rounded-[12px] bg-white">
        <div className="text-center">
          <h2 className={`flex-1 self-stretch mb-5 text-[#151619] text-center text-[16px] font-semibold leading-[140%] ${poppins.className}`}>
            Simulation Created!
          </h2>
          <p className={`text-black text-center text-[12px] font-normal leading-normal ${openSans.className}`}>
            You can launch the vehicle after the UX manager and Engineering manager approves the simulation.
          </p>
        </div>
      </div>
    </div>
  );
}
