import React from 'react';
import { SessionStatus } from '../../types';

interface StatusBadgeProps {
  status: SessionStatus | string;
  size?: 'small' | 'default';
}

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  // Session Status
  Pending: { bg: 'rgba(217, 119, 6, 0.12)', color: '#b45309', label: 'Pending' },
  Confirmed: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Confirmed' },
  Completed: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Completed' },
  Cancelled: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Cancelled' },
  PendingChangeConfirmation: { bg: 'rgba(113, 50, 245, 0.12)', color: '#5b1ecf', label: 'Awaiting Reschedule' },
  
  // Profile Status
  Approved: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Approved' },
  Rejected: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Rejected' },
  
  // Credit Request Status
  Deposit: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Learning Credit Top-up' },
  SessionFee: { bg: 'rgba(113, 50, 245, 0.12)', color: '#5b1ecf', label: 'Session Fee' },
  LateCancellationFee: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Late Cancellation Fee' },
  Refund: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Refund' },
  
  // Change Request Status
  Accepted: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Accepted' },
  
  // Milestone Status
  NotStarted: { bg: 'rgba(104, 107, 130, 0.12)', color: '#484b5e', label: 'Not Started' },
  InProgress: { bg: 'rgba(113, 50, 245, 0.12)', color: '#5b1ecf', label: 'In Progress' },
  
  // Complaint Status
  Resolved: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Resolved' },
  Dismissed: { bg: 'rgba(104, 107, 130, 0.12)', color: '#484b5e', label: 'Dismissed' },
  
  // User Status
  Active: { bg: 'rgba(20, 158, 97, 0.16)', color: '#026b3f', label: 'Active' },
  Suspended: { bg: 'rgba(220, 38, 38, 0.12)', color: '#b91c1c', label: 'Suspended' },
  
  // Default
  default: { bg: 'rgba(104, 107, 130, 0.12)', color: '#484b5e', label: 'Unknown' },
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
