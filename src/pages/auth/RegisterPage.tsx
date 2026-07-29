import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Alert, Radio, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { authService } from '../../services';
import type { RegisterRequest } from '../../types';

const { Title, Paragraph } = Typography;

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'Student' | 'Tutor'>('Student');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const onFinish = async (values: Omit<RegisterRequest, 'role'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register({
        ...values,
        role,
      } as RegisterRequest);
      
      login(response.user, response.token, response.refreshToken);
      message.success('Đăng ký thành công!');
      
      // Redirect based on role
      switch (role) {
        case 'Student':
          navigate('/student/dashboard');
          break;
        case 'Tutor':
          navigate('/tutor/profile');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        const errors = err.response.data?.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data?.message || 'Dữ liệu không hợp lệ');
        }
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
        Tạo tài khoản mới
      </Title>
      <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: 32 }}>
        Tham gia TutorMatch ngay hôm nay
      </Paragraph>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Role Selection */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ 
          display: 'block', 
          marginBottom: 8, 
          fontWeight: 500,
          color: '#101114',
        }}>
          Bạn là
        </label>
        <Radio.Group 
          value={role} 
          onChange={(e) => setRole(e.target.value)}
          style={{ width: '100%' }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <Radio.Button 
              value="Student" 
              style={{
                flex: 1,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>🎓</div>
                <div>Học sinh</div>
              </div>
            </Radio.Button>
            <Radio.Button 
              value="Tutor" 
              style={{
                flex: 1,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>👨‍🏫</div>
                <div>Gia sư</div>
              </div>
            </Radio.Button>
          </div>
        </Radio.Group>
      </div>

      <Form
        name="register"
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        size="large"
      >
        <Form.Item
          name="fullName"
          rules={[
            { required: true, message: 'Vui lòng nhập họ và tên!' },
            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
          ]}
        >
          <Input 
            prefix={<UserOutlined style={{ color: '#9497a9' }} />}
            placeholder="Họ và tên"
          />
        </Form.Item>

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
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined style={{ color: '#9497a9' }} />}
            placeholder="Mật khẩu"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password 
            prefix={<LockOutlined style={{ color: '#9497a9' }} />}
            placeholder="Xác nhận mật khẩu"
          />
        </Form.Item>

        <Form.Item
          name="terms"
          valuePropName="checked"
          rules={[
            { 
              validator: (_, value) => 
                value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với điều khoản!')) 
            },
          ]}
        >
          <Checkbox>
            Tôi đồng ý với{' '}
            <a href="#terms" style={{ color: '#7132f5' }}>Điều khoản sử dụng</a>
            {' '}và{' '}
            <a href="#privacy" style={{ color: '#7132f5' }}>Chính sách bảo mật</a>
          </Checkbox>
        </Form.Item>

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
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <Paragraph type="secondary" style={{ textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
        Đã có tài khoản?{' '}
        <Link to="/login" style={{ color: '#7132f5', fontWeight: 500 }}>
          Đăng nhập ngay
        </Link>
      </Paragraph>
    </div>
  );
};

export default RegisterPage;
