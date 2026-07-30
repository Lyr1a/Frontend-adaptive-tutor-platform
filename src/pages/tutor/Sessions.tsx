import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Row, Col, Empty, Skeleton, Modal, Form, Input, Select, message, Tag, Avatar, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { sessionService } from '../../services';
import { StatusBadge } from '../../components/common';
import type { Session, SessionChangeType } from '../../types';
import { getDateRange } from '../../utils';
import { TeamOutlined, CalendarOutlined, VideoCameraOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TutorSessions: React.FC = () => {
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
      message.error('Unable to load teaching sessions');
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
      title: 'Cancel Teaching Session',
      content: 'Are you sure you want to cancel this teaching session?',
      okText: 'Cancel Teaching Session',
      okButtonProps: { danger: true },
      cancelText: 'No',
      async onOk() {
        try {
          await sessionService.proposeChange(sessionId, {
            changeType: 'Cancel',
            reason: 'Tutor requested cancellation',
          });
          message.success('Cancellation request submitted');
          fetchSessions();
        } catch (error) {
          message.error('Unable to cancel the teaching session');
        }
      },
    });
  };

  const handleSubmitChange = async (values: { reason?: string; newStartTime?: string; newEndTime?: string }) => {
    if (!selectedSession) return;

    setSubmitting(true);
    try {
      const durationMinutes = dayjs(selectedSession.endTime).diff(
        dayjs(selectedSession.startTime),
        'minute'
      );
      const newStartTime = values.newStartTime
        ? dayjs(values.newStartTime).toISOString()
        : undefined;
      const newEndTime = values.newStartTime
        ? dayjs(values.newStartTime).add(durationMinutes, 'minute').toISOString()
        : undefined;

      await sessionService.proposeChange(selectedSession.id, {
        changeType,
        reason: values.reason,
        newStartTime: changeType === 'Reschedule' ? newStartTime : undefined,
        newEndTime: changeType === 'Reschedule' ? newEndTime : undefined,
      });
      message.success('Request submitted successfully');
      setModalVisible(false);
      form.resetFields();
      fetchSessions();
    } catch (error) {
      message.error('Unable to submit the request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSessionCard = (session: Session) => (
    <Card 
      key={session.id}
      variant="borderless"
      style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar 
            src={session.studentAvatar} 
            icon={<TeamOutlined />} 
            style={{ backgroundColor: '#7132f5' }}
          />
          <div>
            <Text strong style={{ fontSize: 16 }}>{session.studentName}</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tag color="purple">{session.subjectName}</Tag>
              <StatusBadge status={session.status} size="small" />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <CalendarOutlined style={{ color: '#686b82' }} />
        <Text type="secondary">{getDateRange(session.startTime, session.endTime)}</Text>
      </div>

      {session.meetingLink && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <VideoCameraOutlined style={{ color: '#686b82' }} />
          <Text style={{ color: '#7132f5' }}>Online meeting link available</Text>
        </div>
      )}

      {session.score !== undefined && session.score !== null && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary">Score: </Text>
          <Text strong>{session.score}/10</Text>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button
          type="primary"
          onClick={() => navigate(`/tutor/session/${session.id}`)}
        >
          Details
        </Button>

        {session.meetingLink && session.canJoin && (
          <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
            <Button type="primary" style={{ backgroundColor: '#149e61' }}>
              Join
            </Button>
          </a>
        )}

        {session.status === 'Confirmed' && (
          <>
            <Button
              onClick={() => handleProposeChange(session.id)}
            >
              Reschedule
            </Button>
            <Button
              danger
              onClick={() => handleCancel(session.id)}
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </Card>
  );

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
        <Empty description={emptyText} style={{ padding: '48px 0' }} />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {sessionList.map(renderSessionCard)}
      </Row>
    );
  };

  const tabItems = [
    {
      key: 'upcoming',
      label: `Upcoming (${upcomingSessions.length})`,
      children: renderSessionsList(upcomingSessions, 'No upcoming teaching sessions'),
    },
    {
      key: 'completed',
      label: `Completed (${completedSessions.length})`,
      children: renderSessionsList(completedSessions, 'No completed teaching sessions yet'),
    },
    {
      key: 'cancelled',
      label: `Cancelled (${cancelledSessions.length})`,
      children: renderSessionsList(cancelledSessions, 'No cancelled teaching sessions'),
    },
    {
      key: 'pending',
      label: `Awaiting Reschedule (${pendingChangeSessions.length})`,
      children: renderSessionsList(pendingChangeSessions, 'No reschedule requests'),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          My Teaching Sessions
        </Title>
        <Text type="secondary">Manage your teaching sessions</Text>
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
        title="Request a Schedule Change"
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
          <Form.Item label="Change Type">
            <Select
              value={changeType}
              onChange={setChangeType}
              size="large"
            >
              <Option value="Reschedule">Reschedule</Option>
              <Option value="Cancel">Cancel Teaching Session</Option>
            </Select>
          </Form.Item>

          {changeType === 'Reschedule' && (
            <Form.Item
              label="New Date and Time"
              name="newStartTime"
              rules={[{ required: true, message: 'Please select a new date and time!' }]}
            >
              <Input type="datetime-local" size="large" />
            </Form.Item>
          )}

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please enter a reason!' }]}
          >
            <TextArea rows={3} placeholder="Enter a reason for the schedule change..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
              >
                Submit request
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TutorSessions;
