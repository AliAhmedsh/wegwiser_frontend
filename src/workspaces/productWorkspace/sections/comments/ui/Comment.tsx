import DeleteIconWS from '@/assets/icons/DeleteIconWS.svg';

interface CommentProps {
  avatarUrl?: string;
  nickname: string;
  title: string;
  body: string;
  time: string;
  onDelete: () => void;
}

const Comment: React.FC<CommentProps> = ({
  nickname,
  title,
  body,
  time,
  onDelete,
}) => {
  return (
    <div
      className="w-full bg-white p-3 rounded-lg mb-4 font-opensans"
      style={{ border: '1px solid #5353544D' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>{' '}
          <div>
            <p className="font-[600] text-[14px] text-[#181818] capitalize">
              {nickname}
            </p>
            <p className="font-[400] text-[12px] text-[#7A7A7A] text-gray-500">
              {title}
            </p>
          </div>
        </div>
        <button onClick={onDelete} className="self-start">
          <DeleteIconWS className="w-5 h-5 transition-[color] duration-300 fill-current text-[#343330] hover:text-red-500" />
        </button>
      </div>

      <p className="font-[400] text-[12px] text-[#181818] mb-4">{body}</p>

      <div className="flex justify-end font-[400] text-[12px] text-[#535354] text-gray-500">
        <span>{time}</span>
      </div>
    </div>
  );
};

export default Comment;
