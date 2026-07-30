import React from 'react';
import { Avatar, Button } from 'antd';
import { UserOutlined, VideoCameraOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { Session, SessionStatus } from '../../types';
import StatusBadge from './StatusBadge';
import { formatDateTime, getDateRange } from '../../utils';

interface SessionCardProps {
  session: Session;
  userRole: 'Student' | 'Tutor';
  onProposeChange?: (sessionId: number) => void;
  onCancel?: (sessionId: number) => void;
  onJoin?: (sessionId: number) => void;
  showActions?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  userRole,
  onProposeChange,
  onCancel,
  onJoin,
  showActions = true,
}) => {
  const otherPerson = userRole === 'Student' 
    ? { name: session.tutorName, avatar: session.tutorAvatar }
    : { name: session.studentName, avatar: session.studentAvatar };

  const canJoin = session.meetingLink && 
    (session.status === 'Confirmed' || session.status === 'Pending') &&
    new Date(session.startTime) <= new Date();

  const canProposeChange = session.status === 'Confirmed';
  const canCancel = session.status === 'Confirmed';
  const canComplete = userRole === 'Tutor' && session.status === 'Confirmed' &&
    new Date(session.startTime) <= new Date();

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: 12,
      boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar
            size={48}
            src={otherPerson.avatar}
            icon={<UserOutlined />}
          />
          <div>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#101114' }}>
              {otherPerson.name}
            </h4>
            <p style={{ margin: 0, fontSize: 14, color: '#686b82' }}>
              {userRole === 'Student' ? 'Tutor' : 'Student'}
            </p>
          </div>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {/* Session Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            padding: '4px 10px',
            backgroundColor: 'rgba(113, 50, 245, 0.08)',
            color: '#7132f5',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
          }}>
            {session.subjectName}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarOutlined style={{ color: '#686b82' }} />
          <span style={{ fontSize: 14, color: '#101114' }}>
            {getDateRange(session.startTime, session.endTime)}
          </span>
        </div>

        {session.meetingLink && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <VideoCameraOutlined style={{ color: '#686b82' }} />
            <span style={{ fontSize: 14, color: '#7132f5' }}>
              Online meeting link available
            </span>
          </div>
        )}

        {session.score !== undefined && session.score !== null && (
          <div style={{ fontSize: 14, color: '#101114' }}>
            Score: <strong>{session.score}</strong>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canJoin && (
            <Link to={session.meetingLink!} target="_blank">
              <Button type="primary" style={{ backgroundColor: '#149e61' }}>
                Join Now
              </Button>
            </Link>
          )}
          
          <Link to={userRole === 'Student' ? `/student/session/${session.id}` : `/tutor/session/${session.id}`}>
            <Button type="primary" ghost>
              Details
            </Button>
          </Link>

          {canProposeChange && (
            <Button
              onClick={() => onProposeChange?.(session.id)}
            >
              Request Reschedule
            </Button>
          )}

          {canCancel && (
            <Button
              danger
              onClick={() => onCancel?.(session.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionCard;
