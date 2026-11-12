export interface ActivityLog {
  id: string;
  userId: string | null;
  user: { id: string; name: string; lastname: string; email: string } | null;
  affected: string | null;
  entity: string | null;
  action: string;
  description: string;
  createdAt: string;
}

export interface LogFilters {
  categories: { entity: string; actions: string[] }[];
}

export interface FindLogsRequest {
  entity?: string;
  action?: string;
  userSearch?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedLogs {
  data: ActivityLog[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
