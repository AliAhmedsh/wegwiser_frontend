// import MicrophoneIcon from '@/shared/icons/MicrophoneIcon';
// import PaperclipIcon from '@/shared/icons/PaperclipIcon';
// import React, { useState, useRef, useEffect } from 'react';
// import { AIMsg, AIMessages } from '../types/designWorkspaceTypes';
//
// interface Props {
//     messages: AIMsg[];
//     onOptionClick?: (option: string) => void;
//     setAIMessages?: React.Dispatch<React.SetStateAction<AIMessages>>;
// }
//
// export default function AIPartnerSidebar({ messages, onOptionClick, setAIMessages }: Props) {
//     const [input, setInput] = useState('');
//     const messagesEndRef = useRef<HTMLDivElement | null>(null);
//
//     useEffect(() => {
//         if (messagesEndRef.current) {
//             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [messages]);
//
//     const handleSend = (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!input.trim() || !setAIMessages) return;
//         setAIMessages(prev => [
//             ...prev,
//             { id: Date.now().toString(), kind: 'text', text: input.trim() },
//         ]);
//         setInput('');
//     };
//
//     return (
//         <div className="w-72 h-full flex flex-col rounded-xl p-2">
//             <div className="bg-[#EAEDF2] h-full border-white rounded-xl text-sm text-black flex flex-col"
//                 style={{
//                     boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
//                 }}
//             >
//                 <div className="p-4 border-b border-[#E8E8E8] font-semibold text-sm">AI Partner</div>
//                 <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
//                     {messages.map((msg) => (
//                         <div key={msg.id}>
//                             {msg.kind === 'text' && msg.specialId === 'ai-question' ? (
//                                 <div className="relative bg-white rounded-xl p-3 self-end max-w-[90%]">
//                                     <p className='relative z-20 text-xs font-normal'>{msg.text}</p>
//                                     <div className='absolute z-10 -bottom-2 -right-2 w-6 h-6 rounded-full bg-white'></div>
//                                 </div>
//                             ) : msg.kind === 'text' && msg.specialId === 'ai-info' ? (
//                                 <div className="font-normal text-xs max-w-[95%]" dangerouslySetInnerHTML={{ __html: msg.text }} />
//                             ) : msg.kind === 'text' ? (
//                                 <div className="relative bg-white rounded-xl p-3 self-end max-w-[90%] shadow mt-2">
//                                     <p className='relative z-20 text-xs font-normal whitespace-pre-line'>{msg.text}</p>
//                                     <div className='absolute z-10 -bottom-2 -right-2 w-6 h-6 rounded-full bg-white'></div>
//                                 </div>
//                             ) : null}
//                             {msg.kind === 'options' && (
//                                 <div className='border-b-1'>
//                                     <div className="font-normal text-sm mb-4 whitespace-pre-line">{msg.text}</div>
//                                     <div className="flex flex-col gap-4">
//                                         {msg.options.map(option => (
//                                             <button
//                                                 key={option}
//                                                 className="w-max bg-[#627899] text-white rounded-sm p-2 text-xs font-normal text-left hover:bg-[#4a5a6a] transition"
//                                                 onClick={() => onOptionClick && onOptionClick(option)}
//                                             >
//                                                 {option}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                 </div>
//                 <form className="flex flex-col items-end gap-3 mt-auto p-2" onSubmit={handleSend}>
//                     <textarea
//                         rows={4}
//                         className="w-full rounded-xl border border-[#E8E8E8] px-4 py-2 text-sm mt-4 bg-white"
//                         placeholder="Help me create a style guide from these reference screens"
//                         value={input}
//                         onChange={e => setInput(e.target.value)}
//                     />
//                     <div className='flex gap-2'>
//                         <MicrophoneIcon />
//                         <PaperclipIcon />
//                         <button type="submit" className="p-1 bg-[#627899] text-xs font-semibold rounded-full hover:bg-[#4a5a6a] flex items-center justify-center text-white">Send</button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }
