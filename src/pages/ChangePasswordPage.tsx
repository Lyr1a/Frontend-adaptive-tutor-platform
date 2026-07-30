import React, { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Space,
  Typography,
  message,
} from 'antd';
import { KeyOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services';
import { useAuthStore } from '../stores';

const { Title, Paragraph, Text } = Typography;

interface ChangePasswordForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordPage: React.FC = () => {
  const [form] = Form.useForm<ChangePasswordForm>();
  const [requestingToken, setRequestingToken] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [tokenRequested, setTokenRequested] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const requestResetToken = async () => {
    if (!user?.email) {
      message.error('The email address for the signed-in account was not found.');
      return;
    }

    setRequestingToken(true);
    try {
      const response = await authService.forgotPassword({ email: user.email });
      setTokenRequested(true);

      if (response.resetToken) {
        form.setFieldValue('token', response.resetToken);
        message.success('A verification code was generated and filled in automatically.');
      } else {
        message.success(response.message || 'A verification code was sent to your email.');
      }
    } catch {
      message.error('Unable to send the verification code. Please try again.');
    } finally {
      setRequestingToken(false);
    }
  };

  const changePassword = async (values: ChangePasswordForm) => {
    setChangingPassword(true);
    try {
      const response = await authService.resetPassword(values);
      message.success(response.message || 'Password changed successfully. Please sign in again.');
      logout();
      navigate('/login', { replace: true });
    } catch {
      message.error('The verification code is invalid or expired, or the password does not meet the requirements.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <Title level={2} style={{ marginBottom: 4 }}>
        Change password
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        This feature is available to Student, Tutor, and Administrator accounts.
      </Paragraph>

      <Card>
        <Alert
          showIcon
          type="info"
          message="Verify your account before changing your password"
          description="Select “Send verification code”. The code will be emailed to your account or filled automatically in development."
          style={{ marginBottom: 24 }}
        />

        <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 24 }}>
          <Text strong>Account email</Text>
          <Input
            size="large"
            prefix={<MailOutlined />}
            value={user?.email}
            disabled
          />
          <Button
            type="default"
            icon={<KeyOutlined />}
            loading={requestingToken}
            onClick={requestResetToken}
          >
            {tokenRequested ? 'Resend verification code' : 'Send verification code'}
          </Button>
        </Space>

        <Form<ChangePasswordForm>
          form={form}
          layout="vertical"
          size="large"
          onFinish={changePassword}
        >
          <Form.Item
            name="token"
            label="Verification code"
            rules={[{ required: true, whitespace: true, message: 'Please enter the verification code.' }]}
          >
            <Input placeholder="Enter the code sent to your email" autoComplete="one-time-code" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New password"
            rules={[
              { required: true, message: 'Please enter a new password.' },
              { min: 8, message: 'Password must contain at least 8 characters.' },
            ]}
          >
            <Input.Password autoComplete="new-password" placeholder="At least 8 characters" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm new password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue('newPassword') === value
                    ? Promise.resolve()
                    : Promise.reject(new Error('The passwords do not match.'));
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" placeholder="Re-enter new password" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={changingPassword}
            block
          >
            Change password
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
