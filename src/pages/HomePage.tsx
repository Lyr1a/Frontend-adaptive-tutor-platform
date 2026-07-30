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
      title: 'Find Tutors',
      description: 'Filter by subject, rate, and schedule to find the right match',
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 32, color: '#7132f5' }} />,
      title: 'Easy Booking',
      description: 'Schedule sessions around your learning needs',
    },
    {
      icon: <TeamOutlined style={{ fontSize: 32, color: '#7132f5' }} />,
      title: 'Direct Connection',
      description: 'Communicate and learn through an online platform',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32, color: '#7132f5' }} />,
      title: 'Safe and Secure',
      description: 'The Learning Credit wallet protects both students and tutors',
    },
  ];

  const stats = [
    { value: 1000, suffix: '+', label: 'Qualified Tutors' },
    { value: 5000, suffix: '+', label: 'Completed Sessions' },
    { value: 10, suffix: '', label: 'Subjects Available' },
    { value: 4.8, suffix: '/5', label: 'Average Rating' },
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
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Link to="/login">
                <Button type="text" style={{ fontWeight: 500 }}>Sign in</Button>
              </Link>
              <Link to="/register">
                <Button type="primary">Sign up</Button>
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
          Connecting Tutors and Students
          <br />
          <span style={{ color: '#7132f5' }}>Made Simple</span>
        </Title>
        <Paragraph style={{
          fontSize: 18,
          color: '#686b82',
          maxWidth: 560,
          margin: '0 auto 40px',
        }}>
          An online learning platform that helps you find the right tutor,
          book sessions, and track your learning progress effectively.
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
                Get Started
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
                Learn More
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
            Why Choose TutorMatch?
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Powerful features that make learning easier
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
            Ready to Get Started?
          </Title>
          <Paragraph style={{ 
            color: 'rgba(255, 255, 255, 0.8)', 
            fontSize: 18,
            marginBottom: 32,
          }}>
            Create an account today and start your learning journey
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
              Sign Up for Free
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
          © {new Date().getFullYear()} TutorMatch. All rights reserved.
        </Text>
      </footer>
    </div>
  );
};

export default HomePage;
