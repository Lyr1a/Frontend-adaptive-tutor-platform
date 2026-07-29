import React from 'react';
import { SessionStatus } from '../../types';

interface StatusBadgeProps {
  status: SessionStatus | string;
  size?: 'small' | 'default';
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  // Session Status
  Pending: { bg: 'rgba(217, 119, 6, 0.12)', color: '#b45309', label: 'Đang chờ' },
  Confirmed: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Đã xác nhận' },
  Completed: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Hoàn thành' },
  Cancelled: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Đã hủy' },
  PendingChangeConfirmation: { bg: 'rgba(113, 50, 245, 0.12)', color: '#5b1ecf', label: 'Chờ đổi lịch' },
  
  // Profile Status
  Approved: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Đã duyệt' },
  Rejected: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Từ chối' },
  
  // Credit Request Status
  Deposit: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Nạp tiền' },
  SessionFee: { bg: 'rgba(113, 50, 245, 0.12)', color: '#5b1ecf', label: 'Phí buổi học' },
  LateCancellationFee: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Phí hủy muộn' },
  Refund: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Hoàn tiền' },
  
  // Change Request Status
  Accepted: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Đã chấp nhận' },
  
  // Milestone Status
  NotStarted: { bg: 'rgba(104, 107, 130, 0.12)', color: '#484b5e', label: 'Chưa bắt đầu' },
  InProgress: { bg: 'rgba(113, 50, 245, 0.12)', color: '#5b1ecf', label: 'Đang tiến hành' },
  
  // Complaint Status
  Resolved: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Đã xử lý' },
  Dismissed: { bg: 'rgba(104, 107, 130, 0.12)', color: '#484b5e', label: 'Bỏ qua' },
  
  // User Status
  Active: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Hoạt động' },
  Suspended: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Bị khóa' },
  
  // Default
  default: { bg: 'rgba(104, 107, 130, 0.12)', color: '#484b5e', label: 'Không xác định' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'default' }) => {
  const config = statusConfig[status] || statusConfig.default;
  
  return (
    <span style={{
      display: 'inline-block',
      padding: size === 'small' ? '2px 6px' : '4px 10px',
      borderRadius: 6,
      backgroundColor: config.bg,
      color: config.color,
      fontSize: size === 'small' ? 11 : 13,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
