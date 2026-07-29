import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Modal, Input, Avatar, Empty, Tag, message } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { adminService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { TutorProfile } from '../../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TutorApprovals: React.FC = () => {
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      const data = await adminService.getPendingTutorProfiles();
      setTutors(data);
    } catch (error) {
      console.error('Failed to fetch tutors:', error);
      message.error('Không thể tải danh sách gia sư');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTutor) return;

    setSubmitting(true);
    try {
      await adminService.approveTutor(selectedTutor.id);
      message.success('Duyệt gia sư thành công!');
      setModalVisible(false);
      setSelectedTutor(null);
      fetchTutors();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể duyệt gia sư');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTutor || !rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.rejectTutor(selectedTutor.id, rejectReason);
      message.success('Từ chối gia sư thành công!');
      setModalVisible(false);
      setSelectedTutor(null);
      setRejectReason('');
      fetchTutors();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Không thể từ chối gia sư');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (tutor: TutorProfile, type: 'approve' | 'reject') => {
    setSelectedTutor(tutor);
    setActionType(type);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Gia sư',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: TutorProfile) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#7132f5' }}
          />
          <div>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              <MailOutlined style={{ marginRight: 4 }} />{record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Bio',
      dataIndex: 'bio',
      key: 'bio',
      render: (bio: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>
          {bio || 'Chưa có mô tả'}
        </Text>
      ),
    },
    {
      title: 'Trình độ',
      dataIndex: 'qualifications',
      key: 'qualifications',
      render: (qualifications: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 150 }}>
          {qualifications?.substring(0, 50) || 'Chưa có'}...
        </Text>
      ),
    },
    {
      title: 'Môn dạy',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects: TutorProfile['subjects'] = []) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {subjects.length === 0 && <Text type="secondary">Chưa khai báo</Text>}
          {subjects.slice(0, 2).map((s) => (
            <Tag key={s.subjectId} color="purple">{s.subjectName}</Tag>
          ))}
          {subjects.length > 2 && <Tag>+{subjects.length - 2}</Tag>}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: TutorProfile) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            style={{ backgroundColor: '#149e61', borderColor: '#149e61' }}
            onClick={() => openModal(record, 'approve')}
          >
            Duyệt
          </Button>
          <Button 
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => openModal(record, 'reject')}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Duyệt gia sư
        </Title>
        <Text type="secondary">Xem xét và duyệt hồ sơ gia sư mới</Text>
      </div>

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        {tutors.length > 0 ? (
          <Table
            dataSource={tutors}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="Không có hồ sơ gia sư nào đang chờ duyệt" />
        )}
      </Card>

      {/* Approval Modal */}
      <Modal
        title={actionType === 'approve' ? 'Duyệt gia sư' : 'Từ chối gia sư'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedTutor(null);
          setRejectReason('');
        }}
        footer={null}
      >
        {selectedTutor && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 16,
              padding: 16,
              backgroundColor: 'rgba(113, 50, 245, 0.04)',
              borderRadius: 12,
            }}>
              <Avatar 
                size={48}
                src={selectedTutor.avatarUrl} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#7132f5' }}
              />
              <div>
                <Text strong style={{ fontSize: 16 }}>{selectedTutor.fullName}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  {selectedTutor.email}
                </Text>
              </div>
            </div>

            {actionType === 'approve' ? (
              <>
                <Text>Bạn có chắc muốn duyệt hồ sơ gia sư này?</Text>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Bio:</Text>
                  <Paragraph style={{ marginTop: 4 }}>
                    {selectedTutor.bio || 'Chưa có mô tả'}
                  </Paragraph>
                </div>
              </>
            ) : (
              <>
                <Text>Nhập lý do từ chối:</Text>
                <TextArea
                  rows={3}
                  placeholder="Nhập lý do từ chối..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button 
                type="primary" 
                loading={submitting}
                style={{ 
                  backgroundColor: actionType === 'approve' ? '#149e61' : '#dc2626',
                  borderColor: actionType === 'approve' ? '#149e61' : '#dc2626',
                }}
                onClick={actionType === 'approve' ? handleApprove : handleReject}
              >
                {actionType === 'approve' ? 'Duyệt' : 'Từ chối'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TutorApprovals;
