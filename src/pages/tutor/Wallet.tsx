import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Table, Tag } from 'antd';
import { WalletOutlined, HistoryOutlined } from '@ant-design/icons';
import { creditService } from '../../services';
import { Loading } from '../../components/common';
import type { CreditTransaction } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils';

const { Title, Text } = Typography;

const TutorWallet: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => {
        const isPositive = record.type === 'Deposit' || record.type === 'SessionFee' || record.type === 'Refund';
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
        <Text type="secondary">Theo dõi thu nhập và lịch sử giao dịch</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
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
              valueStyle={{ color: '#fff', fontWeight: 700, fontSize: 40 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

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
    </div>
  );
};

export default TutorWallet;
