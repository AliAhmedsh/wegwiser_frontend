import { create } from 'zustand';
import { WorkerListProps, mockWorkers, CreateWorkerDto } from '../../type';
import useVehicleStore from '@/entities/vehicle/api/mock/vehicleStore';
import { CapacityProps } from '@/entities/vehicle/types';
import { persist } from 'zustand/middleware';

let nextId = 10;

interface UserStoreProps {
  users: WorkerListProps[];
  chosenUser: WorkerListProps | null;
  setUsers: (users: WorkerListProps[]) => void;
  setChosenUser: (user: WorkerListProps) => void;
  addUser: (user: CreateWorkerDto) => WorkerListProps;
  updateUser: (id: string, data: Partial<WorkerListProps>) => void;
  getUserByID: (userID: string) => WorkerListProps | undefined;
  freeCapacityByID: (
    userID: string,
    capacityID: string,
    vehicleName: string
  ) => void;
  getUsersByVehicleID: (vehicleID: string) => WorkerListProps[];
  getFacilitatorsById: (vehicleID: string) => WorkerListProps[];
  getNotRelatedUsers: (
    vehicleID: string,
    productID: string
  ) => WorkerListProps[];
  getUserByEmail: (email: string) => WorkerListProps | undefined;
  getUsersByEmailAndNotRelated: (
    vehicleID: string,
    email: string,
    productID: string
  ) => WorkerListProps[];
  getFacilitatorByVehicleID: (vehicleID: string) => WorkerListProps[];
  addNewUsersToVehicle: (
    userIDs: string[],
    vehicleID: string,
    vehicleName: string
  ) => void;
  removeVehicleFromRelated: (vehicleID: string, userID: string) => string[];
  addFacilitator: (userID: string, vehicleID: string) => void;
  removeFacilitators: (userID: string, vehicleID: string) => void;
  addVehicleToUsers: (
    data: { vehicleID: string; vehicleName: string },
    userIDs: string[]
  ) => void;
  getUsersByProductID: (productID: string) => WorkerListProps[];
}

export const useUserStore = create<UserStoreProps>()(
  persist(
    (set, get) => ({
      users: mockWorkers,
      chosenUser: null,
      setUsers: (users) => set({ users }),
      setChosenUser: (user) => set({ chosenUser: user }),
      addUser: (user: CreateWorkerDto) => {
        const newUser: WorkerListProps = {
          ...user,
          id: String(nextId),
          capacity: [],
          relatedProducts: [],
          status: 'idle',
          productInProgress: 0,
          vehicleInProgress: 0,
          relatedVehicles: [],
          facilitatorIn: [],
          efficiencyCharts: {
            quality: 0,
            speed: 0,
            efficiency: 0,
          },
        };

        nextId++;

        set((state) => ({
          users: [...state.users, newUser],
        }));

        return newUser;
      },

      updateUser: (id, data) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...data } : user
          ),
        }));
      },

      freeCapacityByID: (userID, capacityID, vehicleName) => {
        const vehicleID = useVehicleStore
          .getState()
          .getVehicleByName(vehicleName)?.id;

        let vehicles: string[] = [];
        if (vehicleID?.toString()) {
          vehicles = get().removeVehicleFromRelated(
            vehicleID.toString(),
            userID
          );
        }

        set((state) => {
          const updatedUsers = state.users.map((user) => {
            if (user.id === userID) {
              const filteredCapacity = user.capacity.filter(
                (c) => c.id !== capacityID
              );
              return {
                ...user,
                capacity: filteredCapacity,
                relatedVehicles: vehicles,
              };
            }
            return user;
          });

          return { users: updatedUsers };
        });
      },

      getUserByID: (userID) => {
        return get().users.find((u) => u.id === userID);
      },

      getUsersByVehicleID: (vehicleID: string) => {
        return get().users.filter((user) =>
          user.relatedVehicles?.includes(vehicleID)
        );
      },

      removeVehicleFromRelated: (vehicleID, userID) => {
        const user = get().users.find((u) => u.id === userID);
        if (!user) return [];

        return user.relatedVehicles.filter((vID) => vID !== vehicleID);
      },

      getFacilitatorsById: (vehicleID: string) => {
        return get().users.filter((u) => u.facilitatorIn.includes(vehicleID));
      },

      getUsersByProductID: (productID: string) => {
        return get().users.filter((u) => u.relatedProducts.includes(productID));
      },

      getNotRelatedUsers: (vehicleID, productID) => {
        return get().users.filter(
          (u) =>
            !u.facilitatorIn.includes(vehicleID) &&
            !u.relatedVehicles.includes(vehicleID) &&
            u.relatedProducts.includes(productID)
        );
      },

      getUserByEmail: (email) => {
        return get().users.find((u) => u.email === email);
      },

      getUsersByEmailAndNotRelated: (vehicleID, email, productID) => {
        return get().users.filter(
          (u) =>
            u.email.includes(email) &&
            !u.facilitatorIn.includes(vehicleID) &&
            !u.relatedVehicles.includes(vehicleID) &&
            u.relatedProducts.includes(productID)
        );
      },

      getFacilitatorByVehicleID: (vehicleID) => {
        return get().users.filter((u) => u.facilitatorIn.includes(vehicleID));
      },

      addNewUsersToVehicle: (userIDs, vehicleID, vehicleName) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (userIDs.includes(user.id)) {
              const alreadyIncluded = user.relatedVehicles.includes(vehicleID);
              const newCapacityCards: CapacityProps[] = [
                ...user.capacity,
                { id: '', vehicleName },
              ];
              return {
                ...user,
                relatedVehicles: alreadyIncluded
                  ? user.relatedVehicles
                  : [...user.relatedVehicles, vehicleID],
                capacity: newCapacityCards,
              };
            }
            return user;
          }),
        }));
      },

      addFacilitator: (userID, vehicleID) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (user.id === userID) {
              const alreadyIncluded = user.facilitatorIn.includes(vehicleID);
              return {
                ...user,
                facilitatorIn: alreadyIncluded
                  ? user.facilitatorIn
                  : [...user.facilitatorIn, vehicleID],
              };
            }
            return user;
          }),
        }));
      },

      removeFacilitators: (userID: string, vehicleID: string) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (user.id === userID) {
              return {
                ...user,
                facilitatorIn: user.facilitatorIn.filter(
                  (id) => id !== vehicleID
                ),
              };
            }
            return user;
          }),
        }));
      },

      addVehicleToUsers: ({ vehicleID, vehicleName }, userIDs) => {
        set((state) => ({
          users: state.users.map((user) => {
            if (userIDs.includes(user.id)) {
              const alreadyRelated = user.relatedVehicles.includes(vehicleID);
              const alreadyInCapacity = user.capacity.some(
                (c) => c.id === vehicleID
              );

              return {
                ...user,
                relatedVehicles: alreadyRelated
                  ? user.relatedVehicles
                  : [...user.relatedVehicles, vehicleID],

                capacity: alreadyInCapacity
                  ? user.capacity
                  : [
                      ...user.capacity,
                      {
                        id: `${vehicleID}-${Math.random()
                          .toString(36)
                          .slice(2, 8)}`,
                        vehicleName,
                      },
                    ],
              };
            }
            return user;
          }),
        }));
      },
    }),
    {
      name: 'user-store',
    }
  )
);

export default useUserStore;
