import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Modal, Input, InputNumber, Avatar, Empty, message, Tag } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { adminService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { CreditRequest } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreditRequests: React.FC = () => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectReason, setRejectReason] = useState('');
  const [adjustedAmount, setAdjustedAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await adminService.getPendingCredits();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch credit requests:', error);
      message.error('Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      await adminService.approveCredit(selectedRequest.id);
      message.success('Duyệt yêu cầu thành công!');
      setModalVisible(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      message.error('Không thể duyệt yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      await adminService.rejectCredit(selectedRequest.id, rejectReason);
      message.success('Từ chối yêu cầu thành công!');
      setModalVisible(false);
      setSelectedRequest(null);
      setRejectReason('');
      fetchRequests();
    } catch (error) {
      message.error('Không thể từ chối yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (request: CreditRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    setAdjustedAmount(request.amount);
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text: string, record: CreditRequest) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7132f5' }} />
          <div>
            <Text strong>{text}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.userEmail}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#149e61', fontSize: 16 }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note: string) => (
        <Text type="secondary" ellipsis style={{ maxWidth: 200 }}>
          {note || '-'}
        </Text>
      ),
    },
    {
      title: 'Ngày yêu cầu',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
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
      render: (_: any, record: CreditRequest) => (
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
          Yêu cầu nạp tiền
        </Title>
        <Text type="secondary">Xem xét và duyệt các yêu cầu nạp Credit</Text>
      </div>

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        {requests.length > 0 ? (
          <Table
            dataSource={requests}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="Không có yêu cầu nạp tiền nào đang chờ duyệt" />
        )}
      </Card>

      {/* Approval/Rejection Modal */}
      <Modal
        title={actionType === 'approve' ? 'Duyệt yêu cầu nạp tiền' : 'Từ chối yêu cầu'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedRequest(null);
          setRejectReason('');
        }}
        footer={null}
      >
        {selectedRequest && (
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
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#7132f5' }} />
              <div>
                <Text strong style={{ fontSize: 16 }}>{selectedRequest.userName}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  {selectedRequest.userEmail}
                </Text>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">Số tiền yêu cầu:</Text>
              <Text strong style={{ fontSize: 24, color: '#149e61', marginLeft: 8 }}>
                {formatCurrency(selectedRequest.amount)}
              </Text>
            </div>

            {selectedRequest.note && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">Ghi chú:</Text>
                <div style={{ marginTop: 4 }}>{selectedRequest.note}</div>
              </div>
            )}

            {actionType === 'approve' ? (
              <>
                <Text>Bạn có chắc muốn duyệt yêu cầu nạp tiền này?</Text>
              </>
            ) : (
              <>
                <Text>Nhập lý do từ chối:</Text>
                <TextArea
                  rows={3}
                  placeholder="Nhập lý do..."
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

export default CreditRequests;
