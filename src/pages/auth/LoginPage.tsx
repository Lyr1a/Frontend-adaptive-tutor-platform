import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Alert, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { authService } from '../../services';
import type { LoginRequest } from '../../types';

const { Title, Text, Paragraph } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || null;

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(values);
      login(response.user, response.token, response.refreshToken);
      message.success('Đăng nhập thành công!');
      
      // Redirect based on role
      if (from) {
        navigate(from);
      } else {
        switch (response.user.role) {
          case 'Student':
            navigate('/student/dashboard');
            break;
          case 'Tutor':
            navigate('/tutor/dashboard');
            break;
          case 'Administrator':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Email hoặc mật khẩu không chính xác');
      } else if (err.response?.status === 403) {
        setError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ 
        textAlign: 'center', 
        marginBottom: 8,
        color: '#101114',
        fontWeight: 700,
      }}>
        Chào mừng trở lại
      </Title>
      <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 32 }}>
        Đăng nhập để tiếp tục với TutorMatch
      </Paragraph>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        name="login"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' },
          ]}
        >
          <Input 
            prefix={<MailOutlined style={{ color: '#9497a9' }} />}
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined style={{ color: '#9497a9' }} />}
            placeholder="Mật khẩu"
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" style={{ color: '#7132f5' }}>
            Quên mật khẩu?
          </Link>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{
              height: 48,
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '24px 0' }}>
        <Text type="secondary" style={{ fontSize: 13 }}>Hoặc đăng nhập với</Text>
      </Divider>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button
          icon={<GoogleOutlined />}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Google
        </Button>
        <Button
          icon={<GithubOutlined />}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          GitHub
        </Button>
      </div>

      <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
        Chưa có tài khoản?{' '}
        <Link to="/register" style={{ color: '#7132f5', fontWeight: 500 }}>
          Đăng ký ngay
        </Link>
      </Paragraph>
    </div>
  );
};

export default LoginPage;
