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
                className={`bg-[#F5F6FA] px-4 pt-1.5 h-full mt-1 ${className}`}
                style={{
                    width,
                    height,
                    minWidth: width ? undefined : 200,
                    maxWidth: width ? undefined : 600,
                    transition: isResizing ? 'none' : 'width 0.2s',
                    ...style,
                }}
            >
                <div className="font-semibold text-sm mb-2">AI Partner</div>
                <div className="flex flex-col justify-between h-[calc(100%-100px)]">
                    <div className="flex flex-col font-normal text-sm text-[#181818] overflow-auto mb-4">
                        Looks like the highlighted code lines are showing an error. Wegwiser has
                        generated a correction. Choose from the options of what to do?
                    </div>
                    <form
                        className="flex items-end flex-col gap-2 bg-[#F5F6FA]"
                        onSubmit={onSubmit}
                    >
                        <textarea
                            className="w-full font-normal text-sm bg-white rounded-lg p-1.5"
                            placeholder="Enter prompt"
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <MicrophoneIcon />
                            <PaperclipIcon />
                            <button
                                type="submit"
                                className="p-1 bg-[#627899] text-xs font-semibold rounded-full hover:bg-[#4a5a6a] flex items-center justify-center text-white"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AIPartner; 