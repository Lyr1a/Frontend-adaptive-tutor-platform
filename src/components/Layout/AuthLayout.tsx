import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Typography } from 'antd';

const { Content } = Layout;
const { Title, Text } = Typography;

export const AuthLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa',
      padding: 24,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 440,
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 40,
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{
            width: 64,
            height: 64,
            backgroundColor: '#7132f5',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#ffffff', fontSize: 32, fontWeight: 700 }}>T</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Title level={2} style={{ 
              margin: 0, 
              color: '#101114',
              fontWeight: 700,
              letterSpacing: '-0.5px',
            }}>
              TutorMatch
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Nền tảng kết nối Học sinh và Gia sư
            </Text>
          </div>
        </div>

        {/* Auth Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px',
          padding: 32,
        }}>
          <Content>
            <Outlet />
          </Content>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 24,
          textAlign: 'center',
        }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            &copy; {new Date().getFullYear()} TutorMatch. Tất cả quyền được bảo lưu.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
