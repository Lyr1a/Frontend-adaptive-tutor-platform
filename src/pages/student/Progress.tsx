import React, { useState, useEffect } from 'react';
import { Card, Typography, Row, Col, Progress, List, Avatar, Empty, Skeleton, Tabs } from 'antd';
import { 
  TrophyOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { progressService } from '../../services';
import { Loading, StatusBadge } from '../../components/common';
import type { LearningMilestone, ProgressChartData } from '../../types';
import { formatDate } from '../../utils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProgressPage: React.FC = () => {
  const [milestones, setMilestones] = useState<LearningMilestone[]>([]);
  const [chartData, setChartData] = useState<ProgressChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [milestonesData, chartDataResult] = await Promise.all([
        progressService.getGoals(),
        progressService.getChart().catch(() => null),
      ]);
      setMilestones(milestonesData);
      setChartData(chartDataResult);
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedMilestones = milestones.filter(m => m.status === 'Completed');
  const inProgressMilestones = milestones.filter(m => m.status === 'InProgress');
  const notStartedMilestones = milestones.filter(m => m.status === 'NotStarted');

  const averageProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.completionPercentage, 0) / milestones.length)
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleOutlined style={{ color: '#149e61' }} />;
      case 'InProgress':
        return <ClockCircleOutlined style={{ color: '#7132f5' }} />;
      default:
        return <CloseCircleOutlined style={{ color: '#9497a9' }} />;
    }
  };

  const renderMilestoneCard = (milestone: LearningMilestone) => (
    <Card 
      key={milestone.id}
      variant="borderless"
      style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px', marginBottom: 12 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {getStatusIcon(milestone.status)}
            <Text strong style={{ fontSize: 16 }}>{milestone.milestoneName}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {milestone.subjectName} • {milestone.studentName}
          </Text>
        </div>
        <StatusBadge status={milestone.status} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text type="secondary">Progress</Text>
          <Text strong style={{ color: '#7132f5' }}>{milestone.completionPercentage}%</Text>
        </div>
        <Progress 
          percent={milestone.completionPercentage} 
          showInfo={false}
          strokeColor="#7132f5"
          trailColor="#f0f0f0"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Target Date: {formatDate(milestone.targetDate)}
        </Text>
        {milestone.completionPercentage >= 100 && (
          <TrophyOutlined style={{ color: '#f59e0b', fontSize: 20 }} />
        )}
      </div>
    </Card>
  );

  if (loading) {
    return <Loading fullPage />;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Learning Progress
        </Title>
        <Text type="secondary">Track your goals and achievements</Text>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#7132f5' }}>{milestones.length}</div>
            <Text type="secondary">Total Goals</Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#149e61' }}>{completedMilestones.length}</div>
            <Text type="secondary">Completed</Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#d97706' }}>{inProgressMilestones.length}</div>
            <Text type="secondary">In Progress</Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card variant="borderless" style={{ borderRadius: 12, textAlign: 'center', boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#7132f5' }}>{averageProgress}%</div>
            <Text type="secondary">Average Progress</Text>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card 
        variant="borderless" 
        style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: 'All',
              children: (
                milestones.length > 0 ? (
                  <div>{milestones.map(renderMilestoneCard)}</div>
                ) : (
                  <Empty description="No goals yet" />
                )
              ),
            },
            {
              key: 'completed',
              label: `Completed (${completedMilestones.length})`,
              children: (
                completedMilestones.length > 0 ? (
                  <div>{completedMilestones.map(renderMilestoneCard)}</div>
                ) : (
                  <Empty description="No completed goals yet" />
                )
              ),
            },
            {
              key: 'inProgress',
              label: `In Progress (${inProgressMilestones.length})`,
              children: (
                inProgressMilestones.length > 0 ? (
                  <div>{inProgressMilestones.map(renderMilestoneCard)}</div>
                ) : (
                  <Empty description="No goals in progress" />
                )
              ),
            },
            {
              key: 'notStarted',
              label: `Not Started (${notStartedMilestones.length})`,
              children: (
                notStartedMilestones.length > 0 ? (
                  <div>{notStartedMilestones.map(renderMilestoneCard)}</div>
                ) : (
                  <Empty description="All goals have been started" />
                )
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ProgressPage;
