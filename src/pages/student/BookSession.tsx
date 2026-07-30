import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Select, DatePicker, TimePicker, InputNumber, Button, Typography, Alert, Result, message } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined, StarOutlined } from '@ant-design/icons';
import { tutorService, subjectService, sessionService, creditService } from '../../services';
import { Loading } from '../../components/common';
import type { TutorProfile, Subject, BookSessionRequest } from '../../types';
import { formatCurrency } from '../../utils';
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
        // The booking API requires subjectId > 0.
        setSubjects(
          subjectsData.filter(
            (subject) =>
              subject.id > 0 &&
              tutorSubjectIds.includes(subject.id) &&
              subject.isActive
          )
        );
        setBalance(balanceData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        message.error('Unable to load information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tutorId]);

  const tutorSubjectRate = tutor?.subjects.find(s => s.subjectId === selectedSubject);

  const calculateFee = () => {
    if (selectedSubject === null || !tutorSubjectRate) return 0;
    
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
    if (!tutorId || selectedSubject === null) {
      message.error('Please complete all required information');
      return;
    }

    const startDateTime = dayjs(values.date)
      .hour(values.startTime.hour())
      .minute(values.startTime.minute())
      .second(0);
    const endDateTime = dayjs(values.date)
      .hour(values.endTime.hour())
      .minute(values.endTime.minute())
      .second(0);

    if (startDateTime.isSameOrBefore(dayjs())) {
      message.error('The start time must be in the future');
      return;
    }

    if (endDateTime.isSameOrBefore(startDateTime)) {
      message.error('The end time must be later than the start time');
      return;
    }

    if (tutor?.freeSchedulesJson) {
      try {
        const schedules = JSON.parse(tutor.freeSchedulesJson) as Array<{
          dayOfWeek: number | string;
          startHour?: number;
          endHour?: number;
          startTime?: string;
          endTime?: string;
        }>;
        const dayOfWeek = startDateTime.day();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const startHour = startDateTime.hour() + startDateTime.minute() / 60;
        const endHour = endDateTime.hour() + endDateTime.minute() / 60;
        const isAvailable = schedules.some(
          (schedule) =>
            (
              schedule.dayOfWeek === dayNames[dayOfWeek] &&
              startDateTime.format('HH:mm') >= (schedule.startTime ?? '') &&
              endDateTime.format('HH:mm') <= (schedule.endTime ?? '')
            ) ||
            (
              schedule.dayOfWeek === dayOfWeek &&
              startHour >= (schedule.startHour ?? 0) &&
              endHour <= (schedule.endHour ?? 0)
            )
        );

        if (!isAvailable) {
          message.error('The selected time is outside the tutor availability.');
          return;
        }
      } catch {
        message.error('The tutor availability is invalid.');
        return;
      }
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
      message.success('Session booked successfully!');
    } catch (err: any) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('The request timed out. Check your network connection and try again.');
      } else if (err.response?.status === 400) {
        const errorMsg = err.response.data?.message || 'Invalid request';
        if (errorMsg.includes('Credit')) {
          setError('Insufficient balance. Please add more Learning Credits!');
        } else if (errorMsg.includes('conflict')) {
          setError('This time conflicts with another session. Please select a different time.');
        } else {
          setError(errorMsg);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullPage />;
  }

  if (success) {
    return (
      <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', padding: 48 }}>
        <Result
          status="success"
          title="Session booked successfully!"
          subTitle="The tutor will be notified of your request. Please wait for confirmation."
          extra={[
            <Button type="primary" key="sessions" onClick={() => navigate('/student/sessions')}>
              View Sessions
            </Button>,
            <Button key="home" onClick={() => navigate('/student/dashboard')}>
              Go to home page
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
        Back
      </Button>

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        <Title level={3} style={{ fontWeight: 700, marginBottom: 24 }}>
          Book a Session with {tutor?.fullName}
        </Title>

        {/* Balance Info */}
        <Alert
          message={
            <span>
              Your Learning Credit Balance: <strong style={{ color: '#7132f5' }}>{formatCurrency(balance)}</strong>
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

        {subjects.length === 0 && (
          <Alert
            message="There are no subjects available to book with this tutor."
            description="The tutor subjects do not have valid booking API identifiers."
            type="warning"
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
            label="Subject"
            name="subjectId"
            rules={[{ required: true, message: 'Please select a subject!' }]}
          >
            <Select
              placeholder="Select a subject"
              onChange={(value) => setSelectedSubject(value)}
              size="large"
            >
              {subjects.map(subject => {
                const rate = tutor?.subjects.find(s => s.subjectId === subject.id);
                return (
                  <Option key={subject.id} value={subject.id}>
                    {subject.name} - {rate ? formatCurrency(rate.hourlyRate) + '/hour' : ''}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          {/* Date Picker */}
          <Form.Item
            label="Session Date"
            name="date"
            rules={[{ required: true, message: 'Please select a date!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              format="MMM D, YYYY"
              placeholder="Select a date"
            />
          </Form.Item>

          {/* Time Range */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Form.Item
              label="Start Time"
              name="startTime"
              rules={[{ required: true, message: 'Please select a start time!' }]}
              style={{ flex: '1 1 220px' }}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                placeholder="Start Time"
                minuteStep={30}
              />
            </Form.Item>

            <Form.Item
              label="End Time"
              name="endTime"
              rules={[{ required: true, message: 'Please select an end time!' }]}
              style={{ flex: '1 1 220px' }}
            >
              <TimePicker
                style={{ width: '100%' }}
                format="HH:mm"
                placeholder="End Time"
                minuteStep={30}
              />
            </Form.Item>
          </div>

          {/* Fee Preview */}
          {selectedSubject !== null && (
            <div style={{
              padding: 16,
              backgroundColor: 'rgba(113, 50, 245, 0.04)',
              borderRadius: 12,
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <StarOutlined style={{ color: '#7132f5' }} />
                <Text strong>Estimated Cost</Text>
              </div>
              <Title level={3} style={{ color: '#7132f5', margin: 0 }}>
                {formatCurrency(calculateFee())}
              </Title>
              {calculateFee() > balance && (
                <Alert 
                  message="Insufficient balance for this booking"
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
              disabled={subjects.length === 0 || calculateFee() > balance}
            >
              Confirm Booking
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BookSession;
