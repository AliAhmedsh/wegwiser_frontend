import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FeaturesAccordion = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="border-b border-b-[#535354] pt-1 pb-2 px-1">
          <span className="font-opensans font-[400] text-[#535354] text-[14px]">
            Features
          </span>
        </AccordionTrigger>
        <AccordionContent className="mt-4 pl-2 pb-2">
          <p>Some interesting features of the file</p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default FeaturesAccordion;
