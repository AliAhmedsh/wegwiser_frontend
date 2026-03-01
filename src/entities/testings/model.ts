export interface Testing {
  id: string;
  name: string;
  status: 'Passed' | 'Failed';
  description: string;
  isHighlighted?: boolean;
}

import { create } from 'zustand';

const MOCK_TESTINGS: Testing[] = [
  {
    id: '1',
    name: 'File name_First Contentful Paint under 2s on mobile',
    status: 'Passed',
    description: 'Last runtime | Risk Alert',
  },
  {
    id: '2',
    name: 'File name_Time to Interactive < 5s for dashboard',
    status: 'Passed',
    description: 'Last runtime | Risk Alert',
    isHighlighted: true,
  },
  {
    id: '3',
    name: 'File name_Memory usage stays below 100MB after 5 minutes',
    status: 'Passed',
    description: 'Last runtime | Risk Alert',
  },
  {
    id: '4',
    name: 'File name_No blocking scripts over 300ms',
    status: 'Passed',
    description: 'Last runtime | Risk Alert',
  },
];

interface TestingsState {
  testings: Testing[];
  setTestings: (testings: Testing[]) => void;
}

export const useTestingsStore = create<TestingsState>((set) => ({
  testings: MOCK_TESTINGS,
  setTestings: (testings) => set({ testings }),
}));

export interface TestingGroup {
  id: string;
  title: string;
  tests: { id: string; name: string }[];
}

export const MOCK_TESTING_GROUPS: TestingGroup[] = [
  {
    id: 'unit',
    title: 'Unit Tests',
    tests: [
      { id: 'u1', name: 'formatDate() returns correct locale string' },
      { id: 'u2', name: 'UserCard renders user name from props' },
      { id: 'u3', name: 'getUserRole() handles invalid' },
    ],
  },
  {
    id: 'integration',
    title: 'Integration Tests',
    tests: [
      { id: 'i1', name: 'User form submits data and displays success message' },
      { id: 'i2', name: 'Login component sets session and redirects' },
      { id: 'i3', name: 'Sidebar updates when new project' },
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessibility Tests',
    tests: [
      {
        id: 'a1',
        name: 'Modal has correct aria-labelled by and aria-described by',
      },
      { id: 'a2', name: 'All buttons have accessible names' },
      { id: 'a3', name: 'Color contrast meets WCAG AA standards' },
    ],
  },
  {
    id: 'performance',
    title: 'Performance Tests',
    tests: [
      { id: 'p1', name: 'File name_First Contentful Paint under 2s on mobile' },
      { id: 'p2', name: 'File name_Time to Interactive < 5s for dashboard' },
      { id: 'p3', name: 'File name_Memory usage stays below 100MB after 5 minutes' },
      { id: 'p4', name: 'File name_No blocking scripts over 300ms' },
    ],
  },
];

