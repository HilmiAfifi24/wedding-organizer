export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiError = {
  success: false;
  message: string;
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
