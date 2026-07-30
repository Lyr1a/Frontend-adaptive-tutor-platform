import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Avatar, Form, Input, InputNumber, Button, Select, Divider, message, Alert } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores';
import { profileService, subjectService } from '../../services';
import { Loading } from '../../components/common';
import type { Subject } from '../../types';
import { formatCurrency, fromLearningCredits } from '../../utils';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface SubjectRate {
  subjectId: number;
  hourlyRate: number;
}

const TutorProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const [profileForm] = Form.useForm();
  const [subjectsForm] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectRate[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsData, profileData] = await Promise.all([
        subjectService.getAll(),
        profileService.getMe() as Promise<any>,
      ]);
      
      setSubjects(subjectsData.filter(s => s.isActive));
      setProfile(profileData);
      
      profileForm.setFieldsValue({
        fullName: profileData.fullName,
        bio: profileData.bio || '',
        qualifications: profileData.qualifications || '',
      });

      // The backend stores tutor subjects as JSON with the field name `rate`.
      let existingSubjects = profileData.subjects;
      if (!Array.isArray(existingSubjects) && profileData.subjectsJson) {
        try {
          existingSubjects = JSON.parse(profileData.subjectsJson);
        } catch {
          existingSubjects = [];
        }
      }
      setSelectedSubjects(
        (Array.isArray(existingSubjects) ? existingSubjects : []).map((s: any) => ({
          subjectId: s.subjectId ?? s.SubjectId,
          hourlyRate: s.hourlyRate ?? s.rate ?? s.Rate ?? 0,
        }))
      );

      setInitialLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Unable to load information');
      setInitialLoading(false);
    }
  };

  const handleProfileSubmit = async (values: { fullName: string; bio?: string; qualifications?: string }) => {
    setLoading(true);
    try {
      await profileService.updateTutorProfile({
        bio: values.bio,
        qualifications: values.qualifications,
      });
      
      if (values.fullName !== user?.fullName) {
        await profileService.updateMe({ fullName: values.fullName });
      }
      
      message.success('Profile updated successfully!');
      fetchData();
    } catch (error) {
      message.error('Unable to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (values: { subjectId: number; hourlyRate: number }) => {
    if (selectedSubjects.find(s => s.subjectId === values.subjectId)) {
      message.warning('This subject has already been added!');
      return;
    }

    setSelectedSubjects([
      ...selectedSubjects,
      { ...values, hourlyRate: fromLearningCredits(values.hourlyRate) },
    ]);
    subjectsForm.resetFields();
  };

  const handleRemoveSubject = (subjectId: number) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subjectId !== subjectId));
  };

  const handleSaveSubjects = async () => {
    if (selectedSubjects.length === 0) {
      message.warning('Please add at least one subject!');
      return;
    }

    setLoading(true);
    try {
      await profileService.setTutorSubjects(selectedSubjects);
      message.success('Subjects updated successfully!');
      fetchData();
    } catch (error) {
      message.error('Unable to update subjects');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (id: number) => {
    return subjects.find(s => s.id === id)?.name || `Subject #${id}`;
  };

  const statusConfig = profile?.status === 'Approved'
    ? { label: 'Verified', color: '#149e61', background: 'rgba(20, 154, 97, 0.08)' }
    : profile?.status === 'Rejected'
      ? { label: 'Rejected', color: '#dc2626', background: 'rgba(220, 38, 38, 0.08)' }
      : { label: 'Pending approval', color: '#d97706', background: 'rgba(217, 119, 6, 0.08)' };

  if (initialLoading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Tutor Profile
        </Title>
        <Text type="secondary">Manage your profile and teaching subjects</Text>
      </div>

      {/* Profile Status Alert */}
      {profile?.status === 'Pending' && (
        <Alert
          message="Profile awaiting approval"
          description="Your profile is being reviewed by an administrator. You can accept sessions after approval."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      {profile?.status === 'Rejected' && (
        <Alert
          message="Profile not approved"
          description="Please update your qualifications or teaching subjects and resubmit your profile for review."
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={24}>
        {/* Profile Info */}
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
              backgroundColor: statusConfig.background,
              borderRadius: 20,
              color: statusConfig.color,
              fontWeight: 500,
              fontSize: 13,
            }}>
              {statusConfig.label}
            </div>

            <Divider />

            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Reputation Score</Text>
                <Text strong style={{ color: '#f59e0b' }}>{profile?.reputationScore?.toFixed(1) || 0}/5</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Subject</Text>
                <Text strong>{selectedSubjects.length}</Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Edit Forms */}
        <Col xs={24} lg={16}>
          {/* Bio & Qualifications */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 16 }}
            title={<span style={{ fontWeight: 600 }}>Personal Information</span>}
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
            >
              <Form.Item
                label="Full name"
                name="fullName"
                rules={[{ required: true, message: 'Please enter your full name!' }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Introduction"
                name="bio"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Write a short introduction..."
                />
              </Form.Item>

              <Form.Item
                label="Qualifications & Experience"
                name="qualifications"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Describe your education and teaching experience..."
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button onClick={() => profileForm.resetFields()}>
                    Reset
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save Changes
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>

          {/* Subjects & Rates */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Subjects & Rates</span>}
          >
            <Form
              form={subjectsForm}
              layout="inline"
              onFinish={handleAddSubject}
              style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12 }}
            >
              <Form.Item
                name="subjectId"
                rules={[{ required: true, message: 'Select a subject!' }]}
                style={{ flex: '1 1 240px', marginInlineEnd: 0 }}
              >
                <Select placeholder="Select a subject" size="large">
                  {subjects
                    .filter(s => !selectedSubjects.find(ss => ss.subjectId === s.id))
                    .map(subject => (
                      <Option key={subject.id} value={subject.id}>
                        {subject.name}
                      </Option>
                    ))
                  }
                </Select>
              </Form.Item>

              <Form.Item
                name="hourlyRate"
                rules={[{ required: true, message: 'Enter a rate!' }]}
                style={{ flex: '1 1 180px', marginInlineEnd: 0 }}
              >
                <InputNumber 
                  size="large"
                  placeholder="Learning Credits/hour"
                  min={10}
                  step={10}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/,/g, '') as any}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large">
                Add
              </Button>
            </Form>

            {/* Selected Subjects */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedSubjects.map(subject => (
                <div 
                  key={subject.subjectId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(113, 50, 245, 0.04)',
                    borderRadius: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Text strong>{getSubjectName(subject.subjectId)}</Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                      {formatCurrency(subject.hourlyRate)} / hour
                    </Text>
                  </div>
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveSubject(subject.subjectId)}
                  />
                </div>
              ))}
              
              {selectedSubjects.length === 0 && (
                <Text type="secondary" style={{ textAlign: 'center', padding: 16 }}>
                  No subjects yet. Add a subject above.
                </Text>
              )}
            </div>

            {selectedSubjects.length > 0 && (
              <Button
                type="primary"
                block
                size="large"
                loading={loading}
                onClick={handleSaveSubjects}
                style={{ marginTop: 16, borderRadius: 10 }}
              >
                Save Subjects
              </Button>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TutorProfilePage;
