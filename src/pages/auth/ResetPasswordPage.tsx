import React, { useState } from 'react';
import { Button, Form, Input, Typography, message } from 'antd';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services';

const { Title, Paragraph } = Typography;

interface ResetForm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const onFinish = async (values: ResetForm) => {
    setLoading(true);
    try {
      const response = await authService.resetPassword(values);
      message.success(response.message);
      navigate('/login');
    } catch {
      message.error('The password reset code is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center' }}>Reset password</Title>
      <Paragraph type="secondary" style={{ textAlign: 'center' }}>
        Choose a new password for your account.
      </Paragraph>
      <Form<ResetForm>
        layout="vertical"
        size="large"
        initialValues={{ token }}
        onFinish={onFinish}
      >
        <Form.Item name="token" label="Reset code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New password"
          rules={[{ required: true }, { min: 8, message: 'Password must contain at least 8 characters.' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm password"
          dependencies={['newPassword']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                return !value || getFieldValue('newPassword') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error('The passwords do not match.'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Change password
        </Button>
      </Form>
      <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login">Back to sign in</Link>
      </Paragraph>
    </div>
  );
};

export default ResetPasswordPage;
