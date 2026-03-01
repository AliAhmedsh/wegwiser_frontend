import ArrowDownIcon from '@/shared/icons/ArrowDownIcon';
import React, { useState } from 'react';
import { WorkspaceFile } from '../../store/store';

interface AiLogPanelProps {
    productId: number;
    currentFile?: WorkspaceFile | null;
}

const Skeleton = () => (
    <div className="flex flex-col gap-[14px] mt-2 max-h-38 overflow-y-auto custom-scrollbar">
        <div className="h-3.5 bg-[#D9D9D9] w-32 flex-shrink-0 animate-pulse" />
        <div className="h-3.5 bg-[#D9D9D9] w-32 flex-shrink-0 animate-pulse" />
        <div className="h-3.5 bg-[#D9D9D9] w-40 flex-shrink-0 animate-pulse" />
        <div className="h-3.5 bg-[#D9D9D9] w-32 flex-shrink-0 animate-pulse" />
        <div className="h-3.5 bg-[#D9D9D9] w-32 flex-shrink-0 animate-pulse" />
        <div className="h-3.5 bg-[#D9D9D9] w-40 flex-shrink-0 animate-pulse" />
    </div>
);

const AiLogPanel: React.FC<AiLogPanelProps> = ({ productId, currentFile }) => {
    const [open, setOpen] = useState({
        testcases: false,
        code: false,
        deps: false,
        version: false,
    });

    const [generatedTestcases, setGeneratedTestcases] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const toggle = (key: keyof typeof open) => setOpen(o => ({ ...o, [key]: !o[key] }));

    const handleGenerateTestcase = async () => {
        if (!currentFile?.content) {
            setGenerationError('Please open a file first to generate testcases');
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);
        setGeneratedTestcases(null);

        try {
            const { engineeringFilesService } = await import('@/entities/tickets/api/engineeringFilesService');
            
            // Get current file content as context
            const context = currentFile.content || '';
            
            // Determine language from file extension
            const fileExtension = currentFile.name?.split('.').pop()?.toLowerCase() || '';
            let language = 'typescript';
            let framework = 'react';
            
            if (fileExtension === 'py') {
                language = 'python';
                framework = '';
            } else if (fileExtension === 'js' || fileExtension === 'jsx') {
                language = 'javascript';
                framework = 'react';
            } else if (fileExtension === 'ts' || fileExtension === 'tsx') {
                language = 'typescript';
                framework = 'react';
            }

            const response = await engineeringFilesService.generateAI(productId, {
                prompt: `Generate test cases for the following code`,
                type: 'testcase',
                context,
                language,
                framework,
            });

            if (response.success && response.result) {
                setGeneratedTestcases(response.result);
                setOpen(prev => ({ ...prev, testcases: true })); // Auto-expand testcases section
            } else {
                setGenerationError(response.error || response.details || 'Failed to generate testcases');
            }
        } catch (error) {
            console.error('Error generating testcases:', error);
            setGenerationError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col">
            <div className='py-2 border-t-1 border-b-1 border-[#E8E8E8]'>
                <button 
                    onClick={handleGenerateTestcase}
                    disabled={isGenerating || !currentFile?.content}
                    className={`self-start bg-[#627899] text-white rounded-lg py-1 px-4 text-xs/snug font-normal cursor-pointer ${
                        isGenerating || !currentFile?.content ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#526789]'
                    }`}
                >
                    {isGenerating ? 'Generating...' : 'Generate Testcase'}
                </button>
            </div>
            <div className="text-xs font-normal overflow-y-auto ">
                {/* Generated Testcases */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('testcases')}>
                        <p >Generated Testcases</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 mr-2 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.testcases && (
                        <div className="mt-2">
                            {isGenerating ? (
                                <Skeleton />
                            ) : generationError ? (
                                <div className="text-red-600 text-xs p-2 bg-red-50 rounded border border-red-200">
                                    {generationError}
                                </div>
                            ) : generatedTestcases ? (
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap break-words">
                                        {generatedTestcases}
                                    </pre>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedTestcases);
                                        }}
                                        className="mt-2 text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300"
                                    >
                                        Copy
                                    </button>
                                </div>
                            ) : (
                                <div className="text-gray-500 text-xs p-2">
                                    No testcases generated yet. Click "Generate Testcase" to create tests for the current file.
                                </div>
                            )}
                        </div>
                    )}
                </div>
                {/* Code suggestions */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('code')}>
                        <p>Code suggestions</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 mr-2 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.code && <Skeleton />}
                </div>
                {/* Dependency Analysis */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('deps')}>
                        <p>Dependency Analysis</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 mr-2 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.deps && <Skeleton />}
                </div>
                {/* Version Tracking */}
                <div>
                    <div className="flex items-center justify-between cursor-pointer select-none py-3 border-b-1 border-[#E8E8E8]" onClick={() => toggle('version')}>
                        <p>Version Tracking</p>
                        <ArrowDownIcon className={`text-[#E8E8E8] transition-transform duration-200 mr-2 ${open.testcases ? 'rotate-360 text-gray-400' : 'rotate-270'}`} />
                    </div>
                    {open.version && <Skeleton />}
                </div>
            </div>
        </div>
    );
};

export default AiLogPanel; 