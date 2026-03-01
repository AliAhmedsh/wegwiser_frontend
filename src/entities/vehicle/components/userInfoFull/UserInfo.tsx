import { WorkerListProps } from '@/entities/worker/type';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import Image from 'next/image';
import { Dispatch, SetStateAction } from 'react';

const UserInfo: React.FC<{
  setIsShowUser: Dispatch<SetStateAction<boolean>>;
  workerData: WorkerListProps;
  vehicleName: string;
}> = ({ setIsShowUser, workerData, vehicleName }) => {
  return (
    <>
      <span
        className="cursor-pointer hover:underline strong text-xl"
        onClick={() => setIsShowUser(false)}
      >
        {vehicleName} {'<'} {workerData?.name}.
      </span>
      <div className="min-h-[500px] w-full border rounded-[16px] border-[rgba(0,0,0,0.3)] mt-1">
        <Image
          src={'/Ellipse 5.svg'}
          alt="image"
          width={110}
          height={110}
          className="rounded-full mx-auto border-2 border-white mt-5"
        />

        <div className="text-[12px] text-[#737373] px-5">
          <div className="flex justify-between items-center mt-5">
            <div className="text-[24px] font-bold text-black">
              {workerData.name}
            </div>

            <div
              style={{
                background: 'linear-gradient(to right, #4a6bff, #8a2be2)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
                fontSize: '12px',
                display: 'inline-block',
              }}
            >
              {workerData.accuratePosition}
            </div>
          </div>
          <div className="flex justify-between items-center mt-5">
            <div>Status</div>
            <div>{workerData.status}</div>
          </div>
          <div className="flex justify-between items-center mt-1.5">
            <div>Time zone</div>
            <div>{workerData.timeZone}</div>
          </div>
          <div>
            <div className="text-black mt-5 ">About</div>
            <div className="flex justify-between items-center mt-1.5">
              <div>In Progress Products</div>
              <div>{workerData.productInProgress}</div>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <div>In progress vehicles</div>
              <div>{workerData.vehicleInProgress}</div>
            </div>
          </div>
          <div className="mt-5">
            <div className="text-black">Contact information</div>
            <div className="flex justify-between items-center mt-1.5">
              <div>Number</div>
              <div>{workerData.phoneNumber}</div>
            </div>
            <div className="flex justify-between items-center mt-1.5">
              <div>email</div>
              <div>{workerData.email}</div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-8 px-5">
          <div className="w-[45%]">
            <ConfirmBtn text="Send Message" />
          </div>
          <div className="w-[45%]">
            <ConfirmBtn text="Add task" />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserInfo;
