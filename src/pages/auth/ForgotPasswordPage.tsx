import React, { useState } from 'react';
import { Alert, Button, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services';

const { Title, Paragraph } = Typography;

const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string>();
  const navigate = useNavigate();

  const onFinish = async ({ email }: { email: string }) => {
    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      message.success(response.message);
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch {
      message.error('Không thể gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center' }}>Quên mật khẩu</Title>
      <Paragraph type="secondary" style={{ textAlign: 'center' }}>
        Nhập email để nhận hướng dẫn đặt lại mật khẩu.
      </Paragraph>
      {resetToken && (
        <Alert
          type="success"
          showIcon
          message="Đã tạo mã đặt lại mật khẩu (môi trường phát triển)."
          action={
            <Button size="small" onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}>
              Tiếp tục
            </Button>
          }
          style={{ marginBottom: 20 }}
        />
      )}
      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email.' },
            { type: 'email', message: 'Email không hợp lệ.' },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Gửi yêu cầu
        </Button>
      </Form>
      <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </Paragraph>
    </div>
  );
};

export default ForgotPasswordPage;
