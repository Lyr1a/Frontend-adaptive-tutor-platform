import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Avatar, Button, Badge, Alert, Empty } from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  TeamOutlined,
  StarOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { sessionService, profileService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { Session, TutorProfile } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const TutorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoadError(false);
      const [sessionsData, profileData] = await Promise.all([
        sessionService.getMySessions(),
        profileService.getMe() as any,
      ]);
      setSessions(sessionsData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullPage />;
  }

  const today = dayjs().startOf('day');
  const todaySessions = sessions.filter(s => 
    dayjs(s.startTime).isSame(today, 'day') &&
    (s.status === 'Confirmed' || s.status === 'Pending')
  );
  
  const upcomingSessions = sessions
    .filter(s =>
      (s.status === 'Confirmed' || s.status === 'Pending') &&
      dayjs(s.endTime).isAfter(dayjs())
    )
    .sort((a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf())
    .slice(0, 5);

  const pendingChangeRequests = sessions.filter(s => s.status === 'PendingChangeConfirmation');
  const completedCount = sessions.filter(s => s.status === 'Completed').length;
  const totalStudents = new Set(sessions.map(s => s.studentId).filter(id => id > 0)).size;

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Welcome, {user?.fullName}! 👨‍🏫
        </Title>
        <Text type="secondary">
          {profile?.status === 'Approved' 
            ? 'Your profile has been verified'
            : 'Your profile is awaiting approval'}
        </Text>
      </div>

      {loadError && (
        <Alert
          type="error"
          showIcon
          message="Unable to load all dashboard data"
          description="Please check the API connection and reload the page."
          action={<Button onClick={fetchData}>Try Again</Button>}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Today</Text>}
              value={todaySessions.length}
              prefix={<CalendarOutlined style={{ color: '#7132f5' }} />}
              valueStyle={{ color: '#7132f5', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Total Students</Text>}
              value={totalStudents}
              prefix={<TeamOutlined style={{ color: '#7132f5' }} />}
              valueStyle={{ color: '#101114', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Completed</Text>}
              value={completedCount}
              prefix={<ClockCircleOutlined style={{ color: '#149e61' }} />}
              valueStyle={{ color: '#149e61', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Reputation Score</Text>}
              value={profile?.reputationScore || 0}
              precision={1}
              prefix={<StarOutlined style={{ color: '#f59e0b' }} />}
              valueStyle={{ color: '#f59e0b', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Today's Sessions */}
        <Col xs={24} lg={16}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Today Teaching Sessions</span>
                <Badge count={todaySessions.length} style={{ backgroundColor: '#7132f5' }} />
              </div>
            }
            extra={<Link to="/tutor/sessions"><Button type="link">View All</Button></Link>}
          >
            {todaySessions.length > 0 ? (
              <List
                dataSource={todaySessions}
                renderItem={(session) => (
                  <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <Avatar 
                        src={session.studentAvatar} 
                        icon={<TeamOutlined />} 
                        style={{ backgroundColor: '#7132f5' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text strong>{session.studentName}</Text>
                          <StatusBadge status={session.status} size="small" />
                        </div>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {session.subjectName} • {dayjs(session.startTime).format('HH:mm')} - {dayjs(session.endTime).format('HH:mm')}
                        </Text>
                      </div>
                      {session.meetingLink && session.canJoin && (
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                          <Button type="primary" ghost size="small" icon={<VideoCameraOutlined />}>
                            Join
                          </Button>
                        </a>
                      )}
                      <Link to={`/tutor/session/${session.id}`}>
                        <Button type="primary" size="small">Details</Button>
                      </Link>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No teaching sessions today" />
            )}
          </Card>
        </Col>

        {/* Pending Change Requests */}
        <Col xs={24} lg={8}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 600 }}>Reschedule Requests</span>
                {pendingChangeRequests.length > 0 && (
                  <Badge count={pendingChangeRequests.length} style={{ backgroundColor: '#d97706' }} />
                )}
              </div>
            }
          >
            {pendingChangeRequests.length > 0 ? (
              <List
                size="small"
                dataSource={pendingChangeRequests.slice(0, 3)}
                renderItem={(session) => (
                  <List.Item>
                    <div>
                      <Text strong>{session.studentName}</Text>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        {session.subjectName}
                      </Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <Text type="secondary">No requests</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', cursor: 'pointer' }}
            onClick={() => navigate('/tutor/schedule')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(113, 50, 245, 0.08)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ClockCircleOutlined style={{ fontSize: 24, color: '#7132f5' }} />
              </div>
              <div>
                <Text strong>Manage Availability</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                  Update when you are available to teach
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', cursor: 'pointer' }}
            onClick={() => navigate('/tutor/sessions')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(20, 154, 97, 0.08)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CalendarOutlined style={{ fontSize: 24, color: '#149e61' }} />
              </div>
              <div>
                <Text strong>View Teaching Sessions</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                  All teaching sessions
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', cursor: 'pointer' }}
            onClick={() => navigate('/tutor/students')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TeamOutlined style={{ fontSize: 24, color: '#f59e0b' }} />
              </div>
              <div>
                <Text strong>Student List</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                  Students you have taught
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TutorDashboard;
