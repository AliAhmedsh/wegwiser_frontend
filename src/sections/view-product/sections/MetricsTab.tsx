import Image from 'next/image';
import { forwardRef, useEffect, useState } from 'react';

import { useProductStore } from '@/entities/product/store';
import { UsageInsightsData, UsageInsightsResponse } from '@/entities/usageInsights/api/api';
import { useUsageInsightsQuery } from '@/entities/usageInsights/api/hooks';
import { usePersonalAnalytics } from '@/hooks/usePersonalAnalytics';
import { Open_Sans } from 'next/font/google';
import DoughnutChart from '../charts/DoughnutChart';
import LineChart from '../charts/LineChart';
import AIUsageDisplay from '../ui/AIUsageDisplay';
import MetricCard from '../ui/MetricCard';
import TabHeader from '../ui/TabHeader';
import VerticalMetersCard from '../ui/VerticalMetersCard';

interface MetricsTabProps {
  lastUpdated: string;
  wrapperDataId: string;
}

const openSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

const openSans600 = Open_Sans({
  weight: ['600'],
  subsets: ['cyrillic'],
});

const MetricsTab = forwardRef<HTMLDivElement, MetricsTabProps>(
  ({ lastUpdated, wrapperDataId }, ref) => {
    const { chosenProduct } = useProductStore();
    const [dynamicLastUpdated, setDynamicLastUpdated] = useState(lastUpdated);

    const { data: insightsResponse, isLoading, error } = useUsageInsightsQuery(
      chosenProduct?.id || 0,
      !!chosenProduct?.id
    );

    const { data: personalAnalytics, isLoading: analyticsLoading, error: analyticsError } = usePersonalAnalytics(
      chosenProduct?.id || null
    );

    useEffect(() => {
      const response = insightsResponse as UsageInsightsResponse | undefined;
      if (response?.data?.lastUpdated) {
        const date = new Date(response.data.lastUpdated);
        const formattedDate = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: '2-digit'
        });
        setDynamicLastUpdated(formattedDate);
      }
    }, [insightsResponse]);

    if (!chosenProduct?.id) {
      return (
        <div
          data-tab-id={wrapperDataId}
          ref={ref}
          className="min-h-[calc(80vh-100px)] flex items-center justify-center"
        >
          <div className="text-center text-gray-600">
            <div className={`text-[18px] font-semibold ${openSans400.className}`}>
              No product selected
            </div>
            <div className="text-[14px] mt-2">
              Please select a product to view usage insights
            </div>
          </div>
        </div>
      );
    }

    // Format time saved for display
    const formatTimeSaved = (hours: number) => {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return `${wholeHours}h ${minutes}m`;
    };

    // Default values for loading/error states
    const defaultValues: UsageInsightsData = {
      activeUsers: 0,
      aiSuggestionsAccepted: 0,
      avgTimeSaved: 0,
      engagementOverTime: 0,
      suggestionsMade: 0,
      ticketsCreated: 0,
      engagementData: [],
      feedbackData: { positive: 0, negative: 0, neutral: 0 },
      lastUpdated: new Date().toISOString()
    };

    const response = insightsResponse as UsageInsightsResponse | undefined;
    const values: UsageInsightsData = response?.data || defaultValues;

    if (isLoading) {
      return (
        <div
          data-tab-id={wrapperDataId}
          ref={ref}
          className="min-h-[calc(80vh-100px)] flex items-center justify-center"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className={`text-[18px] font-semibold ${openSans400.className}`}>
              Loading usage insights...
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          data-tab-id={wrapperDataId}
          ref={ref}
          className="min-h-[calc(80vh-100px)] flex items-center justify-center"
        >
          <div className="text-center text-red-600">
            <div className={`text-[18px] font-semibold ${openSans400.className}`}>
              Error loading usage insights
            </div>
            <div className="text-[14px] mt-2">
              {error.message || 'Please try again later'}
            </div>
            <div className="text-[12px] mt-1 text-gray-500">
              Product ID: {chosenProduct?.id || 'Not selected'}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        data-tab-id={wrapperDataId}
        ref={ref}
        className="min-h-[calc(80vh-100px)]"
      >
        {/* <TabHeader
          label="Usage Insights"
          lastUpdated={dynamicLastUpdated}
          onEdit={() => { }}
          showEdit
        /> */}

        {/* <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 rounded-lg"
          style={{
            boxShadow:
              '2px 2px 2px 0px rgba(167, 177, 196, 0.6), -2px -2px 2px 0px rgba(255, 255, 255, 1)',
          }}
        >
          <MetricCard
            title="Active Users"
            value={values.activeUsers.toString()}
            increaseText="Increase compared to last week"
            iconSrc="icons/Increase.svg"
          />

          <MetricCard
            title="AI Suggestions Accepted"
            value={`${values.aiSuggestionsAccepted}%`}
            increaseText="Increase compared to last week"
            iconSrc="icons/Increase.svg"
          />

          <MetricCard
            title="Avg Time Saved"
            value={formatTimeSaved(values.avgTimeSaved)}
            increaseText="Increase compared to last week"
            iconSrc="icons/Increase.svg"
          />
        </div> */}

        {/* Personal Analytics Section */}
        <div className="mt-6 bg-[#EAEDF2]">
          <TabHeader
          
            label="Personal Analytics"
            lastUpdated={personalAnalytics?.lastUpdated ? new Date(personalAnalytics.lastUpdated).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: '2-digit'

            }) : 'Never'}
            onEdit={() => { }}
            showEdit={false}
          />
          
          <div
            className="mt-3 rounded-lg p-4"
            style={{background:"#EAEDF2",
              boxShadow:
                '2px 2px 2px 0px rgba(167, 177, 196, 0.6), -2px -2px 2px 0px rgba(255, 255, 255, 1)',
            }}
          >
            {analyticsLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-sm text-gray-600">Loading personal analytics...</div>
              </div>
            ) : analyticsError ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-sm text-red-600">Failed to load personal analytics</div>
              </div>
            ) : (
              <VerticalMetersCard
                speed={personalAnalytics?.performance.speed || 0}
                efficiency={personalAnalytics?.performance.efficiency || 0}
                quality={personalAnalytics?.performance.quality || 0}
              />
            )}
          </div>
        </div>
{/* 
        <div className="flex flex-row gap-4 mt-2 text-black">
          <div className="flex flex-col gap-4 w-[65%]">
            <div
              className="rounded-lg p-6"
              style={{
                boxShadow:
                  '2px 2px 2px 0px rgba(167, 177, 196, 0.6), -2px -2px 2px 0px rgba(255, 255, 255, 1)',
              }}
            >
              <div className="flex flex-row gap-4">
                <div className="w-[75%]">
                  <LineChart data={values.engagementData} />
                </div>
                <div className="flex flex-col gap-2 items-center justify-center py-4 pr-4 font-inter text-[#3D3D3D]">
                  <p
                    className={`max-w-[72px] ${openSans600.className} text-[12px]`}
                  >
                    Engagement over time
                  </p>
                  <div
                    className={`flex flex-row gap-2 font-[500] text-[23px] ${openSans400.className}`}
                  >
                    {values.engagementOverTime}%
                    <Image
                      height={20}
                      width={20}
                      alt="metrics-image"
                      src="icons/Increase.svg"
                      className="inline-block w-[20px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-lg py-2 text-[#3D3D3D]"
              style={{
                boxShadow:
                  '2px 2px 2px 0px rgba(167, 177, 196, 0.6), -2px -2px 2px 0px rgba(255, 255, 255, 1)',
              }}
            >
              <AIUsageDisplay
                title="AI Usage"
                stats={[
                  { label: 'Suggestions made', value: values.suggestionsMade },
                  { label: 'Tickets created', value: values.ticketsCreated },
                ]}
              />
            </div>
          </div>

          <div
            className="rounded-lg p-4 w-[32%] relative z-20"
            style={{
              boxShadow:
                '2px 2px 2px 0px rgba(167, 177, 196, 0.6), -2px -2px 2px 0px rgba(255, 255, 255, 1)',
            }}
          >
            <DoughnutChart data={values.feedbackData} />
          </div>
        </div> */}
      </div>
    );
  }
);

MetricsTab.displayName = 'MetricsTab';

export default MetricsTab;
