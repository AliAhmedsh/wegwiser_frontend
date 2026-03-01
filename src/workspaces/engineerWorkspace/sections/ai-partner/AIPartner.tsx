import React from 'react';
import MicrophoneIcon from '@/shared/icons/MicrophoneIcon';
import PaperclipIcon from '@/shared/icons/PaperclipIcon';

interface AIPartnerProps {
    width?: number | string;
    height?: number | string;
    isResizing?: boolean;
    onResize?: (e: React.MouseEvent) => void;
    prompt: string;
    onPromptChange: (prompt: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    className?: string;
    style?: React.CSSProperties;
    text: string;
}

const AIPartner: React.FC<AIPartnerProps> = ({
    width,
    height,
    isResizing,
    onResize,
    prompt,
    onPromptChange,
    onSubmit,
    className = '',
    style = {},
    text
}) => {
    return (
        <>
            {onResize && (
                <div
                    onMouseDown={onResize}
                    className="w-1 cursor-ew-resize bg-white hover:bg-gray-500 transition"
                    style={{ zIndex: 10 }}
                />
            )}
            <div
            className={`bg-[#EAEDF2] mt-0.5 px-4 pt-1.5 h-full flex flex-col ${className}`}
            style={{
                width,
                height,
                minWidth: width ? undefined : 200,
                maxWidth: width ? undefined : 600,
                transition: isResizing ? 'none' : 'width 0.2s',
                borderTopLeftRadius: '0px',
                borderTopRightRadius: '16px',
                borderBottomRightRadius: '0px',
                borderBottomLeftRadius: '0px',
                ...style,
            }}
            >
            <div className="font-semibold text-sm mb-2 mt-2 ml-1.5">AI Partner</div>

            {text.includes("Would you like to generate code for the selected screen?") && (
              <div className="text-sm text-[#181818] ml-1.5 mr-0.5 font-normal mb-3 mt-1">
                  {text}
              </div>
            )}

            {text.includes("Select design file") ? (
              <div className="text-sm text-[#181818] ml-1.5 mr-0.5 font-normal mb-3 mt-1 overflow-y-auto max-h-[430px] custom-scrollbar">
                  {text}
              </div>
            ) : (
              <div className="flex-1"></div>
            )}

            <form
                className="flex flex-col gap-2 ml-1.5 mt-auto"
                onSubmit={onSubmit}
            >
                {text.includes("Looks like the highlighted code lines are showing an error") && (
                  <div className="text-sm text-[#181818] ml-1.5 mr-0.5 font-normal mb-2">
                      {text}
                  </div>
                )}
                <textarea
                className="pl-2 pt-2 w-full h-20 rounded-[8px_8px_10px_8px] border border-white bg-white p-1.5 text-sm font-normal resize-none"
                placeholder="Enter prompt"
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                    }
                }}
                />
                <div className="flex gap-2 mb-2 justify-end">
                    <MicrophoneIcon />
                    <PaperclipIcon />
                </div>
            </form>
            </div>

        </>
    );
};

export default AIPartner;
