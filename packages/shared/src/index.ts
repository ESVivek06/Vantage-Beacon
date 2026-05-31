// Shared types and utilities across apps
export type ApiResponse<T> = {
  data: T;
  error?: string;
};
