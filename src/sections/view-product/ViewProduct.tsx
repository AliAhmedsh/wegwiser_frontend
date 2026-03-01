import { RefObject, useEffect, useMemo, useRef, useState } from 'react';

import { Open_Sans } from 'next/font/google';
import MetricsTab from './sections/MetricsTab';
import PRDTab from './sections/PRDTab';
import TasksTab from './sections/TasksTab';

type TabKey = 'metrics' | 'prd' | 'tasks';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'metrics', label: 'Metrics' },
  { key: 'prd', label: 'PRD' },
  { key: 'tasks', label: 'Tasks' },
];

const openSans = Open_Sans({
  weight: ['800'],
  subsets: ['cyrillic'],
});

const ViewProduct: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'prd' | 'tasks'>(
    'metrics'
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const metricsTabWrapperRef = useRef<HTMLDivElement>(null);
  const prdTabWrapperRef = useRef<HTMLDivElement>(null);
  const tasksTabWrapperRef = useRef<HTMLDivElement>(null);

  const tabRefs = useMemo<Record<TabKey, RefObject<HTMLDivElement | null>>>(
    () => ({
      metrics: metricsTabWrapperRef,
      prd: prdTabWrapperRef,
      tasks: tasksTabWrapperRef,
    }),
    [metricsTabWrapperRef, prdTabWrapperRef, tasksTabWrapperRef]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const observerOptions = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const tabId = entry.target.getAttribute(
            'data-tab-id'
          ) as TabKey | null;
          if (tabId && tabId !== activeTab) {
            setActiveTab(tabId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );

    Object.values(tabRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => {
      observer.disconnect();
    };
  }, [activeTab, tabRefs]);

  const handleTabClick = (key: TabKey) => {
    tabRefs[key].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="h-full max-w-4xl mx-auto rounded-lg">
      <div className="pb-4 flex font-poppins font-semibold text-[#535354] overflow-x-auto no-scrollbar">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`mx-2 px-6 text-lg cursor-pointer whitespace-nowrap text-[#535354] ${openSans.className}`}
            onClick={() => handleTabClick(key)}
            type="button"
          >
            <span className={activeTab === key ? 'border-b-4 border-[#627899] pb-1' : ''}>
              {label}
            </span>
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        className="h-[calc(100%-40px)] px-6 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent mr-10"
      >
        <div className="flex flex-col gap-10">
          <MetricsTab
            wrapperDataId="metrics"
            ref={metricsTabWrapperRef}
            lastUpdated={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
          />
          <PRDTab
            wrapperDataId="prd"
            ref={prdTabWrapperRef}
            lastUpdated={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
          />
          <TasksTab
            wrapperDataId="tasks"
            ref={tasksTabWrapperRef}
            lastUpdated={new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
