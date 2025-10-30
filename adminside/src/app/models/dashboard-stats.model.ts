export interface MonthlyCountDto {
  month: number; // 1-12
  count: number;
}

export interface DashboardStatsDto {
  year: number;
  monthlyRegistrations: MonthlyCountDto[];
  centresCount: number;
  blockedAccountsCount: number;
  pendingAccountsCount: number;
  activeAdminsCount: number;
}

