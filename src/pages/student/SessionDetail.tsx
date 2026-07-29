import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Avatar, Button, Rate, Modal, Input, message, Divider } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, VideoCameraOutlined, UserOutlined } from '@ant-design/icons';
import { sessionService, feedbackService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { Session, Feedback } from '../../types';
import { getDateRange } from '../../utils';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SessionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Feedback Modal
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSessionData();
  }, [id]);

  const fetchSessionData = async () => {
    if (!id) return;
    
    try {
      const data = await sessionService.getById(Number(id));
      setSession(data);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      message.error('Không thể tải thông tin buổi học');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!session) return;

    setSubmitting(true);
    try {
      const response = await feedbackService.rateSession({
        sessionId: session.id,
        rating,
        comment,
      });
      setFeedback(response);
      setFeedbackModalVisible(false);
      message.success('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      message.error('Không thể gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const canLeaveFeedback = session?.status === 'Completed' && !feedback;

  if (loading) {
    return <Loading fullPage />;
  }

  if (!session) {
    return (
      <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
        <Title level={4}>Không tìm thấy buổi học</Title>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

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

            {/* Tutor Info */}
            <div style={{ marginBottom: 20 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Gia sư</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar 
                  size={48} 
                  src={session.tutorAvatar} 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#7132f5' }}
                />
                <div>
                  <Text strong style={{ fontSize: 16 }}>{session.tutorName}</Text>
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
            {session.meetingLink && (
              <div style={{ marginBottom: 20 }}>
                <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Link học trực tuyến</Text>
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
                  <Text strong>Tham gia buổi học</Text>
                </a>
              </div>
            )}

            {/* Score & Comment (if completed) */}
            {session.status === 'Completed' && (
              <>
                <Divider />
                <div style={{ marginBottom: 20 }}>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Kết quả buổi học</Text>
                  {session.score !== undefined && session.score !== null && (
                    <div style={{ marginBottom: 8 }}>
                      <Text strong>Điểm số: </Text>
                      <Text style={{ fontSize: 20, fontWeight: 700, color: '#7132f5' }}>
                        {session.score}/10
                      </Text>
                    </div>
                  )}
                  {session.tutorComment && (
                    <Paragraph style={{ color: '#686b82', margin: 0 }}>
                      {session.tutorComment}
                    </Paragraph>
                  )}
                  {session.goalCompletionPercentage !== undefined && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Tiến độ mục tiêu: </Text>
                      <Text>{session.goalCompletionPercentage}%</Text>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Feedback (if given) */}
            {feedback && (
              <>
                <Divider />
                <div>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Đánh giá của bạn</Text>
                  <Rate disabled value={feedback.rating} style={{ marginBottom: 8 }} />
                  {feedback.comment && (
                    <Paragraph style={{ color: '#686b82', margin: 0 }}>
                      {feedback.comment}
                    </Paragraph>
                  )}
                </div>
              </>
            )}

            {/* Leave Feedback Button */}
            {canLeaveFeedback && (
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setFeedbackModalVisible(true)}
                style={{ marginTop: 24, borderRadius: 12 }}
              >
                Đánh giá buổi học
              </Button>
            )}
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Quick Info Card */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 16 }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>Thông tin buổi học</Title>
            
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
                <Text type="secondary" style={{ fontSize: 12 }}>Ngày tạo</Text>
                <div style={{ fontSize: 14 }}>
                  {dayjs(session.startTime).format('DD/MM/YYYY')}
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
          >
            <Title level={5} style={{ marginBottom: 16 }}>Thao tác</Title>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {session.meetingLink && (session.status === 'Confirmed' || session.status === 'Pending') && (
                <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Button type="primary" block style={{ borderRadius: 10 }}>
                    Tham gia học
                  </Button>
                </a>
              )}
              
              {(session.status === 'Confirmed' || session.status === 'Pending') && (
                <Button 
                  block 
                  style={{ borderRadius: 10 }}
                  onClick={() => navigate(`/student/sessions?change=${session.id}`)}
                >
                  Đề xuất đổi lịch
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Feedback Modal */}
      <Modal
        title="Đánh giá buổi học"
        open={feedbackModalVisible}
        onCancel={() => setFeedbackModalVisible(false)}
        footer={null}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            Bạn cảm thấy buổi học như thế nào?
          </Text>
          <Rate 
            value={rating} 
            onChange={setRating}
            style={{ fontSize: 32 }}
          />
          <div style={{ marginTop: 8, color: '#7132f5', fontWeight: 500 }}>
            {rating === 5 ? 'Xuất sắc' : 
             rating === 4 ? 'Rất tốt' : 
             rating === 3 ? 'Tốt' : 
             rating === 2 ? 'Khá' : 'Cần cải thiện'}
          </div>
        </div>

        <TextArea
          rows={4}
          placeholder="Nhận xét của bạn về buổi học (tùy chọn)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button onClick={() => setFeedbackModalVisible(false)}>Hủy</Button>
          <Button 
            type="primary" 
            loading={submitting}
            onClick={handleSubmitFeedback}
          >
            Gửi đánh giá
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionDetail;
