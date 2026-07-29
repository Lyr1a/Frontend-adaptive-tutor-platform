import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Avatar, Form, Input, InputNumber, Button, Select, Divider, message, Alert } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores';
import { profileService, subjectService } from '../../services';
import { Loading } from '../../components/common';
import type { Subject } from '../../types';

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
          subjectId: s.subjectId,
          hourlyRate: s.hourlyRate ?? s.rate ?? 0,
        }))
      );

      setInitialLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      message.error('Không thể tải thông tin');
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
      
      message.success('Cập nhật hồ sơ thành công!');
      fetchData();
    } catch (error) {
      message.error('Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (values: { subjectId: number; hourlyRate: number }) => {
    if (selectedSubjects.find(s => s.subjectId === values.subjectId)) {
      message.warning('Môn học này đã được thêm!');
      return;
    }

    setSelectedSubjects([...selectedSubjects, values]);
    subjectsForm.resetFields();
  };

  const handleRemoveSubject = (subjectId: number) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subjectId !== subjectId));
  };

  const handleSaveSubjects = async () => {
    if (selectedSubjects.length === 0) {
      message.warning('Vui lòng thêm ít nhất một môn học!');
      return;
    }

    setLoading(true);
    try {
      await profileService.setTutorSubjects(selectedSubjects);
      message.success('Cập nhật môn học thành công!');
      fetchData();
    } catch (error) {
      message.error('Không thể cập nhật môn học');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectName = (id: number) => {
    return subjects.find(s => s.id === id)?.name || 'Unknown';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (initialLoading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Hồ sơ gia sư
        </Title>
        <Text type="secondary">Quản lý thông tin và môn học của bạn</Text>
      </div>

      {/* Profile Status Alert */}
      {profile?.status !== 'Approved' && (
        <Alert
          message="Hồ sơ đang chờ duyệt"
          description="Hồ sơ của bạn đang được admin xem xét. Sau khi được duyệt, bạn sẽ có thể nhận dạy."
          type="warning"
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
              backgroundColor: profile?.status === 'Approved' 
                ? 'rgba(20, 154, 97, 0.08)' 
                : 'rgba(217, 119, 6, 0.08)',
              borderRadius: 20,
              color: profile?.status === 'Approved' ? '#149e61' : '#d97706',
              fontWeight: 500,
              fontSize: 13,
            }}>
              {profile?.status === 'Approved' ? 'Đã xác minh' : 'Chờ duyệt'}
            </div>

            <Divider />

            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text type="secondary">Điểm uy tín</Text>
                <Text strong style={{ color: '#f59e0b' }}>{profile?.reputationScore?.toFixed(1) || 0}/5</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Môn học</Text>
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
            title={<span style={{ fontWeight: 600 }}>Thông tin cá nhân</span>}
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
            >
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Giới thiệu (Bio)"
                name="bio"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Viết vài dòng giới thiệu về bản thân..." 
                />
              </Form.Item>

              <Form.Item
                label="Trình độ & Kinh nghiệm"
                name="qualifications"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Mô tả trình độ học vấn, kinh nghiệm giảng dạy..." 
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <Button onClick={() => profileForm.resetFields()}>
                    Đặt lại
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu thay đổi
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </Card>

          {/* Subjects & Rates */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Môn học & Học phí</span>}
          >
            <Form
              form={subjectsForm}
              layout="inline"
              onFinish={handleAddSubject}
              style={{ marginBottom: 24 }}
            >
              <Form.Item
                name="subjectId"
                rules={[{ required: true, message: 'Chọn môn học!' }]}
                style={{ flex: 1 }}
              >
                <Select placeholder="Chọn môn học" size="large">
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
                rules={[{ required: true, message: 'Nhập học phí!' }]}
                style={{ width: 180 }}
              >
                <InputNumber 
                  size="large"
                  placeholder="Học phí/giờ"
                  min={10000}
                  step={10000}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/,/g, '') as any}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large">
                Thêm
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
                  <div>
                    <Text strong>{getSubjectName(subject.subjectId)}</Text>
                    <Text type="secondary" style={{ marginLeft: 16 }}>
                      {formatCurrency(subject.hourlyRate)} / giờ
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
                  Chưa có môn học nào. Thêm môn học bên trên.
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
                Lưu môn học
              </Button>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TutorProfilePage;
