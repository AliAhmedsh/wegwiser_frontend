import React from 'react';
// import PeopleCard from '@/shared/ui/peopleCard';
import SearchIcon from '@/shared/icons/SearchIcon';

// const MOCK_PEOPLE = [
//     { id: 1, name: 'Name', role: 'Engineer' },
//     { id: 2, name: 'Name', role: 'Engineer' },
//     { id: 3, name: 'Name', role: 'Engineer' },
// ];

const PeoplePanel: React.FC = () => (
  <div className="flex flex-col gap-4 h-full w-full">
    <div className="relative h-9 w-full">
      <input
        type="text"
        className="text-sm h-full w-full border border-gray-400 rounded-md p-1 pr-10"
      />
      <div className="absolute top-[25%] right-4 text-gray-500 pointer-events-none">
        <SearchIcon width={18} />
      </div>
    </div>
    <div className="flex flex-col items-center gap-2 max-h-2/5 overflow-hidden overflow-y-scroll">
      {/* {MOCK_PEOPLE.map(person => (
                <PeopleCard key={person.id} name={person.name} role={person.role} />
            ))}
            {MOCK_PEOPLE.map(person => (
                <PeopleCard key={person.id} name={person.name} role={person.role} />
            ))} */}
    </div>
    <div className="flex flex-col gap-25">
      <div className="py-2 border-t border-[#E8E8E8]">
        <p className="text-xs font-normal">Comments</p>
      </div>
      <div className="py-2 border-t-1 border-[#E8E8E8]">
        <p className="text-xs font-normal">Code Activity </p>
      </div>
    </div>
  </div>
);

export default PeoplePanel;
