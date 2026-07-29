import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Avatar, Button, Skeleton, message } from 'antd';
import { 
  WalletOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  SearchOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { creditService, sessionService } from '../../services';
import { Loading, SessionCard, StatusBadge } from '../../components/common';
import type { Session } from '../../types';
import { formatCurrency, getDateRange } from '../../utils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceData, sessionsData] = await Promise.all([
          creditService.getBalance(),
          sessionService.getMySessions(),
        ]);
        setBalance(balanceData);
        setSessions(sessionsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const upcomingSessions = sessions
    .filter(s => s.status === 'Confirmed' || s.status === 'Pending')
    .slice(0, 3);

  const completedSessions = sessions.filter(s => s.status === 'Completed').length;
  const totalSessions = sessions.length;

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Xin chào, {user?.fullName}! 👋
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Chào mừng bạn quay trở lại TutorMatch
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Số dư ví</Text>}
              value={balance}
              precision={0}
              prefix={<WalletOutlined style={{ color: '#7132f5' }} />}
              valueStyle={{ color: '#7132f5', fontWeight: 700 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Link to="/student/wallet">
              <Button type="link" style={{ padding: 0, color: '#7132f5' }}>
                Nạp thêm <RightOutlined style={{ fontSize: 10 }} />
              </Button>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Tổng buổi học</Text>}
              value={totalSessions}
              prefix={<CalendarOutlined style={{ color: '#7132f5' }} />}
              valueStyle={{ color: '#101114', fontWeight: 700 }}
            />
            <Link to="/student/sessions">
              <Button type="link" style={{ padding: 0, color: '#7132f5' }}>
                Xem tất cả <RightOutlined style={{ fontSize: 10 }} />
              </Button>
            </Link>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Buổi đã hoàn thành</Text>}
              value={completedSessions}
              prefix={<ClockCircleOutlined style={{ color: '#149e61' }} />}
              valueStyle={{ color: '#149e61', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Upcoming Sessions */}
        <Col xs={24} lg={16}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>Buổi học sắp tới</span>
                <Link to="/student/sessions">
                  <Button type="link" style={{ padding: 0 }}>Xem tất cả</Button>
                </Link>
              </div>
            }
          >
            {upcomingSessions.length > 0 ? (
              <List
                dataSource={upcomingSessions}
                renderItem={(session) => (
                  <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <Avatar 
                        src={session.tutorAvatar} 
                        icon={<CalendarOutlined />} 
                        style={{ backgroundColor: '#7132f5' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text strong>{session.tutorName}</Text>
                          <StatusBadge status={session.status} size="small" />
                        </div>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {session.subjectName} • {getDateRange(session.startTime, session.endTime)}
                        </Text>
                      </div>
                      <Link to={`/student/session/${session.id}`}>
                        <Button type="primary" ghost size="small">Chi tiết</Button>
                      </Link>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CalendarOutlined style={{ fontSize: 48, color: '#9497a9', marginBottom: 16 }} />
                <Text type="secondary" style={{ display: 'block' }}>
                  Chưa có buổi học nào được đặt
                </Text>
                <Link to="/student/search-tutors">
                  <Button type="primary" style={{ marginTop: 16 }}>
                    Tìm gia sư ngay
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} lg={8}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Thao tác nhanh</span>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link to="/student/search-tutors">
                <Button 
                  block 
                  icon={<SearchOutlined />}
                  style={{ 
                    height: 48, 
                    textAlign: 'left', 
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  Tìm kiếm gia sư
                </Button>
              </Link>
              <Link to="/student/wallet">
                <Button 
                  block 
                  icon={<WalletOutlined />}
                  style={{ 
                    height: 48, 
                    textAlign: 'left', 
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  Nạp Credit
                </Button>
              </Link>
              <Link to="/student/progress">
                <Button 
                  block 
                  icon={<ClockCircleOutlined />}
                  style={{ 
                    height: 48, 
                    textAlign: 'left', 
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  Xem tiến độ học tập
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
