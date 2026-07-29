import React from 'react';
import { Button, Typography, Card, Row, Col, Statistic } from 'antd';
import { 
  SearchOutlined, 
  TeamOutlined, 
  ClockCircleOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores';

const { Title, Paragraph, Text } = Typography;

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  const features = [
    {
      icon: <SearchOutlined style={{ fontSize: 32, color: '#7132f5' }} />,
      title: 'Tìm kiếm gia sư',
      description: 'Lọc theo môn học, mức giá và lịch trình phù hợp với bạn',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#7132f5' }} />,
      title: 'Đặt lịch dễ dàng',
      description: 'Chủ động sắp xếp thời gian học theo nhu cầu của bạn',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: '#7132f5' }} />,
      title: 'Kết nối trực tiếp',
      description: 'Giao tiếp và học tập qua nền tảng trực tuyến',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#7132f5' }} />,
      title: 'An toàn & bảo mật',
      description: 'Hệ thống ví Credit bảo vệ quyền lợi cho cả hai bên',
    },
  ];

  const stats = [
    { value: 1000, suffix: '+', label: 'Gia sư chất lượng' },
    { value: 5000, suffix: '+', label: 'Buổi học hoàn thành' },
    { value: 10, suffix: '', label: 'Môn học đa dạng' },
    { value: 4.8, suffix: '/5', label: 'Đánh giá trung bình' },
  ];

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#ffffff',
        padding: '16px 48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            backgroundColor: '#7132f5',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>T</span>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#101114' }}>TutorMatch</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {isAuthenticated ? (
            <Button
              type="primary"
              onClick={() => {
                if (user?.role === 'Student') navigate('/student/dashboard');
                else if (user?.role === 'Tutor') navigate('/tutor/dashboard');
                else if (user?.role === 'Administrator') navigate('/admin/dashboard');
              }}
            >
              Đi đến Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button type="text" style={{ fontWeight: 500 }}>Đăng nhập</Button>
              </Link>
              <Link to="/register">
                <Button type="primary">Đăng ký</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '80px 48px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
      }}>
        <Title level={1} style={{
          fontSize: 56,
          fontWeight: 700,
          color: '#101114',
          marginBottom: 16,
          letterSpacing: '-1px',
          lineHeight: 1.15,
        }}>
          Kết nối Gia sư & Học sinh
          <br />
          <span style={{ color: '#7132f5' }}>Một cách dễ dàng</span>
        </Title>
        <Paragraph style={{
          fontSize: 18,
          color: '#686b82',
          maxWidth: 560,
          margin: '0 auto 40px',
        }}>
          Nền tảng học tập trực tuyến giúp bạn tìm được gia sư phù hợp, 
          đặt lịch học và theo dõi tiến độ học tập một cách hiệu quả.
        </Paragraph>
        
        {!isAuthenticated && (
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link to="/register">
              <Button 
                type="primary" 
                size="large"
                style={{ 
                  height: 52, 
                  paddingLeft: 32, 
                  paddingRight: 32,
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 12,
                }}
              >
                Bắt đầu ngay
                <ArrowRightOutlined style={{ marginLeft: 8 }} />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                size="large"
                style={{ 
                  height: 52, 
                  paddingLeft: 32, 
                  paddingRight: 32,
                  fontSize: 16,
                  fontWeight: 500,
                  borderRadius: 12,
                }}
              >
                Tìm hiểu thêm
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '48px',
        backgroundColor: 'rgba(113, 50, 245, 0.04)',
      }}>
        <Row gutter={[32, 32]} justify="center">
          {stats.map((stat, index) => (
            <Col xs={12} sm={6} key={index}>
              <Card 
                variant="borderless"
                style={{ 
                  textAlign: 'center', 
                  borderRadius: 12,
                  boxShadow: 'none',
                  backgroundColor: 'transparent',
                }}
              >
                <Statistic 
                  value={stat.value} 
                  suffix={stat.suffix}
                  valueStyle={{ 
                    color: '#7132f5', 
                    fontSize: 36,
                    fontWeight: 700,
                  }}
                />
                <Text type="secondary">{stat.label}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 48px', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title level={2} style={{ fontWeight: 700, marginBottom: 8 }}>
            Tại sao chọn TutorMatch?
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Những tính năng nổi bật giúp việc học tập trở nên dễ dàng hơn
          </Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                variant="borderless"
                style={{ 
                  borderRadius: 12, 
                  height: '100%',
                  boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px',
                }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  backgroundColor: 'rgba(113, 50, 245, 0.08)',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {feature.icon}
                </div>
                <Title level={4} style={{ fontWeight: 600, marginBottom: 8 }}>
                  {feature.title}
                </Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section style={{
          padding: '80px 48px',
          backgroundColor: '#7132f5',
          textAlign: 'center',
        }}>
          <Title level={2} style={{ 
            color: '#ffffff', 
            fontWeight: 700, 
            marginBottom: 16 
          }}>
            Sẵn sàng bắt đầu?
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: 18,
            marginBottom: 32,
          }}>
            Đăng ký ngay hôm nay và bắt đầu hành trình học tập của bạn
          </Paragraph>
          <Link to="/register">
            <Button 
              size="large"
              style={{ 
                height: 52, 
                paddingLeft: 48, 
                paddingRight: 48,
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                backgroundColor: '#ffffff',
                color: '#7132f5',
              }}
            >
              Đăng ký miễn phí
            </Button>
          </Link>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: '32px 48px',
        backgroundColor: '#101114',
        color: '#9497a9',
        textAlign: 'center',
      }}>
        <Text style={{ color: '#9497a9' }}>
          © {new Date().getFullYear()} TutorMatch. Tất cả quyền được bảo lưu.
        </Text>
      </footer>
    </div>
  );
};

export default HomePage;
