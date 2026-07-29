import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Avatar, Empty, List, Tag, Rate } from 'antd';
import { TeamOutlined, MailOutlined } from '@ant-design/icons';
import { sessionService } from '../../services';
import { Loading } from '../../components/common';
import type { Session } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Student {
  id: number;
  name: string;
  avatar?: string;
  email: string;
  sessionCount: number;
  lastSession?: string;
  subjects: string[];
  averageScore?: number;
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
              existing.averageScore = existing.averageScore 
                ? (existing.averageScore + session.score) / 2
                : session.score;
            }
          } else {
            studentMap.set(session.studentId, {
              id: session.studentId,
              name: session.studentName,
              avatar: session.studentAvatar,
              email: `${session.studentName.toLowerCase().replace(/\s/g, '.')}@student.com`, // Mock email
              sessionCount: 1,
              lastSession: session.startTime,
              subjects: [session.subjectName],
              averageScore: session.score !== undefined && session.score !== null ? session.score : undefined,
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
          Học sinh của tôi
        </Title>
        <Text type="secondary">Danh sách học sinh đã hoàn thành buổi học</Text>
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
                      <Tag color="purple">{student.sessionCount} buổi</Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Text type="secondary" style={{ fontSize: 13 }}>
                        <MailOutlined style={{ marginRight: 4 }} />
                        {student.email}
                      </Text>
                      {student.lastSession && (
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          Lần cuối: {dayjs(student.lastSession).format('DD/MM/YYYY')}
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
            description="Chưa có học sinh nào hoàn thành buổi học với bạn" 
            style={{ padding: '48px 0' }}
          />
        )}
      </Card>
    </div>
  );
};

export default Students;
