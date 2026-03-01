import Image from 'next/image';
import { TestingGroup } from '../model';

export default function TestingGroupCard({
  group,
  onClick,
}: {
  group: TestingGroup;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-[#EAEDF2] rounded-2xl p-4 shadow flex flex-col justify-between min-h-[161px] flex-grow min-w-[240px] max-w-[460px] basis-[48%] relative cursor-pointer hover:shadow-lg transition"
      style={{
        boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
      }}
      onClick={onClick}
    >
      <div>
        <div className="font-semibold text-base mb-4 text-gray-900 flex items-center justify-between">
          {group.title}
          <Image
            src={'/icons/testCardArrow.svg'}
            alt="icon"
            height={18}
            width={18}
          />
        </div>
        <ul className="text-sm text-gray-800 list-disc pl-5">
          {group.tests.map((test) => (
            <li key={test.id} className="mb-1">
              {test.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
