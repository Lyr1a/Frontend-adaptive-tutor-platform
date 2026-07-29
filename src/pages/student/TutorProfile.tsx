import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Avatar, Typography, Button, Rate, List, Skeleton, Tag, message } from 'antd';
import { 
  StarFilled, 
  BookOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { tutorService } from '../../services';
import { Loading } from '../../components/common';
import type { TutorProfile, Feedback } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const TutorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const [tutorData, feedbacksData] = await Promise.all([
          tutorService.getDetails(Number(id)),
          tutorService.getFeedbacks(Number(id)),
        ]);
        setTutor(tutorData);
        setFeedbacks(feedbacksData);
      } catch (error) {
        console.error('Failed to fetch tutor data:', error);
        message.error('Không thể tải thông tin gia sư');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <Loading fullPage />;
  }

  if (!tutor) {
    return (
      <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
        <Title level={4}>Không tìm thấy gia sư</Title>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Card>
    );
  }

  const averageRating = feedbacks.length > 0 
    ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length 
    : 0;

  return (
    <div>
      {/* Back Button */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Quay lại
      </Button>

      <Row gutter={24}>
        {/* Left Column - Profile Info */}
        <Col xs={24} lg={8}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', textAlign: 'center' }}
          >
            <Avatar 
              size={120} 
              src={tutor.avatarUrl} 
              style={{ backgroundColor: '#7132f5', marginBottom: 16 }}
            />
            <Title level={3} style={{ margin: '0 0 8px' }}>
              {tutor.fullName}
            </Title>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <Tag color={tutor.status === 'Approved' ? 'success' : 'warning'}>
                {tutor.status === 'Approved' ? 'Đã xác minh' : 'Chờ duyệt'}
              </Tag>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: 24 }}>
              <Rate 
                disabled 
                value={averageRating} 
                allowHalf 
                style={{ fontSize: 20 }}
              />
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                {averageRating.toFixed(1)} / 5 ({feedbacks.length} đánh giá)
              </Text>
            </div>

            {/* Stats */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around', 
              padding: '16px 0',
              borderTop: '1px solid #f0f0f0',
              borderBottom: '1px solid #f0f0f0',
              marginBottom: 24
            }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7132f5' }}>
                  {tutor.reputationScore.toFixed(1)}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>Điểm uy tín</Text>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7132f5' }}>
                  {feedbacks.length}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>Đánh giá</Text>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#7132f5' }}>
                  {tutor.subjects.length}
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>Môn dạy</Text>
              </div>
            </div>

            {/* Book Button */}
            <Button 
              type="primary" 
              size="large"
              block
              onClick={() => navigate(`/student/book/${tutor.userId}`)}
              style={{ borderRadius: 12, height: 52 }}
            >
              Đặt lịch học
            </Button>
          </Card>
        </Col>

        {/* Right Column - Details */}
        <Col xs={24} lg={16}>
          {/* Bio */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 16 }}
            title={<span style={{ fontWeight: 600 }}>Giới thiệu</span>}
          >
            {tutor.bio ? (
              <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>
                {tutor.bio}
              </Paragraph>
            ) : (
              <Text type="secondary">Gia sư chưa cập nhật thông tin giới thiệu</Text>
            )}
          </Card>

          {/* Qualifications */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 16 }}
            title={<span style={{ fontWeight: 600 }}>Trình độ & Kinh nghiệm</span>}
          >
            {tutor.qualifications ? (
              <Paragraph style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {tutor.qualifications}
              </Paragraph>
            ) : (
              <Text type="secondary">Gia sư chưa cập nhật trình độ</Text>
            )}
          </Card>

          {/* Subjects & Rates */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 16 }}
            title={<span style={{ fontWeight: 600 }}>Môn học & Học phí</span>}
          >
            {tutor.subjects.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tutor.subjects.map(subject => (
                  <div 
                    key={subject.subjectId}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '12px 16px',
                      backgroundColor: 'rgba(113, 50, 245, 0.04)',
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <BookOutlined style={{ fontSize: 20, color: '#7132f5' }} />
                      <Text strong>{subject.subjectName}</Text>
                    </div>
                    <Text style={{ color: '#7132f5', fontWeight: 600, fontSize: 16 }}>
                      {formatCurrency(subject.hourlyRate)} / giờ
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <Text type="secondary">Chưa có môn học nào</Text>
            )}
          </Card>

          {/* Reviews */}
          <Card 
            variant="borderless" 
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={<span style={{ fontWeight: 600 }}>Đánh giá từ học sinh</span>}
          >
            {feedbacks.length > 0 ? (
              <List
                dataSource={feedbacks.slice(0, 5)}
                renderItem={(feedback) => (
                  <List.Item style={{ borderBottom: '1px solid #f0f0f0', padding: '16px 0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar 
                            src={feedback.senderAvatar} 
                            icon={<ClockCircleOutlined />} 
                            style={{ backgroundColor: '#7132f5' }}
                          />
                          <div>
                            <Text strong>{feedback.senderName}</Text>
                            <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                              {dayjs(feedback.createdAt).fromNow()}
                            </Text>
                          </div>
                        </div>
                        <Rate disabled value={feedback.rating} style={{ fontSize: 14 }} />
                      </div>
                      {feedback.comment && (
                        <Text style={{ color: '#686b82' }}>{feedback.comment}</Text>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <StarFilled style={{ fontSize: 32, color: '#9497a9', marginBottom: 8 }} />
                <Text type="secondary" style={{ display: 'block' }}>
                  Chưa có đánh giá nào
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TutorProfilePage;
