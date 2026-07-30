import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Avatar, Button, Input, Form, InputNumber, Divider, message, Modal, Tag } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, VideoCameraOutlined, TeamOutlined, EditOutlined } from '@ant-design/icons';
import { sessionService, progressService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { Session } from '../../types';
import { getDateRange } from '../../utils';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TutorSessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Meeting Link Modal
  const [meetingLinkModalVisible, setMeetingLinkModalVisible] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [submittingLink, setSubmittingLink] = useState(false);

  // Record Result Modal
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [score, setScore] = useState<number>(8);
  const [comment, setComment] = useState('');
  const [submittingResult, setSubmittingResult] = useState(false);

  useEffect(() => {
    fetchSessionData();
  }, [id]);

  const fetchSessionData = async () => {
    if (!id) return;
    
    try {
      const data = await sessionService.getById(Number(id));
      setSession(data);
      setMeetingLink(data.meetingLink || '');
    } catch (error) {
      console.error('Failed to fetch session:', error);
      message.error('Unable to load teaching session details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeetingLink = async () => {
    if (!session) return;
    const normalizedLink = meetingLink.trim();
    try {
      const url = new URL(normalizedLink);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      message.warning('Enter a valid link beginning with http:// or https://');
      return;
    }

    setSubmittingLink(true);
    try {
      await sessionService.updateMeetingLink(session.id, normalizedLink);
      message.success('Meeting link updated successfully!');
      setMeetingLinkModalVisible(false);
      fetchSessionData();
    } catch (error) {
      message.error('Unable to update meeting link');
    } finally {
      setSubmittingLink(false);
    }
  };

  const handleRecordResult = async () => {
    if (!session) return;

    setSubmittingResult(true);
    try {
      await progressService.recordResult({
        sessionId: session.id,
        score,
        tutorComment: comment,
      });
      message.success('Result recorded successfully!');
      setResultModalVisible(false);
      fetchSessionData();
    } catch (error) {
      message.error('Unable to record the result');
    } finally {
      setSubmittingResult(false);
    }
  };

  if (loading) {
    return <Loading fullPage />;
  }

  if (!session) {
    return (
      <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
        <Title level={4}>Teaching session not found</Title>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </Card>
    );
  }

  const canUpdateMeetingLink = session.status === 'Confirmed' || session.status === 'Pending';
  const canRecordResult =
    session.status === 'Completed' &&
    (session.score === undefined || session.score === null);

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>

      <Row gutter={24}>
        {/* Main Info */}
        <Col xs={24} lg={16}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 16 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <Title level={3} style={{ margin: 0, marginBottom: 8 }}>
                  {session.subjectName}
                </Title>
                <StatusBadge status={session.status} />
              </div>
            </div>

            <Divider />

            {/* Student Info */}
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Student</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar 
                  size={48} 
                  src={session.studentAvatar} 
                  icon={<TeamOutlined />}
                  style={{ backgroundColor: '#7132f5' }}
                />
                <div>
                  <Text strong style={{ fontSize: 16 }}>{session.studentName}</Text>
                </div>
              </div>
            </div>

            <Divider />

            {/* Session Time */}
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Time</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CalendarOutlined style={{ color: '#7132f5' }} />
                <Text style={{ fontSize: 16 }}>
                  {getDateRange(session.startTime, session.endTime)}
                </Text>
              </div>
            </div>

            {/* Meeting Link */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text type="secondary">Online Meeting Link</Text>
                {canUpdateMeetingLink && (
                  <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={() => setMeetingLinkModalVisible(true)}
                  >
                    Update
                  </Button>
                )}
              </div>
              {session.meetingLink ? (
                <a 
                  href={session.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    padding: '12px 16px',
                    backgroundColor: 'rgba(20, 154, 97, 0.08)',
                    borderRadius: 10,
                    color: '#149e61',
                  }}
                >
                  <VideoCameraOutlined style={{ fontSize: 18 }} />
                  <Text strong>{session.meetingLink}</Text>
                </a>
              ) : (
                <Tag color="default">No meeting link</Tag>
              )}
            </div>

            {/* Result (if completed) */}
            {session.status === 'Completed' && (
              <>
                <Divider />
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Recorded Result</Text>
                  {session.score !== undefined && session.score !== null ? (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Score: </Text>
                        <Text style={{ fontSize: 24, fontWeight: 700, color: '#7132f5' }}>
                          {session.score}/10
                        </Text>
                      </div>
                      {session.tutorComment && (
                        <Paragraph style={{ color: '#686b82' }}>
                          <strong>Comment:</strong> {session.tutorComment}
                        </Paragraph>
                      )}
                      {session.goalCompletionPercentage !== undefined && (
                        <div>
                          <Text type="secondary">Goal Progress: </Text>
                          <Text>{session.goalCompletionPercentage}%</Text>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Tag color="warning">No result recorded</Tag>
                  )}
                </div>
              </>
            )}

            {/* Record Result Button */}
            {canRecordResult && (
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setResultModalVisible(true)}
                style={{ marginTop: 24, borderRadius: 12 }}
              >
                Record Session Result
              </Button>
            )}
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Quick Actions */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 16 }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>Quick Actions</Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {session.meetingLink && session.canJoin && (
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Button type="primary" block style={{ borderRadius: 10 }} icon={<VideoCameraOutlined />}>
                    Join Session
                  </Button>
                </a>
              )}
              
              {canUpdateMeetingLink && !session.meetingLink && (
                <Button 
                  block 
                  style={{ borderRadius: 10 }}
                  onClick={() => setMeetingLinkModalVisible(true)}
                >
                  Add Online Meeting Link
                </Button>
              )}
            </div>
          </Card>

          {/* Session Info */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>Teaching Session Details</Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Subject</Text>
                <div style={{ 
                  padding: '8px 12px', 
                  backgroundColor: 'rgba(113, 50, 245, 0.08)', 
                  borderRadius: 8,
                  color: '#7132f5',
                  fontWeight: 500,
                }}>
                  {session.subjectName}
                </div>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Request Date</Text>
                <div style={{ fontSize: 14 }}>
                  {dayjs(session.startTime).format('MMM D, YYYY')}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Meeting Link Modal */}
      <Modal
        title="Update Online Meeting Link"
        open={meetingLinkModalVisible}
        onCancel={() => setMeetingLinkModalVisible(false)}
        onOk={handleUpdateMeetingLink}
        confirmLoading={submittingLink}
        okText="Update"
      >
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Online Meeting Link (Google Meet, Zoom, etc.)
          </label>
          <Input
            size="large"
            placeholder="https://meet.google.com/..."
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            onPressEnter={handleUpdateMeetingLink}
          />
        </div>
      </Modal>

      {/* Record Result Modal */}
      <Modal
        title="Record Session Result"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Score (1-10)
            </label>
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={1}
              max={10}
              value={score}
              onChange={(value) => setScore(value || 1)}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Comment
            </label>
            <TextArea
              rows={4}
              placeholder="Add comments about the session..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => setResultModalVisible(false)}>Cancel</Button>
            <Button 
              type="primary" 
              loading={submittingResult}
              onClick={handleRecordResult}
            >
              Record Result
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TutorSessionDetail;
