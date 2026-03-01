import { Open_Sans } from 'next/font/google';

interface TabHeaderProps {
  label: string;
  lastUpdated: string;
  onEdit?: () => void;
  showEdit?: boolean;
  editDisabled?: boolean;
}

const openSans600 = Open_Sans({
  weight: ['600'],
  subsets: ['cyrillic'],
});

const TabHeader: React.FC<TabHeaderProps> = ({
  label,
  lastUpdated,
  onEdit,
  showEdit = false,
  editDisabled = false,
}) => {
  return (
    <div className="flex justify-between items-center py-2 border-b border-black font-sans bg-[#EAEDF2]">
      <h3
        className={`text-[14px] font-semibold text-gray-800 ${openSans600.className}`}
      >
        {label}
      </h3>

      <div className="flex items-center space-x-4 text-[12px] ">
        <span className="text-blue-500">Last updated {lastUpdated}</span>
        {showEdit && onEdit && (
          <button
            onClick={onEdit}
            disabled={editDisabled}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              editDisabled 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-gray-700 hover:text-gray-900 cursor-pointer'
            }`}
            title={editDisabled ? "Select a task to edit" : "Edit selected task"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M14.0481 3.20199L11.7981 0.951992C11.719 0.872989 11.6118 0.828613 11.5 0.828613C11.3882 0.828613 11.281 0.872989 11.2019 0.951992L4.45188 7.70199C4.37274 7.78103 4.32822 7.88827 4.32812 8.00012V10.2501C4.32812 10.362 4.37257 10.4693 4.45169 10.5484C4.53081 10.6275 4.63811 10.672 4.75 10.672H7C7.11185 10.6719 7.21908 10.6274 7.29813 10.5482L14.0481 3.79824C14.1271 3.71914 14.1715 3.61191 14.1715 3.50012C14.1715 3.38832 14.1271 3.28109 14.0481 3.20199ZM6.82492 9.82824H5.17188V8.1752L9.8125 3.53457L11.4655 5.18762L6.82492 9.82824ZM12.0625 4.59066L10.4095 2.93762L11.5 1.84707L13.153 3.50012L12.0625 4.59066ZM13.6094 7.43762V13.6251C13.6094 13.8862 13.5057 14.1366 13.3211 14.3212C13.1365 14.5058 12.8861 14.6095 12.625 14.6095H1.375C1.11393 14.6095 0.863548 14.5058 0.678942 14.3212C0.494336 14.1366 0.390625 13.8862 0.390625 13.6251V2.37512C0.390625 2.11404 0.494336 1.86366 0.678942 1.67906C0.863548 1.49445 1.11393 1.39074 1.375 1.39074H7.5625C7.67439 1.39074 7.78169 1.43519 7.86081 1.51431C7.93993 1.59342 7.98438 1.70073 7.98438 1.81262C7.98438 1.92451 7.93993 2.03181 7.86081 2.11093C7.78169 2.19004 7.67439 2.23449 7.5625 2.23449H1.375C1.3377 2.23449 1.30194 2.24931 1.27556 2.27568C1.24919 2.30205 1.23438 2.33782 1.23438 2.37512V13.6251C1.23438 13.6624 1.24919 13.6982 1.27556 13.7246C1.30194 13.7509 1.3377 13.7657 1.375 13.7657H12.625C12.6623 13.7657 12.6981 13.7509 12.7244 13.7246C12.7508 13.6982 12.7656 13.6624 12.7656 13.6251V7.43762C12.7656 7.32573 12.8101 7.21842 12.8892 7.13931C12.9683 7.06019 13.0756 7.01574 13.1875 7.01574C13.2994 7.01574 13.4067 7.06019 13.4858 7.13931C13.5649 7.21842 13.6094 7.32573 13.6094 7.43762Z" fill="#343330"/>
            </svg>
            <span>Edit</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default TabHeader;
