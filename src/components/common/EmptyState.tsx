import React from 'react';
import { Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: 48,
        color: '#9497a9',
        marginBottom: 16,
      }}>
        {icon || <InboxOutlined />}
      </div>
      <h3 style={{
        fontSize: 18,
        fontWeight: 600,
        color: '#101114',
        marginBottom: 8,
      }}>
        {title}
      </h3>
      {description && (
        <p style={{
          fontSize: 14,
          color: '#686b82',
          marginBottom: 24,
          maxWidth: 320,
        }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button type="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
