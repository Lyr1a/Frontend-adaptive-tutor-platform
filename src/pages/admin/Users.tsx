import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Button, Input, Avatar, Modal, Tag, message, Space } from 'antd';
import { SearchOutlined, UserOutlined, LockOutlined, StopOutlined } from '@ant-design/icons';
import { adminService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { AdminUser, UserRole } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Users: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'kick'>('suspend');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await adminService.suspendUser(selectedUser.id, reason);
      message.success('Đã khóa tài khoản thành công!');
      setModalVisible(false);
      setSelectedUser(null);
      setReason('');
      fetchUsers();
    } catch (error) {
      message.error('Không thể khóa tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKick = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await adminService.kickUser(selectedUser.id, reason);
      message.success('Đã xóa tài khoản thành công!');
      setModalVisible(false);
      setSelectedUser(null);
      setReason('');
      fetchUsers();
    } catch (error) {
      message.error('Không thể xóa tài khoản');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (user: AdminUser, type: 'suspend' | 'kick') => {
    setSelectedUser(user);
    setActionType(type);
    setModalVisible(true);
  };

  const getRoleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = {
      Student: 'Học sinh',
      Tutor: 'Gia sư',
      Administrator: 'Quản trị',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      Student: 'blue',
      Tutor: 'purple',
      Administrator: 'green',
    };
    return colors[role] || 'default';
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: AdminUser) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />}
            style={{ backgroundColor: record.isSuspended ? '#dc2626' : '#7132f5' }}
          />
          <div>
            <Text strong style={{ color: record.isSuspended ? '#dc2626' : '#101114' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>{getRoleLabel(role)}</Tag>
      ),
    },
    {
      title: 'Credit',
      dataIndex: 'creditBalance',
      key: 'creditBalance',
      render: (balance: number) => (
        <Text strong style={{ color: '#7132f5' }}>
          {formatCurrency(balance)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_: any, record: AdminUser) => (
        record.isSuspended 
          ? <StatusBadge status="Suspended" />
          : <StatusBadge status="Active" />
      ),
    },
    {
      title: 'Tutor Profile',
      key: 'tutorProfile',
      render: (_: any, record: AdminUser) => {
        if (record.role !== 'Tutor') return '-';
        if (!record.tutorProfile) return '-';
        return (
          <Space direction="vertical" size={0}>
            <StatusBadge status={record.tutorProfile.status} size="small" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Điểm: {record.tutorProfile.reputationScore.toFixed(1)}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: AdminUser) => (
        <Space>
          <Button 
            type="text"
            icon={<LockOutlined />}
            size="small"
            danger={!record.isSuspended}
            onClick={() => openModal(record, 'suspend')}
            disabled={record.role === 'Administrator'}
          >
            {record.isSuspended ? 'Mở khóa' : 'Khóa'}
          </Button>
          <Button 
            type="text"
            danger
            icon={<StopOutlined />}
            size="small"
            onClick={() => openModal(record, 'kick')}
            disabled={record.role === 'Administrator'}
          >
            Xóa
          </Button>
        </Space>
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
          Quản lý người dùng
        </Title>
        <Text type="secondary">Xem và quản lý tất cả người dùng trên nền tảng</Text>
      </div>

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            prefix={<SearchOutlined style={{ color: '#9497a9' }} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 300, borderRadius: 10 }}
          />
        </div>

        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Suspend/Kick Modal */}
      <Modal
        title={actionType === 'suspend' ? 'Khóa tài khoản' : 'Xóa tài khoản'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedUser(null);
          setReason('');
        }}
        footer={null}
      >
        {selectedUser && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              marginBottom: 16,
              padding: 16,
              backgroundColor: 'rgba(220, 38, 38, 0.04)',
              borderRadius: 12,
            }}>
              <Avatar 
                size={48}
                src={selectedUser.avatarUrl} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#dc2626' }}
              />
              <div>
                <Text strong style={{ fontSize: 16 }}>{selectedUser.fullName}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                  {selectedUser.email}
                </Text>
              </div>
            </div>

            <div style={{ 
              padding: 16, 
              backgroundColor: actionType === 'kick' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(217, 119, 6, 0.08)',
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <Text style={{ color: actionType === 'kick' ? '#dc2626' : '#b45309' }}>
                {actionType === 'kick' 
                  ? 'Cảnh báo: Xóa tài khoản là hành động không thể hoàn tác. Tài khoản sẽ bị vô hiệu hóa vĩnh viễn.'
                  : 'Khóa tài khoản sẽ ngăn cản người dùng đăng nhập. Bạn có thể mở khóa sau.'
                }
              </Text>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Lý do <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <TextArea
                rows={3}
                placeholder="Nhập lý do..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button 
                type="primary" 
                danger
                loading={submitting}
                onClick={actionType === 'suspend' ? handleSuspend : handleKick}
              >
                {actionType === 'suspend' ? 'Khóa tài khoản' : 'Xóa tài khoản'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
