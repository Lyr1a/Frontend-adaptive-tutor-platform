import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Avatar, Empty, List, Tag, Rate } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { sessionService } from '../../services';
import { Loading } from '../../components/common';
import type { Session } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Student {
  id: number;
  name: string;
  avatar?: string;
  sessionCount: number;
  lastSession?: string;
  subjects: string[];
  averageScore?: number;
  scores: number[];
}

const Students: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await sessionService.getMySessions();
      setSessions(data);
      
      // Group sessions by student
      const studentMap = new Map<number, Student>();
      
      data.forEach(session => {
        if (session.status === 'Completed') {
          const existing = studentMap.get(session.studentId);
          if (existing) {
            existing.sessionCount++;
            if (!existing.subjects.includes(session.subjectName)) {
              existing.subjects.push(session.subjectName);
            }
            if (dayjs(session.startTime).isAfter(dayjs(existing.lastSession))) {
              existing.lastSession = session.startTime;
            }
            if (session.score !== undefined && session.score !== null) {
              existing.scores.push(session.score);
              existing.averageScore =
                existing.scores.reduce((total, score) => total + score, 0) /
                existing.scores.length;
            }
          } else {
            studentMap.set(session.studentId, {
              id: session.studentId,
              name: session.studentName,
              avatar: session.studentAvatar,
              sessionCount: 1,
              lastSession: session.startTime,
              subjects: [session.subjectName],
              averageScore: session.score !== undefined && session.score !== null ? session.score : undefined,
              scores: session.score !== undefined && session.score !== null ? [session.score] : [],
            });
          }
        }
      });

      setStudents(Array.from(studentMap.values()));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          My Students
        </Title>
        <Text type="secondary">Students who have completed a session with you</Text>
      </div>

      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        {students.length > 0 ? (
          <List
            dataSource={students}
            renderItem={(student) => (
              <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                  <Avatar 
                    size={56} 
                    src={student.avatar} 
                    icon={<TeamOutlined />}
                    style={{ backgroundColor: '#7132f5' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 16 }}>{student.name}</Text>
                      <Tag color="purple">{student.sessionCount} sessions</Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      {student.lastSession && (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Last session: {dayjs(student.lastSession).format('MMM D, YYYY')}
                        </Text>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      {student.subjects.map((subject, index) => (
                        <Tag key={index} color="blue">{subject}</Tag>
                      ))}
                    </div>
                  </div>
                  {student.averageScore !== undefined && (
                    <div style={{ textAlign: 'center' }}>
                      <Rate disabled value={student.averageScore / 2} style={{ fontSize: 14 }} allowHalf />
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                        TB: {student.averageScore.toFixed(1)}/10
                      </Text>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty 
            description="No students have completed a session with you yet"
            style={{ padding: '48px 0' }}
          />
        )}
      </Card>
    </div>
  );
};

export default Students;
