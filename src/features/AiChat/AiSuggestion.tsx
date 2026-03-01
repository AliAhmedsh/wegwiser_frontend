import useAiStore from '@/store/AiStore';

const AiSuggestion: React.FC<{
  suggestion: string;
  setQueryMessage: (message: string) => void;
}> = ({ suggestion, setQueryMessage }) => {
  const { isLoading } = useAiStore();

  const onClickSuggestion = () => {
    if (isLoading) return;
    if (typeof setQueryMessage === 'function') {
      setQueryMessage(suggestion);
    } else {
      console.error('setQueryMessage is not a function:', typeof setQueryMessage);
    }
  };

  return (
    <div
      onClick={onClickSuggestion}
      className={`inline-block p-2 mt-2 active:scale-90 select-none cursor-pointer transition-all text-[12px] border-2 border-[#627899] mr-2 rounded-[12px] hover:scale-95 hover:active-90 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
      {suggestion}
    </div>
  );
};

export default AiSuggestion;
