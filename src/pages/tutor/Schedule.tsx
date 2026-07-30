import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, message, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { profileService, tutorService } from '../../services';
import { Loading } from '../../components/common';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const DAYS = [
  { label: 'Monday', value: 'Monday', legacyValue: 1 },
  { label: 'Tuesday', value: 'Tuesday', legacyValue: 2 },
  { label: 'Wednesday', value: 'Wednesday', legacyValue: 3 },
  { label: 'Thursday', value: 'Thursday', legacyValue: 4 },
  { label: 'Friday', value: 'Friday', legacyValue: 5 },
  { label: 'Saturday', value: 'Saturday', legacyValue: 6 },
  { label: 'Sunday', value: 'Sunday', legacyValue: 0 },
] as const;

const formatMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

const timeToDecimalHour = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour + minute / 60;
};

const SHIFTS = Array.from({ length: 9 }, (_, index) => {
  const startMinutes = 8 * 60 + index * 90;
  const endMinutes = startMinutes + 90;
  return {
    id: index + 1,
    startTime: formatMinutes(startMinutes),
    endTime: formatMinutes(endMinutes),
  };
});

interface ScheduleSlot {
  day: number;
  shiftId: number;
  startTime: string;
  endTime: string;
  available: boolean;
}

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      const initialSchedule: ScheduleSlot[] = [];
      for (let day = 0; day < 7; day++) {
        for (const shift of SHIFTS) {
          initialSchedule.push({
            day,
            shiftId: shift.id,
            startTime: shift.startTime,
            endTime: shift.endTime,
            available: false,
          });
        }
      }

      try {
        const profile = await profileService.getMe() as {
          freeSchedulesJson?: string;
        };
        const entries = JSON.parse(profile.freeSchedulesJson || '[]') as Array<{
          dayOfWeek?: number | string;
          startHour?: number;
          endHour?: number;
          startTime?: string;
          endTime?: string;
        }>;

        setSchedule(initialSchedule.map((slot) => {
          const day = DAYS[slot.day];
          const available = entries.some((entry) =>
            (
              entry.dayOfWeek === day.value &&
              entry.startTime === slot.startTime &&
              entry.endTime === slot.endTime
            ) ||
            (
              entry.dayOfWeek === day.legacyValue &&
              timeToDecimalHour(slot.startTime) >= (entry.startHour ?? 0) &&
              timeToDecimalHour(slot.endTime) <= (entry.endHour ?? 0)
            )
          );
          return { ...slot, available };
        }));
      } catch (error) {
        console.error('Failed to load availability:', error);
        navigate('/404', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [navigate]);

  const handleToggleSlot = (day: number, shiftId: number) => {
    setSchedule(prev => 
      prev.map(slot => 
        slot.day === day && slot.shiftId === shiftId
          ? { ...slot, available: !slot.available }
          : slot
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const freeSchedules = schedule
        .filter((slot) => slot.available)
        .map((slot) => ({
          dayOfWeek: DAYS[slot.day].value,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }));

      await tutorService.updateAvailability(JSON.stringify(freeSchedules));
      message.success('Availability saved successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save availability:', error);
      navigate('/404', { replace: true });
    } finally {
      setSaving(false);
    }
  };

  const isSlotAvailable = (day: number, shiftId: number) => {
    const slot = schedule.find(s => s.day === day && s.shiftId === shiftId);
    return slot?.available || false;
  };

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Manage Availability
        </Title>
        <Text type="secondary">Update when you are available to teach</Text>
      </div>

      <Alert
        message="Instructions"
        description="Each shift lasts 90 minutes. Select the shifts you can teach from Monday through Sunday, then save your availability."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <div>
            <Text strong style={{ fontSize: 16 }}>Weekly Availability</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
              {schedule.filter(s => s.available).length} shifts selected
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
            Save Availability
          </Button>
        </div>

        {/* Schedule Grid */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 760, borderCollapse: 'separate', borderSpacing: 4 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', width: 80 }}>
                  <Text type="secondary">Shift</Text>
                </th>
                {DAYS.map((day) => (
                  <th key={day.value} style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <Text strong>{day.label}</Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SHIFTS.map(shift => (
                <tr key={shift.id}>
                  <td style={{ padding: '4px 12px' }}>
                    <Text style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                      Ca {shift.id}
                      <br />
                      {shift.startTime}–{shift.endTime}
                    </Text>
                  </td>
                  {DAYS.map((_, dayIndex) => (
                    <td key={dayIndex} style={{ padding: 4 }}>
                      <button
                        type="button"
                        aria-label={`${DAYS[dayIndex].label}, ${shift.startTime} to ${shift.endTime}: ${isSlotAvailable(dayIndex, shift.id) ? 'available' : 'unavailable'}`}
                        aria-pressed={isSlotAvailable(dayIndex, shift.id)}
                        onClick={() => handleToggleSlot(dayIndex, shift.id)}
                        style={{
                          width: '100%',
                          height: 40,
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          backgroundColor: isSlotAvailable(dayIndex, shift.id)
                            ? '#7132f5'
                            : 'rgba(148, 151, 169, 0.08)',
                          border: isSlotAvailable(dayIndex, shift.id)
                            ? '2px solid #7132f5'
                            : '2px solid transparent',
                        }}
                      >
                        {isSlotAvailable(dayIndex, shift.id) && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
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
            <Text type="secondary">Unavailable</Text>
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
            <Text type="secondary">Available to Teach</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
