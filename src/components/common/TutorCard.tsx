import React from 'react';
import { Avatar, Rate } from 'antd';
import { UserOutlined, StarFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { TutorProfile } from '../../types';
import StatusBadge from './StatusBadge';

interface TutorCardProps {
  tutor: TutorProfile;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  showAction = true,
  actionText = 'Xem chi tiết',
  onAction,
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'all 0.2s ease',
    }}>
      {/* Header with Avatar and Name */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <Avatar
          size={64}
          src={tutor.avatarUrl}
          icon={<UserOutlined />}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 600,
            color: '#101114',
            marginBottom: 4,
            margin: 0,
          }}>
            {tutor.fullName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={tutor.status} size="small" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <StarFilled style={{ color: '#f59e0b', fontSize: 14 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#101114' }}>
                {tutor.reputationScore.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {tutor.bio && (
        <p style={{
          fontSize: 14,
          color: '#686b82',
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {tutor.bio}
        </p>
      )}

      {/* Subjects */}
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {tutor.subjects.slice(0, 3).map((subject) => (
            <span
              key={subject.subjectId}
              style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(113, 50, 245, 0.08)',
                color: '#7132f5',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {subject.subjectName}
            </span>
          ))}
          {tutor.subjects.length > 3 && (
            <span
              style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(148, 151, 169, 0.08)',
                color: '#686b82',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              +{tutor.subjects.length - 3} môn khác
            </span>
          )}
        </div>
      </div>

      {/* Price Range */}
      {tutor.subjects.length > 0 && (
        <div style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#7132f5',
        }}>
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(Math.min(...tutor.subjects.map(s => s.hourlyRate)))} - {' '}
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
          }).format(Math.max(...tutor.subjects.map(s => s.hourlyRate)))} / giờ
        </div>
      )}

      {/* Action Button */}
      {showAction && (
        <Link to={`/student/tutor/${tutor.userId}`}>
          <button
            onClick={onAction}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: '#7132f5',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5741d8'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#7132f5'}
          >
            {actionText}
          </button>
        </Link>
      )}
    </div>
  );
};

export default TutorCard;
