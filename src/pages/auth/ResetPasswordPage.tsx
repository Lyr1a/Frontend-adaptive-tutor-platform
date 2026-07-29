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
      message.error('Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ textAlign: 'center' }}>Đặt lại mật khẩu</Title>
      <Paragraph type="secondary" style={{ textAlign: 'center' }}>
        Chọn mật khẩu mới cho tài khoản của bạn.
      </Paragraph>
      <Form<ResetForm>
        layout="vertical"
        size="large"
        initialValues={{ token }}
        onFinish={onFinish}
      >
        <Form.Item name="token" label="Mã đặt lại" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[{ required: true }, { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự.' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          dependencies={['newPassword']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                return !value || getFieldValue('newPassword') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Mật khẩu xác nhận không khớp.'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Đổi mật khẩu
        </Button>
      </Form>
      <Paragraph style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login">Quay lại đăng nhập</Link>
      </Paragraph>
    </div>
  );
};

export default ResetPasswordPage;
