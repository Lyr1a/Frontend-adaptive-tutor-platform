import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Select, DatePicker, TimePicker, InputNumber, Button, Typography, Alert, Result, message } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons';
import { tutorService, subjectService, sessionService, creditService } from '../../services';
import { Loading } from '../../components/common';
import type { TutorProfile, Subject, BookSessionRequest } from '../../types';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;
const { Option } = Select;

const BookSession: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tutorId) return;
      
      try {
        const [tutorData, subjectsData, balanceData] = await Promise.all([
          tutorService.getDetails(Number(tutorId)),
          subjectService.getAll(),
          creditService.getBalance(),
        ]);
        
        setTutor(tutorData);
        // Filter subjects that tutor teaches
        const tutorSubjectIds = tutorData.subjects.map(s => s.subjectId);
        setSubjects(subjectsData.filter(s => tutorSubjectIds.includes(s.id) && s.isActive));
        setBalance(balanceData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        message.error('Không thể tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId]);

  const selectedSubjectData = subjects.find(s => s.id === selectedSubject);
  const tutorSubjectRate = tutor?.subjects.find(s => s.subjectId === selectedSubject);

  const calculateFee = () => {
    if (!selectedSubject || !tutorSubjectRate) return 0;
    
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    
    if (startTime && endTime) {
      const start = dayjs(startTime, 'HH:mm');
      const end = dayjs(endTime, 'HH:mm');
      const hours = end.diff(start, 'hour', true);
      return Math.round(tutorSubjectRate.hourlyRate * hours);
    }
    return 0;
  };

  const onFinish = async (values: any) => {
    if (!tutorId || !selectedSubject) {
      message.error('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    const startDateTime = dayjs(values.date).hour(dayjs(values.startTime, 'HH:mm').hour()).minute(dayjs(values.startTime, 'HH:mm').minute());
    const endDateTime = dayjs(values.date).hour(dayjs(values.endTime, 'HH:mm').hour()).minute(dayjs(values.endTime, 'HH:mm').minute());

    if (startDateTime.isSameOrBefore(dayjs())) {
      message.error('Thời gian bắt đầu phải lớn hơn thời gian hiện tại');
      return;
    }

    if (endDateTime.isSameOrBefore(startDateTime)) {
      message.error('Thời gian kết thúc phải lớn hơn thời gian bắt đầu');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data: BookSessionRequest = {
        tutorId: Number(tutorId),
        subjectId: selectedSubject,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };

      await sessionService.book(data);
      setSuccess(true);
      message.success('Đặt lịch thành công!');
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Yêu cầu bị timeout. Vui lòng kiểm tra kết nối mạng và thử lại.');
      } else if (err.response?.status === 400) {
        const errorMsg = err.response.data?.message || 'Yêu cầu không hợp lệ';
        if (errorMsg.includes('Credit')) {
          setError('Số dư không đủ. Vui lòng nạp thêm Credit!');
        } else if (errorMsg.includes('trùng')) {
          setError('Lịch bị trùng. Vui lòng chọn thời gian khác.');
        } else {
          setError(errorMsg);
        }
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  if (success) {
    return (
      <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
        <Result
          status="success"
          title="Đặt lịch thành công!"
          subTitle="Gia sư sẽ được thông báo về yêu cầu của bạn. Vui lòng chờ xác nhận."
          extra={[
            <Button type="primary" key="sessions" onClick={() => navigate('/student/sessions')}>
              Xem lịch học
            </Button>,
            <Button key="home" onClick={() => navigate('/student/dashboard')}>
              Về trang chủ
            </Button>,
          ]}
        />
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

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        <Title level={3} style={{ fontWeight: 700, marginBottom: 24 }}>
          Đặt lịch học với {tutor?.fullName}
        </Title>

        {/* Balance Info */}
        <Alert
          message={
            <span>
              Số dư Credit của bạn: <strong style={{ color: '#7132f5' }}>{formatCurrency(balance)}</strong>
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          {/* Subject Selection */}
          <Form.Item
            label="Môn học"
            name="subjectId"
            rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
          >
            <Select
              placeholder="Chọn môn học"
              onChange={(value) => setSelectedSubject(value)}
              size="large"
            >
              {subjects.map(subject => {
                const rate = tutor?.subjects.find(s => s.subjectId === subject.id);
                return (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name} - {rate ? formatCurrency(rate.hourlyRate) + '/giờ' : ''}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {/* Date Picker */}
          <Form.Item
            label="Ngày học"
            name="date"
            rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>

          {/* Time Range */}
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              label="Giờ bắt đầu"
              name="startTime"
              rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
              style={{ flex: 1 }}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                placeholder="Giờ bắt đầu"
                minuteStep={30}
              />
            </Form.Item>

            <Form.Item
              label="Giờ kết thúc"
              name="endTime"
              rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
              style={{ flex: 1 }}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                placeholder="Giờ kết thúc"
                minuteStep={30}
              />
            </Form.Item>
          </div>

          {/* Fee Preview */}
          {selectedSubject && (
            <div style={{
              padding: 16,
              backgroundColor: 'rgba(113, 50, 245, 0.04)',
              borderRadius: 12,
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <DollarOutlined style={{ color: '#7132f5' }} />
                <Text strong>Phí dự kiến</Text>
              </div>
              <Title level={3} style={{ color: '#7132f5', margin: 0 }}>
                {formatCurrency(calculateFee())}
              </Title>
              {calculateFee() > balance && (
                <Alert 
                  message="Số dư không đủ để đặt lịch này" 
                  type="warning" 
                  showIcon 
                  style={{ marginTop: 12 }}
                />
              )}
            </div>
          )}

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              style={{ height: 52, borderRadius: 12, fontSize: 16, fontWeight: 600 }}
              disabled={calculateFee() > balance}
            >
              Xác nhận đặt lịch
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BookSession;
