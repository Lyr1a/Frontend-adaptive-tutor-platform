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
  const [completionPercent, setCompletionPercent] = useState<number>(100);
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
      message.error('Không thể tải thông tin buổi dạy');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeetingLink = async () => {
    if (!session) return;

    setSubmittingLink(true);
    try {
      await sessionService.updateMeetingLink(session.id, meetingLink);
      message.success('Cập nhật link thành công!');
      setMeetingLinkModalVisible(false);
      fetchSessionData();
    } catch (error) {
      message.error('Không thể cập nhật link');
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
        goalCompletionPercentage: completionPercent,
      });
      message.success('Ghi nhận kết quả thành công!');
      setResultModalVisible(false);
      fetchSessionData();
    } catch (error) {
      message.error('Không thể ghi nhận kết quả');
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
        <Title level={4}>Không tìm thấy buổi dạy</Title>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const canUpdateMeetingLink = session.status === 'Confirmed' || session.status === 'Pending';
  const canRecordResult = session.status === 'Completed' && !session.score;

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
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
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Học sinh</Text>
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
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Thời gian</Text>
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
                <Text type="secondary">Link học trực tuyến</Text>
                {canUpdateMeetingLink && (
                  <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={() => setMeetingLinkModalVisible(true)}
                  >
                    Cập nhật
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
                <Tag color="default">Chưa có link</Tag>
              )}
            </div>

            {/* Result (if completed) */}
            {session.status === 'Completed' && (
              <>
                <Divider />
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Kết quả đã ghi nhận</Text>
                  {session.score !== undefined && session.score !== null ? (
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>Điểm số: </Text>
                        <Text style={{ fontSize: 24, fontWeight: 700, color: '#7132f5' }}>
                          {session.score}/10
                        </Text>
                      </div>
                      {session.tutorComment && (
                        <Paragraph style={{ color: '#686b82' }}>
                          <strong>Nhận xét:</strong> {session.tutorComment}
                        </Paragraph>
                      )}
                      {session.goalCompletionPercentage !== undefined && (
                        <div>
                          <Text type="secondary">Tiến độ mục tiêu: </Text>
                          <Text>{session.goalCompletionPercentage}%</Text>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Tag color="warning">Chưa ghi nhận kết quả</Tag>
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
                Ghi nhận kết quả buổi học
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
            <Title level={5} style={{ marginBottom: 16 }}>Thao tác nhanh</Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {session.meetingLink && canUpdateMeetingLink && (
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Button type="primary" block style={{ borderRadius: 10 }} icon={<VideoCameraOutlined />}>
                    Tham gia buổi học
                  </Button>
                </a>
              )}
              
              {canUpdateMeetingLink && !session.meetingLink && (
                <Button 
                  block 
                  style={{ borderRadius: 10 }}
                  onClick={() => setMeetingLinkModalVisible(true)}
                >
                  Thêm link học trực tuyến
                </Button>
              )}
            </div>
          </Card>

          {/* Session Info */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>Thông tin buổi dạy</Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Môn học</Text>
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
                <Text type="secondary" style={{ fontSize: 12 }}>Ngày tạo yêu cầu</Text>
                <div style={{ fontSize: 14 }}>
                  {dayjs(session.startTime).format('DD/MM/YYYY')}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Meeting Link Modal */}
      <Modal
        title="Cập nhật link học trực tuyến"
        open={meetingLinkModalVisible}
        onCancel={() => setMeetingLinkModalVisible(false)}
        onOk={handleUpdateMeetingLink}
        confirmLoading={submittingLink}
        okText="Cập nhật"
      >
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Link học trực tuyến (Google Meet, Zoom, etc.)
          </label>
          <Input
            size="large"
            placeholder="https://meet.google.com/..."
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
        </div>
      </Modal>

      {/* Record Result Modal */}
      <Modal
        title="Ghi nhận kết quả buổi học"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Điểm số (1-10)
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
              Tiến độ mục tiêu (%)
            </label>
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              min={0}
              max={100}
              value={completionPercent}
              onChange={(value) => setCompletionPercent(value || 0)}
              formatter={(value?: number) => value !== undefined ? `${value}%` : ''}
              parser={(value?: string) => value?.replace('%', '') as unknown as number}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
              Nhận xét
            </label>
            <TextArea
              rows={4}
              placeholder="Nhận xét về buổi học..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => setResultModalVisible(false)}>Hủy</Button>
            <Button 
              type="primary" 
              loading={submittingResult}
              onClick={handleRecordResult}
            >
              Ghi nhận kết quả
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TutorSessionDetail;
