import ConfirmBtn from '@/shared/ui/confirmBtn';

const CapacityAlert = () => {
  return (
    <div className="absolute w-50 h-50 bg-white p-5">
      <h2 className="font-semibold font-poppins">Attention</h2>
      <span className="text-center text-[12px]">
        (Name) seems to be at full capacity. Would you like me to see if their
        current involvements can be altered and send a conditional invite?
      </span>
      <div className="w-full">
        <ConfirmBtn text="No" isWhite />
        <ConfirmBtn text="Yes" />
      </div>
    </div>
  );
};

export default CapacityAlert;
