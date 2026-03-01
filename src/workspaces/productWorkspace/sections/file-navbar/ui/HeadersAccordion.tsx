import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import HierarhyHeader from './HierarhyHeader';

const HeadersAccordion = () => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger className="border-b border-b-[#535354] pt-1 pb-2 px-1">
          <span className="font-opensans font-[400] text-[#535354] text-[14px]">
            SWOT Analysis
          </span>
        </AccordionTrigger>
        <AccordionContent className="mt-4 pl-2 pb-2">
          <div className="flex flex-col gap-2">
            <HierarhyHeader text="Title1" level={1} />
            <HierarhyHeader text="Title2" level={2} />
            <HierarhyHeader text="Title3" level={3} />
            <HierarhyHeader text="Title2" level={2} />
            <HierarhyHeader text="Title2" level={2} />
            <HierarhyHeader text="Title1" level={1} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default HeadersAccordion;
