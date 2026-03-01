import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/workspaces/designWorkspace/components/ui/accordion';

interface Props {
    header: string;
    ContentComponent: React.ReactNode;
}

const AccordionPropItem: React.FC<Props> = ({header, ContentComponent}) => {
  return (
    <AccordionItem className={'px-3'} value={header}>
      <AccordionTrigger>{header}</AccordionTrigger>
      <AccordionContent>
        {ContentComponent}
      </AccordionContent>
    </AccordionItem>
  );
};

export default AccordionPropItem;
