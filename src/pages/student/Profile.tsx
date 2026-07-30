import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Avatar, Form, Input, Button, Upload, message, Divider } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores';
import { profileService } from '../../services';
import { Loading } from '../../components/common';
import type { User } from '../../types';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
      });
      setInitialLoading(false);
    }
  }, [user, form]);

  const handleSubmit = async (values: { fullName: string }) => {
    setLoading(true);
    try {
      const updatedUser = await profileService.updateMe(values);
      updateUser(updatedUser);
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          My Profile
        </Title>
        <Text type="secondary">Manage your personal information</Text>
      </div>

      <Row gutter={24}>
        {/* Profile Card */}
        <Col xs={24} lg={8}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', textAlign: 'center' }}
          >
            <div style={{ marginBottom: 16 }}>
              <Avatar 
                size={120} 
                src={user?.avatarUrl} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#7132f5' }}
              />
            </div>
            <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
              {user?.fullName}
            </Title>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              {user?.email}
            </Text>
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              backgroundColor: 'rgba(113, 50, 245, 0.08)',
              borderRadius: 20,
              color: '#7132f5',
              fontWeight: 500,
              fontSize: 13,
            }}>
              Student
            </div>

            <Divider />

            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Email</Text>
                <Text>{user?.email}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Status</Text>
                <Text style={{ color: user?.isSuspended ? '#dc2626' : '#149e61' }}>
                  {user?.isSuspended ? 'Suspended' : 'Active'}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Edit Form */}
        <Col xs={24} lg={16}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Edit Profile</span>}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                fullName: user?.fullName,
                email: user?.email,
              }}
            >
              <Form.Item
                label="Full name"
                name="fullName"
                rules={[
                  { required: true, message: 'Please enter your full name!' },
                  { min: 2, message: 'Full name must contain at least 2 characters!' },
                ]}
              >
                <Input size="large" placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
              >
                <Input size="large" disabled />
              </Form.Item>

              <Divider />

              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button onClick={() => form.resetFields()}>
                    Reset
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>

          {/* Security Section */}
          <Card 
            variant="borderless" 
            style={{ 
              borderRadius: 12, 
              boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px',
              marginTop: 16,
            }}
            title={<span style={{ fontWeight: 600 }}>Security</span>}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>Change password</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
                  Update your password to keep your account secure
                </Text>
              </div>
              <Button onClick={() => navigate('/change-password')}>Change password</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
