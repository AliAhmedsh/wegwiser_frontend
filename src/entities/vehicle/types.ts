import { WorkerListProps } from '../worker/type';

export interface EfficiencyCharts {
  speed: number;
  efficiency: number;
  quality: number;
  minwidth?: string;
  className?: string;
}

interface VehicleInfo {
  name: string;
  owner?: string;
  dateCreated?: Date;
  estimatedCompletion?: Date;
  Description: string;
  type?: string;
  vehicleType?: string;
}

export interface CapacityProps {
  vehicleName?: string;
  id: string;
}

export interface VehicleListProps {
  id: number;
  productId: number;
  composite: number;
  doneFor?: number;
  efficiencyCharts?: EfficiencyCharts;
  vehicleInfo: VehicleInfo;
  workers?: WorkerListProps[];
  relatedProducts?: string[];
  size: 'tiny' | 'medium' | 'big';
  createdAt?: string;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
  members?: Array<{
    id: number;
    role: string;
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
    };
  }>;
  teamMembers?: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
    userRole?: string;
    invitedAt?: string;
  }>;
  // Optional UI-only flag to indicate the vehicle is selected in the canvas
  isSelected?: boolean;
  // Optional UI-only flag to indicate the vehicle is AI-generated/proposed
  isProposed?: boolean;
  // Vehicle status (PLANNING, DRAFT, etc.)
  status?: string;
  // Optional callback for delete action
  onDelete?: (vehicleId: number) => void;
}
