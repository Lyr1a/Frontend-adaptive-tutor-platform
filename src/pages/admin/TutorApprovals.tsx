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
      message.error('Unable to load tutors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTutor) return;

    setSubmitting(true);
    try {
      await adminService.approveTutor(selectedTutor.id);
      message.success('Tutor approved successfully!');
      setModalVisible(false);
      setSelectedTutor(null);
      fetchTutors();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Unable to approve the tutor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTutor || !rejectReason.trim()) {
      message.warning('Please enter a rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.rejectTutor(selectedTutor.id, rejectReason);
      message.success('Tutor rejected successfully!');
      setModalVisible(false);
      setSelectedTutor(null);
      setRejectReason('');
      fetchTutors();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Unable to reject the tutor');
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
      title: 'Tutor',
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
          {bio || 'No description'}
        </Text>
      ),
    },
    {
      title: 'Qualifications',
      dataIndex: 'qualifications',
      key: 'qualifications',
      render: (qualifications: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 150 }}>
          {qualifications?.substring(0, 50) || 'Not provided'}...
        </Text>
      ),
    },
    {
      title: 'Subjects',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects: TutorProfile['subjects'] = []) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {subjects.length === 0 && <Text type="secondary">Not provided</Text>}
          {subjects.slice(0, 2).map((s) => (
            <Tag key={s.subjectId} color="purple">{s.subjectName}</Tag>
          ))}
          {subjects.length > 2 && <Tag>+{subjects.length - 2}</Tag>}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusBadge status={status} />,
    },
    {
      title: 'Actions',
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
            Approve
          </Button>
          <Button 
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => openModal(record, 'reject')}
          >
            Reject
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
          Tutor Approvals
        </Title>
        <Text type="secondary">Review and approve new tutor profiles</Text>
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
            scroll={{ x: 1050 }}
          />
        ) : (
          <Empty description="There are no tutor profiles awaiting approval" />
        )}
      </Card>

      {/* Approval Modal */}
      <Modal
        title={actionType === 'approve' ? 'Approve Tutor' : 'Reject Tutor'}
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
                <Text>Are you sure you want to approve this tutor profile?</Text>
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Bio:</Text>
                  <Paragraph style={{ marginTop: 4 }}>
                    {selectedTutor.bio || 'No description'}
                  </Paragraph>
                </div>
              </>
            ) : (
              <>
                <Text>Enter a rejection reason:</Text>
                <TextArea
                  rows={3}
                  placeholder="Enter a rejection reason..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button 
                type="primary" 
                loading={submitting}
                style={{ 
                  backgroundColor: actionType === 'approve' ? '#149e61' : '#dc2626',
                  borderColor: actionType === 'approve' ? '#149e61' : '#dc2626',
                }}
                onClick={actionType === 'approve' ? handleApprove : handleReject}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TutorApprovals;
