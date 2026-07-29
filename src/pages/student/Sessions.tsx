import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Row, Col, Empty, Skeleton, Modal, Form, Input, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { sessionService, subjectService } from '../../services';
import { Loading, SessionCard } from '../../components/common';
import type { Session, SessionChangeType } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const StudentSessions: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Change Request Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [changeType, setChangeType] = useState<SessionChangeType>('Reschedule');
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await sessionService.getMySessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      message.error('Không thể tải danh sách buổi học');
    } finally {
      setLoading(false);
    }
  };

  const upcomingSessions = sessions.filter(s => s.status === 'Pending' || s.status === 'Confirmed');
  const completedSessions = sessions.filter(s => s.status === 'Completed');
  const cancelledSessions = sessions.filter(s => s.status === 'Cancelled');
  const pendingChangeSessions = sessions.filter(s => s.status === 'PendingChangeConfirmation');

  const handleProposeChange = (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setSelectedSession(session);
      setModalVisible(true);
    }
  };

  const handleCancel = async (sessionId: number) => {
    Modal.confirm({
      title: 'Hủy buổi học',
      content: 'Bạn có chắc muốn hủy buổi học này? Phí hủy có thể được áp dụng.',
      okText: 'Hủy buổi học',
      okButtonProps: { danger: true },
      cancelText: 'Không',
      async onOk() {
        try {
          await sessionService.proposeChange(sessionId, {
            changeType: 'Cancel',
            reason: 'Student requested cancellation',
          });
          message.success('Yêu cầu hủy đã được gửi');
          fetchSessions();
        } catch (error) {
          message.error('Không thể hủy buổi học');
        }
      },
    });
  };

  const handleSubmitChange = async (values: { reason?: string; newStartTime?: string; newEndTime?: string }) => {
    if (!selectedSession) return;

    setSubmitting(true);
    try {
      await sessionService.proposeChange(selectedSession.id, {
        changeType,
        reason: values.reason,
        newStartTime: changeType === 'Reschedule' ? values.newStartTime : undefined,
        newEndTime: changeType === 'Reschedule' ? values.newEndTime : undefined,
      });
      message.success('Yêu cầu đã được gửi thành công');
      setModalVisible(false);
      form.resetFields();
      fetchSessions();
    } catch (error) {
      message.error('Không thể gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSessionsList = (sessionList: Session[], emptyText: string) => {
    if (loading) {
      return (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map(i => (
            <Col xs={24} md={12} lg={8} key={i}>
              <Card variant="borderless" style={{ borderRadius: 12 }}>
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      );
    }

    if (sessionList.length === 0) {
      return (
        <Empty 
          description={emptyText} 
          style={{ padding: '48px 0' }}
        />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {sessionList.map(session => (
          <Col xs={24} md={12} lg={8} key={session.id}>
            <SessionCard 
              session={session}
              userRole="Student"
              onProposeChange={handleProposeChange}
              onCancel={handleCancel}
            />
          </Col>
        ))}
      </Row>
    );
  };

  const tabItems = [
    {
      key: 'upcoming',
      label: `Sắp tới (${upcomingSessions.length})`,
      children: renderSessionsList(upcomingSessions, 'Không có buổi học nào sắp tới'),
    },
    {
      key: 'completed',
      label: `Hoàn thành (${completedSessions.length})`,
      children: renderSessionsList(completedSessions, 'Chưa có buổi học hoàn thành'),
    },
    {
      key: 'cancelled',
      label: `Đã hủy (${cancelledSessions.length})`,
      children: renderSessionsList(cancelledSessions, 'Không có buổi học bị hủy'),
    },
    {
      key: 'pending',
      label: `Chờ đổi lịch (${pendingChangeSessions.length})`,
      children: renderSessionsList(pendingChangeSessions, 'Không có yêu cầu đổi lịch'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Lịch học của tôi
        </Title>
        <Text type="secondary">Theo dõi và quản lý các buổi học của bạn</Text>
      </div>

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Change Request Modal */}
      <Modal
        title="Đề xuất thay đổi lịch"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitChange}
        >
          <Form.Item label="Loại thay đổi">
            <Select
              value={changeType}
              onChange={setChangeType}
              size="large"
            >
              <Option value="Reschedule">Đổi lịch</Option>
              <Option value="Cancel">Hủy buổi học</Option>
            </Select>
          </Form.Item>

          {changeType === 'Reschedule' && (
            <>
              <Form.Item
                label="Ngày/giờ mới"
                name="newStartTime"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian mới!' }]}
              >
                <Input type="datetime-local" size="large" />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Lý do"
            name="reason"
            rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}
          >
            <TextArea rows={3} placeholder="Nhập lý do thay đổi lịch..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                style={{
                  padding: '8px 24px',
                  borderRadius: 10,
                  border: '1px solid #dedee5',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '8px 24px',
                  borderRadius: 10,
                  border: 'none',
                  backgroundColor: '#7132f5',
                  color: '#fff',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentSessions;
