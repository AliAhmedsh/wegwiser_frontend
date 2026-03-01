// import React from 'react';
//
// interface RevisionsModalProps {
//     open: boolean;
//     onClose: () => void;
// }
//
// export default function RevisionsModal({ open, onClose }: RevisionsModalProps) {
//     if (!open) return null;
//
//     return (
//         <div
//             className="fixed inset-0 z-50 flex items-center justify-center"
//             onClick={onClose}
//         >
//             <div
//                 className="bg-white rounded-2xl shadow-xl border border-gray-300 px-12 py-6 max-w-[320px]"
//                 onClick={e => e.stopPropagation()}
//             >
//                 <h2 className="text-sm font-semibold text-center mb-4">Revisions</h2>
//                 <p className="text-xs font-normal text-center mb-4">
//                     Looks like some revisions have been made since you last viewed the file.
//                 </p>
//                 <ul className="list-disc pl-6 text-xs font-normal text-left">
//                     <li>Updated navbar</li>
//                     <li>UI implementation on screen 2</li>
//                     <li>Header size updated</li>
//                 </ul>
//             </div>
//         </div>
//     );
// }
