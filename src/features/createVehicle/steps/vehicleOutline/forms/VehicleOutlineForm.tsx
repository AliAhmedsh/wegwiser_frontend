'use client';

import Image from 'next/image';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRef } from 'react';
import { useCreationVehicleStore } from '@/features/createVehicle/store';
import { Poppins } from 'next/font/google';

const poppins400 = Poppins({
  weight: ['400'],
  subsets: ['latin'],
});

export default function VehicleOutlineForm() {
  const { setDate, date, estimatedCompletionDate, setEstimatedCompletionDate, featureTags, setFeatureTags, involvedTeam, setInvolvedTeam, successMetrics, setSuccessMetrics, priority, setPriority } = useCreationVehicleStore();
  const currentDate = useRef<Date>(new Date());

  return (
    <form
      className={`flex h-full flex-col flex-grow overflow-auto w-full max-w-2xl text-[14px] pr-5 text-[#535354] space-y-8 font-light ${poppins400.className}`}
    >
      <div className="flex items-center gap-6 mt-10">
        <label className="min-w-[120px] shrink-0 text-[#535354] font-poppins text-[16px] font-normal leading-[200%]">Feature Tags</label>
        <input
          value={featureTags}
          onChange={(e) => setFeatureTags(e.target.value)}
          type="text"
          className="flex-1 border-b border-gray-300 max-w-[350px] bg-transparent outline-none pl-1"
        />
      </div>

      <div className="flex items-center">
        <div className="flex">
          <label className="min-w-[145px] shrink-0 text-[#535354] font-poppins text-[16px] font-normal leading-[200%]">Start date</label>
          <div className="flex items-center gap-2 min-w-[125px]">
            <div className="border-b h-[32px] min-w-[100px] flex items-center pl-1">
              {date ? date.toLocaleDateString('en-GB') : ''}
            </div>
            <Popover>
              <PopoverTrigger className="ml-2">
                <Image
                  src="/icons/choice-date.svg"
                  alt="calendar"
                  width={26}
                  height={26}
                  className="cursor-pointer"
                />
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="z-50">
                <Calendar
                  required
                  mode="single"
                  selected={date ? date : undefined}
                  onSelect={setDate}
                  disabled={(d) => currentDate.current > d}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-11 flex-1">
          <label className="shrink-0 text-[#535354] font-poppins text-[16px] font-normal leading-[200%]">Priority</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="flex-1 max-w-[90px] bg-transparent border-0 border-b border-gray-300 rounded-none shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 hover:border-[#627899] transition-all duration-200 cursor-pointer h-8 pl-1 pr-0 py-0 data-[state=open]:border-[#627899] gap-0 justify-between">
              <SelectValue placeholder="Standard" className="text-[#535354] font-poppins text-[14px] font-normal" />
            </SelectTrigger>
            <SelectContent 
              className="bg-white border border-gray-200 shadow-lg rounded-md min-w-[80px] p-1 z-[9999]" 
              position="popper"
              side="bottom" 
              align="start"
              sideOffset={5}
            >
              <SelectItem 
                value="standard" 
                className="text-[#535354] hover:bg-gray-200 focus:bg-gray-200 data-[highlighted]:bg-gray-200 data-[state=checked]:bg-[#627899] hover:text-[#535354] focus:text-[#535354] data-[highlighted]:text-[#535354] data-[state=checked]:text-white transition-colors duration-150 cursor-pointer py-2 px-3 text-[12px] font-normal rounded-[6px] relative"
                style={{ fontFamily: '"Open Sans"', fontStyle: 'normal' }}
              >
                Standard
              </SelectItem>
              <SelectItem 
                value="asap" 
                className="text-[#535354] hover:bg-gray-200 focus:bg-gray-200 data-[highlighted]:bg-gray-200 data-[state=checked]:bg-[#627899] hover:text-[#535354] focus:text-[#535354] data-[highlighted]:text-[#535354] data-[state=checked]:text-white transition-colors duration-150 cursor-pointer py-2 px-3 text-[12px] font-normal rounded-[6px] relative"
                style={{ fontFamily: '"Open Sans"', fontStyle: 'normal' }}
              >
                ASAP
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex">
          <label className="min-w-[145px] shrink-0 text-[#535354] font-poppins text-[16px] font-normal leading-[200%]">Estimated completion date</label>
          <div className="flex items-center gap-2 min-w-[125px] ml-[32px]">
            <div className="border-b h-[32px] min-w-[100px] flex items-center">
              {estimatedCompletionDate ? estimatedCompletionDate.toLocaleDateString('en-GB') : ''}
            </div>
            <Popover>
              <PopoverTrigger className="ml-2">
                <Image
                  src="/icons/choice-date.svg"
                  alt="calendar"
                  width={26}
                  height={26}
                  className="cursor-pointer"
                />
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="z-50">
                <Calendar
                  mode="single"
                  selected={estimatedCompletionDate ? estimatedCompletionDate : undefined}
                  onSelect={setEstimatedCompletionDate}
                  disabled={(d) => d < (date || currentDate.current)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="min-w-[120px] shrink-0 text-[#535354] font-poppins text-[16px] font-normal leading-[200%]">Involved Team</label>
        <div className="min-w-[350px] border-b border-[#535354] pl-1">
          <input
            type="text"
            value={involvedTeam || ''}
            onChange={(e) => setInvolvedTeam(e.target.value)}
            className="w-full bg-transparent outline-none"
            placeholder="Design"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 flex-grow h-full">
        <label className="min-w-[120px] shrink-0 pt-2 text-[#535354] font-poppins text-[16px] font-normal leading-[200%]">Success Metrics</label>
        <textarea
          value={successMetrics || ''}
          onChange={(e) => setSuccessMetrics(e.target.value)}
          className="flex-1 border-b border-gray-300 bg-transparent outline-none pl-1 resize-none min-h-[80px]"
          placeholder="Enter success metrics..."
        />
      </div>
    </form>
  );
}
