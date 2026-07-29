import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, InputNumber, Button, Modal, message, Alert } from 'antd';
import { WalletOutlined, LoadingOutlined, HistoryOutlined } from '@ant-design/icons';
import { creditService } from '../../services';
import { Loading } from '../../components/common';
import type { CreditTransaction } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils';

const { Title, Text } = Typography;

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [amount, setAmount] = useState<number>(100000);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        creditService.getBalance(),
        creditService.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      message.error('Không thể tải thông tin ví');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (amount < 10000) {
      message.error('Số tiền nạp tối thiểu là 10,000 VNĐ');
      return;
    }

    setSubmitting(true);
    try {
      await creditService.deposit({ amount, note });
      message.success('Yêu cầu nạp tiền đã được gửi! Vui lòng chờ admin duyệt.');
      setDepositModalVisible(false);
      setAmount(100000);
      setNote('');
      fetchData();
    } catch (error) {
      message.error('Không thể gửi yêu cầu nạp tiền');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; label: string }> = {
          Deposit: { color: 'green', label: 'Nạp tiền' },
          SessionFee: { color: 'purple', label: 'Phí buổi học' },
          LateCancellationFee: { color: 'red', label: 'Phí hủy muộn' },
          Refund: { color: 'blue', label: 'Hoàn tiền' },
        };
        const config = typeMap[type] || { color: 'default', label: type };
        return <span style={{
          padding: '2px 8px',
          backgroundColor: config.color === 'green' ? 'rgba(20, 158, 97, 0.16)' :
                         config.color === 'purple' ? 'rgba(113, 50, 245, 0.16)' :
                         config.color === 'red' ? 'rgba(220, 38, 38, 0.16)' :
                         config.color === 'blue' ? 'rgba(59, 130, 246, 0.16)' : '#f0f0f0',
          color: config.color === 'green' ? '#026b3f' :
                config.color === 'purple' ? '#5b1ecf' :
                config.color === 'red' ? '#b91c1c' :
                config.color === 'blue' ? '#2563eb' : '#666',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
        }}>
          {config.label}
        </span>;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: CreditTransaction) => {
        const isPositive = record.type === 'Deposit' || record.type === 'Refund';
        return (
          <Text style={{ color: isPositive ? '#149e61' : '#dc2626', fontWeight: 600 }}>
            {isPositive ? '+' : '-'}{formatCurrency(Math.abs(amount))}
          </Text>
        );
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => desc || '-',
    },
  ];

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Ví Credit
        </Title>
        <Text type="secondary">Quản lý số dư và lịch sử giao dịch</Text>
      </div>

      {/* Balance Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card 
            variant="borderless" 
            style={{ 
              borderRadius: 12, 
              boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px',
              background: 'linear-gradient(135deg, #7132f5 0%, #5741d8 100%)',
            }}
          >
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Số dư hiện tại</span>}
              value={balance}
              precision={0}
              prefix={<WalletOutlined style={{ color: '#fff' }} />}
              valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 32 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
              <div>
                <Text type="secondary">Nạp thêm Credit</Text>
                <Title level={4} style={{ margin: '4px 0 0' }}>
                  Bắt đầu từ 10,000đ
                </Title>
              </div>
              <Button 
                type="primary" 
                size="large"
                icon={<LoadingOutlined />}
                onClick={() => setDepositModalVisible(true)}
                style={{ borderRadius: 12 }}
              >
                Nạp ngay
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Transaction History */}
      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
        title={
          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <HistoryOutlined /> Lịch sử giao dịch
          </span>
        }
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có giao dịch nào' }}
        />
      </Card>

      {/* Deposit Modal */}
      <Modal
        title="Nạp Credit"
        open={depositModalVisible}
        onCancel={() => setDepositModalVisible(false)}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Nhập số tiền bạn muốn nạp. Yêu cầu sẽ được gửi đến admin để duyệt.
          </Text>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Số tiền (VNĐ)
            </label>
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={10000}
              step={10000}
              value={amount}
              onChange={(value) => setAmount(value || 0)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/,/g, '') as unknown as number}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Ghi chú (tùy chọn)
            </label>
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              placeholder="Nội dung chuyển khoản hoặc ghi chú..."
              value={note}
              onChange={(value) => setNote(value?.toString() || '')}
            />
          </div>

          <Alert
            message="Lưu ý"
            description="Sau khi gửi yêu cầu, vui lòng chờ admin xác nhận. Credit sẽ được cộng vào tài khoản sau khi được duyệt."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => setDepositModalVisible(false)}>Hủy</Button>
            <Button 
              type="primary" 
              loading={submitting}
              onClick={handleDeposit}
              disabled={amount < 10000}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Wallet;
