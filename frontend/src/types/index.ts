export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: Gender;
  profilePicture?: string;
  oauthProvider?: OAuthProvider;
  oauthId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum OAuthProvider {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE'
}

export interface SignupFormData {
  email: string;
  password: string;
  name: string;
  age: number | string;
  gender: Gender;
  profilePicture?: File;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface OAuthLoginData {
  provider: OAuthProvider;
  accessToken: string;
}

export interface UpdateProfileFormData {
  name?: string;
  age?: number | string;
  gender?: Gender;
  profilePicture?: File;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface ApiResponse<T = any> {
  message?: string;
  user?: User;
  users?: User[];
  pagination?: PaginationInfo;
  data?: T;
  isNewUser?: boolean;
  token?: string;
} 