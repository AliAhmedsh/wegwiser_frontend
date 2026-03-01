// import React from 'react';
// import { TextFrame } from './TextFrame';
//
// export interface CanvasText {
//     id: string;
//     type: 'text';
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     value: string;
//     fontSize: number;
//     color: string;
// }
//
// interface TextLayerProps {
//     texts: CanvasText[];
//     setTexts: React.Dispatch<React.SetStateAction<CanvasText[]>>;
//     editingTextId: string | null;
//     setEditingTextId: (id: string | null) => void;
//     selectedId: string | null;
//     setSelectedId: (id: string | null) => void;
//     onEdit?: (textObj: CanvasText) => void;
// }
//
// export const TextLayer: React.FC<TextLayerProps> = ({ texts, setTexts, editingTextId, setEditingTextId, selectedId, setSelectedId, onEdit }) => {
//     return (
//         <>
//             {texts.map(text => (
//                 <TextFrame
//                     key={text.id}
//                     textObj={text}
//                     setTexts={setTexts}
//                     editing={editingTextId === text.id}
//                     setEditingTextId={setEditingTextId}
//                     selectedId={selectedId}
//                     setSelectedId={setSelectedId}
//                     onEdit={onEdit}
//                 />
//             ))}
//         </>
//     );
// };
