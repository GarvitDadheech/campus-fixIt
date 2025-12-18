export class ApiResponse<T = any> {
  public success: boolean;
  public statusCode: number;
  public message: string;
  public data?: T;
  public pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };

  constructor(
    statusCode: number,
    message: string,
    data?: T,
    pagination?: ApiResponse['pagination']
  ) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }

  // Factory methods for common responses
  static success<T>(data: T, message: string = 'Success'): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  static created<T>(data: T, message: string = 'Created successfully'): ApiResponse<T> {
    return new ApiResponse(201, message, data);
  }

  static noContent(message: string = 'Deleted successfully'): ApiResponse<null> {
    return new ApiResponse(200, message, null);
  }

  static paginated<T>(
    data: T[],
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    },
    message: string = 'Success'
  ): ApiResponse<T[]> {
    return new ApiResponse(200, message, data, pagination);
  }
}

export default ApiResponse;

