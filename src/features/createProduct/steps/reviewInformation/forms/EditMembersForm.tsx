import Image from 'next/image';
import { useCreationProductStore } from '@/features/createProduct/store';
import { Poppins } from 'next/font/google';

const poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export default function EditMemberForm() {
  const { members, removeMember } = useCreationProductStore();

  return (
    <div className="text-[14px]">
      <div
        className={`font-semibold font-poppins text-[16px] mt-2 ${poppins600.className}`}
      >
        3. Your team
      </div>
      <div className="min-h-[100px] mt-2 rounded-2xl text-[12px]">
        {members.map((item, index) => (
          <div
            className={`flex w-[90%] justify-between ${
              index === 0 ? '' : 'mt-1'
            } items-center p-2`}
            key={index}
          >
            <div className="w-1/4">{item.name}</div>
            <div className="w-1/3">{item.email}</div>
            <div className="flex justify-between items-center">
              <div className="w-[100px]">
                {item.position === 'PM' ? 'Product Manager' : 
                 item.position === 'Design' ? 'Designer' :
                 item.position === 'Engineer' ? 'Engineer/QA' :
                 item.position === 'Founder' ? 'Founder / CEO / CPO' : 'Product Manager'}
              </div>
              <div
                className="cursor-pointer hover:scale-90 transition-all duration-300 active:scale-80"
                onClick={() => removeMember(index)}
              >
                {(item.isOwner && (
                  <div className="opacity-0 w-5 h-5">s</div>
                )) || (
                  <Image
                    src={'icons/trash-can.svg'}
                    alt="delete"
                    width={20}
                    height={20}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
