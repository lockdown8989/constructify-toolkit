
export interface LeaveBalance {
  annual: number;
  sick: number;
  personal?: number;
  used?: number;
  remaining?: number;
}

export interface LeaveBalanceCardProps {
  leaveBalance: LeaveBalance;
}
