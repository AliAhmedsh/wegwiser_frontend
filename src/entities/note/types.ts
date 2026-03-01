export interface NoteProps {
  id?: string;
  title?: string;
  text: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  ownerId?: string;
  date?: string;
  time?: string;
  x: number;
  y: number;
  createdAt?: string;
  updatedAt?: string;
  productId?: number;
  vehicleId?: number;
}
