import { WorkerListProps } from '@/entities/worker/type';

const names = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Isla',
  'Jack',
];
const surnames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Martinez',
  'Taylor',
];
const colors = [
  '#FF5733',
  '#33FF57',
  '#3357FF',
  '#FF33A1',
  '#A133FF',
  '#33FFF3',
];
const positions = ['UI/UX', 'ENGINEERING/QA', 'PM'];
const timeZones = ['UTC+1', 'UTC+2', 'UTC+3', 'UTC+4', 'UTC+5'];
const statuses = ['active', 'inactive', 'vacation', 'busy'];

const getRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomPassword = (length: number = 8): string => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => getRandom(chars.split(''))).join('');
};

const generateUsers = (
  amount: number,
  amountOfUsers: number
): WorkerListProps[] => {
  const users: WorkerListProps[] = [];

  for (let index = 0; index < amount; index++) {
    const name = getRandom(names);
    const surname = getRandom(surnames);
    const id = (amountOfUsers + index).toString();
    const shortName = `${name[0]}.${surname[0]}`;
    const color = getRandom(colors);
    const accuratePosition = getRandom(positions);
    const position = getRandom(positions);
    const timeZone = getRandom(timeZones);
    const status = getRandom(statuses);
    const email = `${name.toLowerCase()}.${surname.toLowerCase()}${index}@company.com`;
    const password = generateRandomPassword();

    const user: WorkerListProps = {
      id,
      status,
      productInProgress: Math.floor(Math.random() * 5),
      vehicleInProgress: Math.floor(Math.random() * 3),
      efficiencyCharts: {
        quality: getRandomInt(1, 99),
        efficiency: getRandomInt(1, 99),
        speed: getRandomInt(1, 99),
      },
      position,
      relatedProducts: [],
      relatedVehicles: [],
      facilitatorIn: [],
      capacity: [],
      image: '',
      name,
      surname,
      shortName,
      color,
      isManager: Math.random() < 0.3,
      email,
      password,
      timeZone,
      accuratePosition,
      phoneNumber: `38068${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    users.push(user);
  }

  return users;
};

export default generateUsers;
