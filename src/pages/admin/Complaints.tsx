import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Modal, Input, Avatar, Empty, Tag, message } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, AlertOutlined } from '@ant-design/icons';
import { adminService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { Complaint, ComplaintType } from '../../types';
import { formatDateTime } from '../../utils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'dismiss'>('resolve');
  const [resolutionAction, setResolutionAction] = useState('');
  const [resolutionReason, setResolutionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const data = await adminService.getPendingComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      message.error('Unable to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolutionAction.trim()) {
      message.warning('Enter the resolution action');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.resolveComplaint(
        selectedComplaint.id, 
        'Warning',
        [resolutionAction, resolutionReason].filter(Boolean).join(' — ')
      );
      message.success('Complaint resolved successfully!');
      setModalVisible(false);
      setSelectedComplaint(null);
      setResolutionAction('');
      setResolutionReason('');
      fetchComplaints();
    } catch (error) {
      message.error('Unable to resolve the complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedComplaint || !resolutionReason.trim()) {
      message.warning('Enter a dismissal reason');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.resolveComplaint(
        selectedComplaint.id,
        'Close',
        resolutionReason
      );
      message.success('Complaint dismissed successfully!');
      setModalVisible(false);
      setSelectedComplaint(null);
      setResolutionReason('');
      fetchComplaints();
    } catch (error) {
      message.error('Unable to dismiss the complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (complaint: Complaint, type: 'resolve' | 'dismiss') => {
    setSelectedComplaint(complaint);
    setActionType(type);
    setModalVisible(true);
  };

  const getComplaintTypeLabel = (type: ComplaintType) => {
    const labels: Record<ComplaintType, string> = {
      LateCancellation: 'Late Cancellation',
      InappropriateBehavior: 'Inappropriate Behavior',
      SessionResultDispute: 'Session Result Dispute',
      Other: 'Fairc',
    };
    return labels[type] || type;
  };

  const getComplaintTypeColor = (type: ComplaintType) => {
    const colors: Record<ComplaintType, string> = {
      LateCancellation: 'orange',
      InappropriateBehavior: 'red',
      SessionResultDispute: 'purple',
      Other: 'default',
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: 'Complainant',
      dataIndex: 'reporterName',
      key: 'reporterName',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#7132f5' }} />
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Respondent',
      dataIndex: 'reportedUserName',
      key: 'reportedUserName',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" icon={<AlertOutlined />} style={{ backgroundColor: '#dc2626' }} />
          <Text>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: ComplaintType) => (
        <Tag color={getComplaintTypeColor(type)}>{getComplaintTypeLabel(type)}</Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
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
      render: (_: any, record: Complaint) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button 
            type="primary"
            icon={<CheckOutlined />}
            size="small"
            style={{ backgroundColor: '#149e61', borderColor: '#149e61' }}
            onClick={() => openModal(record, 'resolve')}
          >
            Resolve
          </Button>
          <Button 
            danger
            icon={<CloseOutlined />}
            size="small"
            onClick={() => openModal(record, 'dismiss')}
          >
            Dismiss
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
          Complaints
        </Title>
        <Text type="secondary">Review and resolve user complaints</Text>
      </div>

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        {complaints.length > 0 ? (
          <Table
            dataSource={complaints}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        ) : (
          <Empty description="There are no complaints awaiting review" />
        )}
      </Card>

      {/* Resolve Modal */}
      <Modal
        title={actionType === 'resolve' ? 'Resolve Complaint' : 'Dismiss Complaint'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedComplaint(null);
          setResolutionAction('');
          setResolutionReason('');
        }}
        footer={null}
      >
        {selectedComplaint && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ 
              padding: 16,
              backgroundColor: 'rgba(113, 50, 245, 0.04)',
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Complainant</Text>
                  <Text strong style={{ display: 'block' }}>{selectedComplaint.reporterName}</Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Respondent</Text>
                  <Text strong style={{ display: 'block' }}>{selectedComplaint.reportedUserName}</Text>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <Tag color={getComplaintTypeColor(selectedComplaint.type)}>
                  {getComplaintTypeLabel(selectedComplaint.type)}
                </Tag>
              </div>
              <Text type="secondary">Description:</Text>
              <p style={{ margin: '4px 0 0' }}>{selectedComplaint.description}</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {actionType === 'resolve' ? 'Resolution Action' : 'Dismissal Reason'} <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <TextArea
                rows={3}
                placeholder={actionType === 'resolve' 
                  ? 'Describe the action you will take...'
                  : 'Enter a reason for dismissing the complaint...'}
                value={actionType === 'resolve' ? resolutionAction : resolutionReason}
                onChange={(e) => {
                  if (actionType === 'resolve') {
                    setResolutionAction(e.target.value);
                  } else {
                    setResolutionReason(e.target.value);
                  }
                }}
              />
            </div>

            {actionType === 'resolve' && (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Additional Notes
                </label>
                <TextArea
                  rows={2}
                  placeholder="Additional notes (optional)..."
                  value={resolutionReason}
                  onChange={(e) => setResolutionReason(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button 
                type="primary" 
                loading={submitting}
                style={{ 
                  backgroundColor: actionType === 'resolve' ? '#149e61' : '#686b82',
                  borderColor: actionType === 'resolve' ? '#149e61' : '#686b82',
                }}
                onClick={actionType === 'resolve' ? handleResolve : handleDismiss}
              >
                {actionType === 'resolve' ? 'Confirm Resolution' : 'Dismiss'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;
