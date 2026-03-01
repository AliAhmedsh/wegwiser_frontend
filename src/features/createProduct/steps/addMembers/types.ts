interface Member {
  email: string;
  name: string;
  position: string;
  isOwner?: boolean;
}

interface FormValues {
  members: Member[];
}

export type { FormValues, Member };

