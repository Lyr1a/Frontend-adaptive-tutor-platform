import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, List, Avatar, Badge, Skeleton } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { adminService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { DashboardStats } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await adminService.getDashboard();
      setStats({
        totalUsers: data.totalUsers,
        totalTutors: data.totalTutors,
        totalStudents: data.totalStudents,
        totalSessions: data.totalSessions,
        completedSessions: data.completedSessions,
        pendingSessions: data.pendingSessions,
        cancelledSessions: data.cancelledSessions,
        pendingTutorApprovals: data.pendingTutorApprovals,
        pendingCreditRequests: data.pendingCreditRequests,
        pendingComplaints: data.pendingComplaints,
        topSubjects: data.topSubjects?.map(p => ({ 
          name: p.name, 
          count: p.count 
        })) ?? [],
        recentSessions: data.recentSessions?.map(s => ({
          id: s.id,
          tutorId: 0,
          tutorName: '',
          studentId: 0,
          studentName: s.studentName,
          studentAvatar: s.studentAvatar,
          subjectId: 0,
          subjectName: s.subjectName,
          startTime: s.startTime,
          endTime: '',
          status: s.status as any,
        })) ?? [],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullPage />;
  }

  if (!stats) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Tổng quan hệ thống
        </Title>
        <Text type="secondary">Xem nhanh tình trạng hoạt động của nền tảng</Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Người dùng</Text>}
              value={stats.totalUsers}
              prefix={<TeamOutlined style={{ color: '#7132f5' }} />}
              valueStyle={{ color: '#101114', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Gia sư</Text>}
              value={stats.totalTutors}
              prefix={<UserOutlined style={{ color: '#7132f5' }} />}
              valueStyle={{ color: '#101114', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Học sinh</Text>}
              value={stats.totalStudents}
              prefix={<TeamOutlined style={{ color: '#149e61' }} />}
              valueStyle={{ color: '#149e61', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <Statistic
              title={<Text type="secondary">Tổng buổi học</Text>}
              value={stats.totalSessions}
              prefix={<CalendarOutlined style={{ color: '#7132f5' }} />}
              valueStyle={{ color: '#101114', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Session Stats */}
        <Col xs={24} md={12}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Tình trạng buổi học</span>}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#149e61' }}>
                    {stats.completedSessions}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Hoàn thành</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#7132f5' }}>
                    {stats.pendingSessions}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đang chờ</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>
                    {stats.cancelledSessions}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Đã hủy</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Pending Actions */}
        <Col xs={24} md={12}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Cần xử lý</span>}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Link to="/admin/tutors/pending">
                  <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <Badge count={stats.pendingTutorApprovals} size="small" offset={[8, 0]}>
                      <div style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(113, 50, 245, 0.08)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                      }}>
                        <UserOutlined style={{ fontSize: 20, color: '#7132f5' }} />
                      </div>
                    </Badge>
                    <Text style={{ display: 'block', fontSize: 12 }}>Duyệt gia sư</Text>
                  </div>
                </Link>
              </Col>
              <Col span={8}>
                <Link to="/admin/credits/pending">
                  <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <Badge count={stats.pendingCreditRequests} size="small" offset={[8, 0]}>
                      <div style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(20, 154, 97, 0.08)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                      }}>
                        <DollarOutlined style={{ fontSize: 20, color: '#149e61' }} />
                      </div>
                    </Badge>
                    <Text style={{ display: 'block', fontSize: 12 }}>Nạp tiền</Text>
                  </div>
                </Link>
              </Col>
              <Col span={8}>
                <Link to="/admin/complaints">
                  <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                    <Badge count={stats.pendingComplaints} size="small" offset={[8, 0]}>
                      <div style={{
                        width: 48,
                        height: 48,
                        backgroundColor: 'rgba(220, 38, 38, 0.08)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                      }}>
                        <ExclamationCircleOutlined style={{ fontSize: 20, color: '#dc2626' }} />
                      </div>
                    </Badge>
                    <Text style={{ display: 'block', fontSize: 12 }}>Khiếu nại</Text>
                  </div>
                </Link>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Top Subjects */}
        <Col xs={24} lg={12}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Top môn học</span>}
          >
            {stats.topSubjects && stats.topSubjects.length > 0 ? (
              <List
                dataSource={stats.topSubjects.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: index < 3 ? '#7132f5' : '#9497a9',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 12,
                      }}>
                        {index + 1}
                      </div>
                      <Text strong style={{ flex: 1 }}>{item.name}</Text>
                      <Text type="secondary">{item.count} buổi học</Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Text type="secondary">Chưa có dữ liệu</Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Recent Sessions */}
        <Col xs={24} lg={12}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Buổi học gần đây</span>}
          >
            {stats.recentSessions && stats.recentSessions.length > 0 ? (
              <List
                dataSource={stats.recentSessions.slice(0, 5)}
                renderItem={(session) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                      <Avatar 
                        src={session.studentAvatar} 
                        icon={<TeamOutlined />}
                        style={{ backgroundColor: '#7132f5' }}
                      />
                      <div style={{ flex: 1 }}>
                        <Text strong>{session.studentName}</Text>
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                          {session.subjectName}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <StatusBadge status={session.status} size="small" />
                        <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                          {dayjs(session.startTime).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <Text type="secondary">Chưa có buổi học nào</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
