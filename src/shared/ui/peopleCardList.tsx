import Image from 'next/image';

export interface PeopleCardListProps {
  id: string;
  image: string;
  shortName: string;
  isProduct?: true;
}

const PeopleCardList: React.FC<PeopleCardListProps> = ({
  id,
  image,
  shortName,
  isProduct,
}) => {
  const imageSrc = image && image.trim() !== '' ? image : '/Ellipse 5.svg';
  
  return (
    <div key={id} className="relative z-0">
      <div className="flex justify-center">
        <Image
          width={isProduct ? 48 : 28}
          height={isProduct ? 48 : 28}
          className="rounded-full bg-[#D9D9D9] object-cover z-0"
          src={imageSrc}
          alt="avatar picture"
        />
      </div>
      <div className="ml-0.75 mt-0.5F text-[14px]/[2] font-normal text-black text-center">{shortName}</div>
    </div>
  );
};

export default PeopleCardList;
