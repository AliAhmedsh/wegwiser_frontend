import { TestingGroup } from '@/entities/testings/model';
import { TestingCard, TestingGroupCard } from '@/entities/testings/ui';
import { testService } from '@/lib/api/services/testService';
import { engineeringFilesService } from '@/entities/tickets/api/engineeringFilesService';
import { useProductStore } from '@/entities/product/store';
import { Open_Sans } from 'next/font/google';
import Image from 'next/image';
import { useState, useEffect } from 'react';

type TestStatus = 'Passed' | 'Failed';

const TEST_DETAILS: Record<
  string,
  { status: TestStatus; description: string }
> = {
  p1: { status: 'Passed', description: 'Last runtime | Risk Alert' },
  p2: { status: 'Passed', description: 'Last runtime | Risk Alert' },
  p3: { status: 'Passed', description: 'Last runtime | Risk Alert' },
  p4: { status: 'Passed', description: 'Last runtime | Risk Alert' },
};

const OpenSans400 = Open_Sans({
  weight: '400',
  subsets: ['cyrillic'],
});

export default function TestingsTab() {
  const { chosenProduct } = useProductStore();
  const [activeGroup, setActiveGroup] = useState<TestingGroup | null>(null);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({
    p1: 'Failed',
    p2: 'Failed',
    p3: 'Failed',
    p4: 'Failed',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [generatedTestcases, setGeneratedTestcases] = useState<TestingGroup[]>([]);
  const [isLoadingTestcases, setIsLoadingTestcases] = useState(false);
  const [fullTestcaseContent, setFullTestcaseContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    const fetchGeneratedTestcases = async () => {
      if (!chosenProduct?.id) return;

      setIsLoadingTestcases(true);
      try {
        const response = await engineeringFilesService.getAILogs(chosenProduct.id, 'testcase');
        
        if (response.success && response.logs.length > 0) {
          const parsedGroups: TestingGroup[] = response.logs.map((log, index) => {
            const testLines = log.result
              .split('\n')
              .filter(line => {
                return /(test|it|describe)\(['"`]/.test(line.trim());
              })
              .map((line, idx) => {
                const match = line.match(/(test|it|describe)\(['"`]([^'"`]+)['"`]/);
                return match ? match[2] : `Test ${idx + 1}`;
              })
              .slice(0, 10);

            return {
              id: `generated-${log.id}`,
              title: `Generated Tests - ${new Date(log.createdAt).toLocaleDateString()}`,
              tests: testLines.length > 0 
                ? testLines.map((name, idx) => ({ id: `g-${log.id}-${idx}`, name }))
                : [{ id: `g-${log.id}-0`, name: 'Generated testcase (click to view)' }]
            };
          });

          setGeneratedTestcases(parsedGroups);
        }
      } catch (error) {
        console.error('Error fetching generated testcases:', error);
      } finally {
        setIsLoadingTestcases(false);
      }
    };

    fetchGeneratedTestcases();
  }, [chosenProduct?.id]);

  const runTestsInWorkspace = async () => {
    if (!activeGroup) return;

    setIsRunning(true);
    console.log(`🧪 Running REAL tests for: ${activeGroup.title}`);

    try {
      let testType: 'unit' | 'integration' | 'accessibility' | 'performance' | 'all' = 'all';

      switch (activeGroup.id) {
        case 'unit-tests':
          testType = 'unit';
          break;
        case 'integration-tests':
          testType = 'integration';
          break;
        case 'accessibility-tests':
          testType = 'accessibility';
          break;
        case 'performance-tests':
          testType = 'performance';
          break;
        default:
          testType = 'all';
      }

      const response = await testService.runTests(testType);

      console.log(`REAL tests completed for ${activeGroup.title}:`, response);

      const newStatuses = { ...testStatuses };

      if (response.success && response.results.testResults) {
        response.results.testResults.forEach((testResult, index) => {
          if (activeGroup.tests[index]) {
            newStatuses[activeGroup.tests[index].id] = testResult.status === 'passed' ? 'Passed' : 'Failed';
          }
        });
      } else {
        activeGroup.tests.forEach(test => {
          newStatuses[test.id] = 'Failed';
        });
      }

      setTestStatuses(newStatuses);



    } catch (error) {
      console.error('Error running REAL tests:', error);

      const newStatuses = { ...testStatuses };
      activeGroup.tests.forEach(test => {
        newStatuses[test.id] = 'Failed';
      });
      setTestStatuses(newStatuses);

      console.error('Full error details:', error);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    const fetchFullContent = async () => {
      if (!activeGroup || !chosenProduct?.id) {
        setFullTestcaseContent(null);
        return;
      }

      const isGeneratedGroup = activeGroup.id.startsWith('generated-');
      if (!isGeneratedGroup) {
        setFullTestcaseContent(null);
        return;
      }

      const logId = parseInt(activeGroup.id.replace('generated-', ''));
      if (isNaN(logId)) {
        setFullTestcaseContent(null);
        return;
      }

      setIsLoadingContent(true);
      try {
        const response = await engineeringFilesService.getAILogs(chosenProduct.id, 'testcase');
        const log = response.logs.find(l => l.id === logId);
        if (log) {
          setFullTestcaseContent(log.result);
        }
      } catch (error) {
        console.error('Error fetching testcase content:', error);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchFullContent();
  }, [activeGroup?.id, chosenProduct?.id]);

  if (activeGroup) {
    const isGeneratedGroup = activeGroup.id.startsWith('generated-');

    return (
      <div
        className="relative flex flex-col z-100 justify-between w-[95%] h-[99%] overflow-hidden p-2 pr-4 rounded-2xl"
        style={{
          boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
        }}
      >
        <div className="flex justify-between items-center my-2 ml-3 mr-1">
          <h2 className="font-bold text-base text-gray-900">
            {activeGroup.title}
          </h2>
          <button
            className="text-black text-2xl cursor-pointer"
            onClick={() => setActiveGroup(null)}
          >
            <Image
              src={'/icons/ArrowDown.svg'}
              alt="icon"
              height={16}
              width={16.14}
            />
          </button>
        </div>
        <div className="flex flex-col gap-4 w-full mx-auto overflow-y-auto custom-scrollbar-second flex-1">
          {isGeneratedGroup && fullTestcaseContent ? (
            // Show full generated testcase code
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words overflow-auto max-h-[60vh]">
                {fullTestcaseContent}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullTestcaseContent);
                }}
                className="mt-2 text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
              >
                Copy Code
              </button>
            </div>
          ) : isGeneratedGroup && isLoadingContent ? (
            <div className="text-sm text-gray-500">Loading testcase content...</div>
          ) : (
            activeGroup.tests.map((test) => (
              <TestingCard
                key={test.id}
                testing={{
                  id: test.id,
                  name: test.name,
                  status: testStatuses[test.id] || 'Failed',
                  description: TEST_DETAILS[test.id]?.description || '',
                }}
                showStar={test.id !== 'p2' && test.id !== 'p3'}
              />
            ))
          )}
        </div>
        <div className="flex gap-4 mt-2 mb-2 justify-end">
          <button className="bg-[#EAEDF2] rounded-xl px-6 py-2 text-gray-700 text-sm font-bold border border-black cursor-pointer">
            Result Log
          </button>
          <button
            className={`rounded-xl px-6 py-2 text-white text-sm font-bold cursor-pointer ${isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
              }`}
            onClick={runTestsInWorkspace}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run in workspace'}
          </button>
        </div>
      </div>
    );
  }

  const allTestGroups = generatedTestcases;

  return (
    <div
      className={`w-[98%] h-[99%] flex flex-col items-center overflow-hidden overflow-y-scroll custom-scrollbar-second ${OpenSans400.className}`}
    >
      {isLoadingTestcases && (
        <div className="text-sm text-gray-500 mb-2">Loading generated testcases...</div>
      )}
      <div className="flex gap-4 flex-wrap p-1 justify-start pr-6">
        {allTestGroups.map((group) => (
          <TestingGroupCard
            key={group.id}
            group={group}
            onClick={() => setActiveGroup(group)}
          />
        ))}
      </div>
      {generatedTestcases.length === 0 && !isLoadingTestcases && chosenProduct?.id && (
        <div className="text-xs text-gray-400 mt-4 text-center">
          No generated testcases yet. Generate testcases from Engineering Workspace to see them here.
        </div>
      )}
    </div>
  );
}
