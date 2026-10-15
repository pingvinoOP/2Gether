export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
