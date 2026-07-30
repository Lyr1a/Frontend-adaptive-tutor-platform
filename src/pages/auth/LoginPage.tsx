import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Alert, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { authService } from '../../services';
import type { LoginRequest } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface LoginFormValues extends LoginRequest {
  remember?: boolean;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || null;

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
      });
      login(response.user, response.token, response.refreshToken, values.remember === true);
      message.success('Signed in successfully!');
      
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
        setError('Incorrect email or password');
      } else if (err.response?.status === 403) {
        setError('Your account has been suspended. Please contact support.');
      } else {
        setError('Something went wrong. Please try again later.');
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
        Welcome back
      </Title>
      <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 32 }}>
        Sign in to continue to TutorMatch
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
        autoComplete="on"
        initialValues={{ remember: false }}
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Invalid email address!' },
          ]}
        >
          <Input 
            prefix={<MailOutlined style={{ color: '#9497a9' }} />}
            placeholder="Email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please enter your password!' },
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined style={{ color: '#9497a9' }} />}
            placeholder="Password"
            autoComplete="current-password"
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" style={{ color: '#7132f5' }}>
            Forgot password?
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
            Sign in
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '24px 0' }}>
        <Text type="secondary" style={{ fontSize: 13 }}>Or continue with</Text>
      </Divider>

      <div style={{ display: 'flex', gap: 12 }}>
        <Button
          icon={<GoogleOutlined />}
          onClick={() => navigate('/404')}
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
          onClick={() => navigate('/404')}
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
        Don't have an account?{' '}
        <Link to="/register" style={{ color: '#7132f5', fontWeight: 500 }}>
          Sign up now
        </Link>
      </Paragraph>
    </div>
  );
};

export default LoginPage;
