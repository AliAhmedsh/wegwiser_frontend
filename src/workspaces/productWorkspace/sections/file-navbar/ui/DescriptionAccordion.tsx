import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const DescriptionAccordion = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="border-b border-b-[#535354] pt-1 pb-2 px-1">
          <span className="font-opensans font-[400] text-[#535354] text-[14px]">
            Description
          </span>
        </AccordionTrigger>
        <AccordionContent className="mt-4 pl-2 pb-2">
          <p>
            Some long description of the file. This file is about something very
            crucial.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DescriptionAccordion;
