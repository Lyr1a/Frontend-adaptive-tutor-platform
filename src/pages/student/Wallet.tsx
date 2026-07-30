import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, InputNumber, Input, Button, Modal, message, Alert } from 'antd';
import { WalletOutlined, LoadingOutlined, HistoryOutlined } from '@ant-design/icons';
import { creditService } from '../../services';
import { Loading } from '../../components/common';
import type { CreditTransaction } from '../../types';
import { formatCurrency, formatDateTime, fromLearningCredits } from '../../utils';

const { Title, Text } = Typography;

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [amount, setAmount] = useState<number>(100);
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
      message.error('Unable to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (amount < 10) {
      message.error('The minimum top-up is 10 Learning Credits');
      return;
    }

    setSubmitting(true);
    try {
      await creditService.deposit({ amount: fromLearningCredits(amount), note });
      message.success('Your Learning Credit request has been submitted. Please wait for administrator approval.');
      setDepositModalVisible(false);
      setAmount(100);
      setNote('');
      fetchData();
    } catch (error) {
      message.error('Unable to submit the Learning Credit request');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, { color: string; label: string }> = {
          Deposit: { color: 'green', label: 'Learning Credit Top-up' },
          SessionFee: { color: 'purple', label: 'Session Fee' },
          LateCancellationFee: { color: 'red', label: 'Late Cancellation Fee' },
          Refund: { color: 'blue', label: 'Refund' },
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
      title: 'Learning Credits',
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
      title: 'Description',
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
          Learning Credit Wallet
        </Title>
        <Text type="secondary">Manage your balance and transaction history</Text>
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
              title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Current Learning Credit Balance</span>}
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
                <Text type="secondary">Add Learning Credits</Text>
                <Title level={4} style={{ margin: '4px 0 0' }}>
                  Starting from 10 Credits
                </Title>
              </div>
              <Button 
                type="primary" 
                size="large"
                icon={<LoadingOutlined />}
                onClick={() => setDepositModalVisible(true)}
                style={{ borderRadius: 12 }}
              >
                Top Up Now
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
            <HistoryOutlined /> Transaction History
          </span>
        }
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 720 }}
          locale={{ emptyText: 'No transactions yet' }}
        />
      </Card>

      {/* Deposit Modal */}
      <Modal
        title="Learning Credit Top-up"
        open={depositModalVisible}
        onCancel={() => setDepositModalVisible(false)}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Enter the number of Learning Credits you want to add. Your request will be sent to an administrator for approval.
          </Text>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Learning Credits
            </label>
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={10}
              step={10}
              value={amount}
              onChange={(value) => setAmount(value || 0)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/,/g, '') as unknown as number}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Note (optional)
            </label>
            <Input.TextArea
              style={{ width: '100%' }}
              size="large"
              rows={3}
              maxLength={300}
              showCount
              placeholder="Payment reference or note..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <Alert
            message="Note"
            description="After submitting, please wait for administrator confirmation. Learning Credits will be added after approval."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => setDepositModalVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              loading={submitting}
              onClick={handleDeposit}
              disabled={amount < 10}
            >
              Submit request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Wallet;
