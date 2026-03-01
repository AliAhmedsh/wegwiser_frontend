import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { useCreationVehicleStore } from '@/features/createVehicle/store';
import { useSaveProductRelationshipMutation } from '@/lib/api/hooks/useVehicle';

const parseMarkdown = (text: string) => {
  if (!text) return null;

  // Split by double newlines first, but also handle single newlines for headings
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paraText = currentParagraph.join(' ').trim();
      if (paraText) {
        elements.push(
          <p key={`para-${elements.length}`} className="mb-4 text-gray-700 leading-6">
            {parseInlineMarkdown(paraText)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      const listItems = currentList.map((item, itemIndex) => {
        // Remove list markers and clean up
        const cleanItem = item.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
        const content = parseInlineMarkdown(cleanItem);
        return (
          <li key={itemIndex} className="text-gray-700 mb-1.5 ml-4">
            {content}
          </li>
        );
      });
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc mb-4 space-y-1">
          {listItems}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Empty line - flush current blocks
    if (!trimmed) {
      flushList();
      flushParagraph();
      return;
    }

    // Heading detection
    if (trimmed.startsWith('#')) {
      flushList();
      flushParagraph();
      const match = trimmed.match(/^(#+)\s*(.+)$/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2].trim();
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
        const headingContent = parseInlineMarkdown(headingText);
        
        elements.push(
          <HeadingTag
            key={`heading-${elements.length}`}
            className={`font-semibold text-gray-900 mb-3 mt-4 first:mt-0 ${
              level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'
            }`}
          >
            {headingContent}
          </HeadingTag>
        );
      }
      return;
    }

    // List item detection (starts with *, -, or number)
    if (trimmed.match(/^[-*]\s/) || trimmed.match(/^\d+\.\s/)) {
      flushParagraph();
      currentList.push(trimmed);
      return;
    }

    // Regular paragraph text
    flushList();
    currentParagraph.push(trimmed);
  });

  // Flush any remaining content
  flushList();
  flushParagraph();

  return elements.length > 0 ? elements : null;
};

const parseInlineMarkdown = (text: string): (string | JSX.Element)[] => {
  if (!text) return [text];
  
  let keyCounter = 0;
  const parts: (string | JSX.Element)[] = [];
  
  const patterns = [
    { regex: /\*\*\*(.+?)\*\*\*/g, priority: 1, render: (content: string) => <strong key={`bold-italic-${keyCounter++}`} className="font-bold"><em>{content}</em></strong> },
    { regex: /\*\*(.+?)\*\*/g, priority: 2, render: (content: string) => <strong key={`bold-${keyCounter++}`} className="font-bold">{content}</strong> },
    { regex: /"([^"]+)"/g, priority: 2, render: (content: string) => <strong key={`quoted-double-${keyCounter++}`} className="font-bold">{content}</strong> },
    { regex: /'([^']+)'/g, priority: 2, render: (content: string) => <strong key={`quoted-single-${keyCounter++}`} className="font-bold">{content}</strong> },
    { regex: /`(.+?)`/g, priority: 3, render: (content: string) => <code key={`code-${keyCounter++}`} className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{content}</code> },
    { regex: /\*(.+?)\*/g, priority: 4, render: (content: string) => <em key={`italic-${keyCounter++}`} className="italic">{content}</em> },
  ];

  const matches: Array<{ start: number; end: number; priority: number; render: () => JSX.Element }> = [];

  patterns.forEach(pattern => {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      const content = match[1];
      
      let isOverlapping = false;
      for (const existingMatch of matches) {
        if ((start >= existingMatch.start && start < existingMatch.end) ||
            (end > existingMatch.start && end <= existingMatch.end) ||
            (start <= existingMatch.start && end >= existingMatch.end)) {
          if (pattern.priority < existingMatch.priority) {
            isOverlapping = true;
            break;
          }
        }
      }
      
      if (!isOverlapping) {
        matches.push({
          start,
          end,
          priority: pattern.priority,
          render: () => pattern.render(content)
        });
      }
    }
  });

  matches.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return a.priority - b.priority;
  });

  const nonOverlappingMatches = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      nonOverlappingMatches.push(match);
      lastEnd = match.end;
    }
  }

  let lastIndex = 0;
  nonOverlappingMatches.forEach(match => {
    if (match.start > lastIndex) {
      parts.push(text.substring(lastIndex, match.start));
    }
    parts.push(match.render());
    lastIndex = match.end;
  });

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function ChatForm() {
  const { vehicleId, productRelationship, setProductRelationship, assumptionsText, setAssumptionsText, assumptionConversationId, setAssumptionConversationId, setAssumptionConversationStatus } = useCreationVehicleStore();
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState(''); // Always start empty - lower box is only for user input
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef('');
  const saveProductRelationshipMutation = useSaveProductRelationshipMutation();

  // Don't auto-populate message from productRelationship - lower box is only for user input
  
  const handleMessageChange = (value: string) => {
    setMessage(value);
    // Don't update productRelationship here - it will be updated from API response
  };

  const handleAssumptionConversation = async (userMessage: string) => {
    if (!assumptionsText) {
      return; // No assumption text available, skip API call
    }

    // Clear the input field immediately (lower box should only show user input, not response)
    setMessage('');
    setProductRelationship('');

    try {
      const { fastApiService } = await import('@/lib/api/services/fastApiService');
      
      const requestData: {
        conversation_id?: string;
        assumption_text?: string;
        user_message: string;
      } = {
        user_message: userMessage,
      };

      // First turn: need assumption_text
      if (!assumptionConversationId && assumptionsText) {
        requestData.assumption_text = assumptionsText;
      } else if (assumptionConversationId) {
        // Subsequent turns: use conversation_id
        requestData.conversation_id = assumptionConversationId;
      } else {
        return; // No assumption text and no conversation_id
      }

      const response = await fastApiService.vehicleAssumptionConversation(requestData);

      console.log('[ChatForm] API Response received:', {
        has_revised_assumption: !!response.revised_assumption,
        status: response.status,
        conversation_id: response.conversation_id,
      });

      // Update assumptions text with revised version - this will REPLACE old content in UPPER box
      // Upper box shows API response, lower box is only for user input
      if (response.revised_assumption) {
        setAssumptionsText(response.revised_assumption); // This updates upper box
        // Scroll to top when content updates
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }

      // Store conversation_id and status for next turn
      if (response.conversation_id) {
        setAssumptionConversationId(response.conversation_id);
      }
      setAssumptionConversationStatus(response.status);

      // If status is COMPLETE, update productRelationship
      // Note: If status is already COMPLETE, we don't need to call /complete endpoint
      // The conversation is already completed on server side
      if (response.status === 'COMPLETE') {
        setProductRelationship(response.revised_assumption);
        console.log('[ChatForm] Status is COMPLETE - conversation already completed on server, no need to call /complete endpoint');
      }

    } catch (error: any) {
      console.error('[ChatForm] Error in assumption conversation:', error);
      if (error.response?.status === 400) {
        setAssumptionConversationId(null);
      }
    }
  }; 

  const startRecording = () => {
    const SpeechRecognitionClass =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  
    if (!SpeechRecognitionClass) {
      alert('Speech recognition is not supported in this browser.');
    return;
  }
  
  const recognition = new SpeechRecognitionClass();
  
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = transcriptRef.current; 
    
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        }
      }
    
      transcriptRef.current = finalTranscript; 
      setMessage(finalTranscript.trim());
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setMessage(transcriptRef.current.trim());
  };

  return (
    <div
      style={{ boxShadow: '0px 0px 4px 0px #00000026 inset' }}
      className="h-[100%] max-xl:w-[67%] w-[72%] border border-[rgba(0,0,0,0.1)] shadow-xl rounded-2xl p-5 flex flex-col justify-between"
    >
      <div 
        ref={scrollContainerRef}
        className="h-[75%] w-full overflow-y-auto p-4" 
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}
      >
        {assumptionsText && assumptionsText.trim() ? (
          <div key={assumptionsText} className="text-sm text-gray-800 leading-relaxed">
            {(() => {
              console.log('[ChatForm] Rendering assumptionsText:', {
                length: assumptionsText.length,
                preview: assumptionsText.substring(0, 200),
                hasNewlines: assumptionsText.includes('\n'),
              });
              return parseMarkdown(assumptionsText);
            })()}
          </div>
        ) : (
          <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-6 w-full bg-gradient-to-r from-[#2086FE] to-[#AB55DC] rounded-[4px] opacity-20"
          />
        ))}
          </div>
        )}
      </div>

      <div className="pt-4">
        <div className="flex items-center border border-[rgba(0,0,0,0.1)] rounded-2xl px-4 py-2 w-full">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (message.trim() && assumptionsText) {
                  handleAssumptionConversation(message.trim());
                }
              }
            }}
            className="w-full resize-none outline-none bg-transparent placeholder:text-gray-500 text-sm"
            placeholder="Your response"
          />
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            className={`ml-2 mt-10 cursor-pointer transition-all duration-300 ${
              isRecording
                ? 'text-red-500 scale-90'
                : 'text-gray-600 hover:scale-90 active:scale-80'
            }`}
          >
            <Image
              src={'/icons/micro.svg'}
              alt="voice enter"
              width={15}
              height={15}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
