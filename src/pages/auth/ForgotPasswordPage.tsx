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
      message.error('Unable to submit the password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center' }}>Forgot password</Title>
      <Paragraph type="secondary" style={{ textAlign: 'center' }}>
        Enter your email to receive password reset instructions.
      </Paragraph>
      {resetToken && (
        <Alert
          type="success"
          showIcon
          message="A password reset code was generated (development environment)."
          action={
            <Button size="small" onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}>
              Continue
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
            { required: true, message: 'Please enter your email.' },
            { type: 'email', message: 'Invalid email address.' },
          ]}
        >
          <Input placeholder="email@example.com" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Submit request
        </Button>
      </Form>
      <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login">Back to sign in</Link>
      </Paragraph>
    </div>
  );
};

export default ForgotPasswordPage;
