import { Open_Sans } from 'next/font/google';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const OpenSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['latin'],
});

interface MessageInputProps {
  onSendMessage: (message: string, files?: File[]) => void;
  disabled?: boolean;
  noProductSelected?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled = false, noProductSelected = false }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [micPermissionError, setMicPermissionError] = useState<string>('');
  const [showMicTooltip, setShowMicTooltip] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    setMicPermissionError('');

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onstart = () => {
          setIsRecording(true);
        };

        recognitionInstance.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (finalTranscript && !finalTranscript.includes('Microphone access denied') && !finalTranscript.includes('not-allowed')) {
            setInput(prev => prev + finalTranscript);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            setMicPermissionError('Microphone access denied. Please allow microphone access in your browser settings.');
            setShowMicTooltip(true);
            setTimeout(() => setShowMicTooltip(false), 3000);
          } else if (event.error === 'no-speech') {
            setMicPermissionError('No speech detected. Please try again.');
            setShowMicTooltip(true);
            setTimeout(() => setShowMicTooltip(false), 3000);
          } else {
            setMicPermissionError(`Speech recognition error: ${event.error}`);
            setShowMicTooltip(true);
            setTimeout(() => setShowMicTooltip(false), 3000);
          }
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const startRecording = async () => {
    if (recognition && !isRecording) {
      setMicPermissionError('');
      setShowMicTooltip(false);

      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }

      try {
        if (recognition.readyState === 1) {
          return;
        }
        recognition.start();
      } catch (error) {
        setIsRecording(false);
        if (error.message.includes('not-allowed') || error.message.includes('denied')) {
          setMicPermissionError('Failed to start recording. Please check microphone permissions.');
          setShowMicTooltip(true);
          setTimeout(() => setShowMicTooltip(false), 3000);
        }
      }
    }
  };

  const stopRecording = () => {
    if (recognition) {
      setIsRecording(false);
      try {
        recognition.stop();
      } catch (error) {
        try {
          recognition.abort();
        } catch (abortError) {
        }
      }
      setTimeout(() => {
        if (recognition) {
          try {
            recognition.abort();
          } catch (error) {
          }
        }
      }, 50);
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) =>
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));

  const requestMicrophonePermission = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermissionError('');
        setShowMicTooltip(false);
        return true;
      } else {
        setMicPermissionError('Microphone access not supported in this browser.');
        setShowMicTooltip(true);
        setTimeout(() => setShowMicTooltip(false), 3000);
        return false;
      }
    } catch (error) {
      setMicPermissionError('Microphone access denied. Please allow microphone access in your browser settings.');
      setShowMicTooltip(true);
      setTimeout(() => setShowMicTooltip(false), 3000);
      return false;
    }
  };

  const handleSend = () => {
    if ((input.trim() || attachedFiles.length > 0) && !disabled) {
      const messageToSend = input.trim();

      if (messageToSend && !messageToSend.includes('Microphone access denied') && !messageToSend.includes('not-allowed')) {
        onSendMessage(messageToSend, attachedFiles);
      } else if (attachedFiles.length > 0) {
        onSendMessage('', attachedFiles);
      }

      setInput('');
      setAttachedFiles([]);

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      handleSend();
    }
  };

  return (
    <div
      className="bg-[#E8EBF0] w-full mb-3 rounded-b-[10px]"
      onClick={(e) => {
        e.stopPropagation();
        if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
        if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
          e.nativeEvent.stopImmediatePropagation();
        }
      }}
    >
      <div className="flex w-full items-center  bg-[#E8EBF0] pl-2 pr-5 rounded-b-3xl">
        <input
          type="text"
          placeholder={
            noProductSelected
              ? "Please select a product to start messaging..."
              : disabled
                ? "Select a conversation to start messaging..."
                : "Type your message here..."
          }
          className={`px-4 py-2 w-full bg-white border max-h-[36px] border-[#F3F5F6] rounded-xl focus:outline-none focus:ring-2 text-[14px] focus:ring-blue-500 ${OpenSans400.className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onClick={(e) => {
            e.stopPropagation();
            if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
          onMouseUp={(e) => {
            e.stopPropagation();
            if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
              e.nativeEvent.stopImmediatePropagation();
            }
          }}
          disabled={disabled}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSend();
          }}
          type="button"
          disabled={disabled}
          className={`text-black mb-2 ml-2 mt-2 rounded-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}

        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
            pointerEvents="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
      </div>
      {attachedFiles.length > 0 && (
        <div className="px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-sm">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={disabled}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      <div
        className="flex justify-end w-[87%] mx-auto py-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation();
          }
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation();
          }
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation();
          }
        }}
      >
        <span className="flex gap-x-3">
          <div className="relative">
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === 'function') {
                  e.nativeEvent.stopImmediatePropagation();
                }

                if (isProcessing) return;

                setIsProcessing(true);
                try {
                  if (isRecording) {
                    stopRecording();
                  } else {
                    await startRecording();
                  }
                } finally {
                  setTimeout(() => setIsProcessing(false), 500);
                }
              }}
              disabled={disabled || isProcessing}
              className={`cursor-pointer select-none hover:scale-95 active:scale-90 ${isRecording ? 'animate-pulse' : ''} ${(disabled || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Image
                src={'/icons/mic.svg'}
                alt="mic"
                width={18}
                height={18}
                className={isRecording ? 'filter invert-27 sepia-51 saturate-2878 hue-rotate-346 brightness-104 contrast-97' : ''}
              />
            </button>
            {showMicTooltip && micPermissionError && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
                {micPermissionError}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600"></div>
              </div>
            )}
          </div>
          <label
            className={`cursor-pointer select-none hover:scale-95 active:scale-90 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <input
              type="file"
              multiple
              onChange={handleFileAttachment}
              className="hidden"
              disabled={disabled}
              accept="*/*"
            />
            <Image
              src={'/icons/littlePin.svg'}
              alt="pin"
              width={18}
              height={18}
            />
          </label>
        </span>
      </div>
    </div>
  );
};

export default MessageInput;
