import { AIMessages } from '@/workspaces/designWorkspace/types';

export const initialAIMessages: AIMessages = [
  {
    id: '0',
    kind: 'text',
    specialId: 'ai-question',
    text: 'What are the standard body and heading sizes in mobile UI design?',
  },
  {
    id: '1',
    kind: 'text',
    specialId: 'ai-info',
    text: `<div class='font-normal text-xs'>
            <div class='font-semibold mb-2'>Text Sizes (iOS & Android Guidelines)</div>
            <div class='mb-2'>
                <div class='font-semibold'>Body Text (Primary content)</div>
                <ul class='list-disc pl-5 text-sm'>
                    <li>16pt / sp (standard readable size)</li>
                    <li>Accessible and comfortable for most users.</li>
                </ul>
            </div>
            <div class='font-semibold mt-3'>Headings</div>
            <ul class='list-disc pl-5 text-sm'>
                <li>H1: 24–32pt / sp</li>
                <li>H2: 20–24pt / sp</li>
                <li>H3: 18–20pt / sp</li>
            </ul>
        </div>`
  },
];
