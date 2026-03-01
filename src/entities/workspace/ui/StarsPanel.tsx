import ArrowDownIcon from '@/shared/icons/ArrowDownIcon';
import React, { useState } from 'react';

const Skeleton = () => (
    <div className="flex flex-col gap-2 mt-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
);

const AiLogPanel: React.FC = () => {
    const [open, setOpen] = useState({
        testcases: false,
        code: false,
        deps: false,
        version: false,
    });

    const toggle = (key: keyof typeof open) => setOpen(o => ({ ...o, [key]: !o[key] }));

    return (
        <div className="flex flex-col">
            <div className='py-2 border-t-1 border-b-1 border-[#E8E8E8]'>
                <button className="self-start bg-[#627899] text-white rounded-xl py-2 px-4 text-xs font-normal cursor-pointer">Generate Testcase</button>
            </div>
            <div className="text-xs font-normal overflow-y-auto ">
                {/* Generated Testcases */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('testcases')}>
                        <p >Generated Testcases</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.testcases && <Skeleton />}
                </div>
                {/* Code suggestions */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('code')}>
                        <p>Code suggestions</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.code && <Skeleton />}
                </div>
                {/* Dependency Analysis */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('deps')}>
                        <p>Dependency Analysis</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.deps && <Skeleton />}
                </div>
                {/* Version Tracking */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('version')}>
                        <p>Version Tracking</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.version && <Skeleton />}
                </div>
            </div>
        </div>
    );
};

export default AiLogPanel; 