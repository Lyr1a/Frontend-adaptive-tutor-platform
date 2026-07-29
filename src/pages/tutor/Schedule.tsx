import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Button, message, Checkbox, Space, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { tutorService } from '../../services';
import { Loading } from '../../components/common';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 to 19:00

interface ScheduleSlot {
  day: number;
  hour: number;
  available: boolean;
}

const Schedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize empty schedule
    const initialSchedule: ScheduleSlot[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour of HOURS) {
        initialSchedule.push({ day, hour, available: false });
      }
    }
    setSchedule(initialSchedule);
    setLoading(false);
  }, []);

  const handleToggleSlot = (day: number, hour: number) => {
    setSchedule(prev => 
      prev.map(slot => 
        slot.day === day && slot.hour === hour 
          ? { ...slot, available: !slot.available }
          : slot
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert schedule to JSON format
      const freeSchedules: { day: number; hours: number[] }[] = [];
      
      for (let day = 0; day < 7; day++) {
        const daySlots = schedule.filter(s => s.day === day && s.available);
        if (daySlots.length > 0) {
          freeSchedules.push({
            day,
            hours: daySlots.map(s => s.hour),
          });
        }
      }

      await tutorService.updateAvailability(JSON.stringify(freeSchedules));
      message.success('Lưu lịch rảnh thành công!');
      setHasChanges(false);
    } catch (error) {
      message.error('Không thể lưu lịch rảnh');
    } finally {
      setSaving(false);
    }
  };

  const isSlotAvailable = (day: number, hour: number) => {
    const slot = schedule.find(s => s.day === day && s.hour === hour);
    return slot?.available || false;
  };

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Quản lý lịch rảnh
        </Title>
        <Text type="secondary">Cập nhật lịch có thể nhận dạy</Text>
      </div>

      <Alert
        message="Hướng dẫn"
        description="Nhấp vào các ô bên dưới để đánh dấu khung giờ bạn có thể dạy. Lịch rảnh sẽ giúp học sinh tìm được bạn dễ dàng hơn."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Text strong style={{ fontSize: 16 }}>Lịch rảnh hàng tuần</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
              {schedule.filter(s => s.available).length} khung giờ được chọn
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            loading={saving}
            disabled={!hasChanges}
            onClick={handleSave}
            style={{ borderRadius: 10 }}
          >
            Lưu lịch
          </Button>
        </div>

        {/* Schedule Grid */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: 80 }}>
                  <Text type="secondary">Giờ</Text>
                </th>
                {DAYS.map((day, index) => (
                  <th key={index} style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <Text strong>{day}</Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(hour => (
                <tr key={hour}>
                  <td style={{ padding: '4px 12px' }}>
                    <Text style={{ fontSize: 13 }}>{hour}:00</Text>
                  </td>
                  {DAYS.map((_, dayIndex) => (
                    <td key={dayIndex} style={{ padding: 4 }}>
                      <div
                        onClick={() => handleToggleSlot(dayIndex, hour)}
                        style={{
                          width: '100%',
                          height: 40,
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          backgroundColor: isSlotAvailable(dayIndex, hour) 
                            ? '#7132f5' 
                            : 'rgba(148, 151, 169, 0.08)',
                          border: isSlotAvailable(dayIndex, hour) 
                            ? '2px solid #7132f5' 
                            : '2px solid transparent',
                        }}
                      >
                        {isSlotAvailable(dayIndex, hour) && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ marginTop: 24, display: 'flex', gap: 24, justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: 'rgba(148, 151, 169, 0.08)',
              border: '2px solid transparent',
            }} />
            <Text type="secondary">Không rảnh</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: '#7132f5',
              border: '2px solid #7132f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <Text type="secondary">Có thể dạy</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
