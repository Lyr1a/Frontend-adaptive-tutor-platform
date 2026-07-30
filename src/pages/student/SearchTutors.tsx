import React, { useState, useEffect } from 'react';
import { Alert, Row, Col, Card, Input, Select, Slider, Button, Typography, Pagination, Skeleton } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { tutorService, subjectService } from '../../services';
import { Loading, TutorCard } from '../../components/common';
import type { TutorProfile, Subject, TutorSearchParams } from '../../types';
import { formatCurrency } from '../../utils';

const { Title, Text } = Typography;
const { Option } = Select;

const SearchTutors: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [minRate, setMinRate] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<number>(500000);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await subjectService.getAll();
        // The tutor search API only accepts subjectId greater than 0.
        const activeSubjects = (data || []).filter(s => s.isActive && s.id > 0);
        setSubjects(activeSubjects);
        if (activeSubjects.length > 0) {
          setSelectedSubject((current) => current ?? activeSubjects[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        setError('Unable to load subjects. Please check the API connection.');
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      if (selectedSubject === null) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const params: TutorSearchParams = {
          subjectId: selectedSubject,
          minRate: minRate > 0 ? minRate : undefined,
          maxRate: maxRate < 500000 ? maxRate : undefined,
          pageNumber: page,
          pageSize,
        };

        const data = await tutorService.search(params);
        const normalizedTutors = (data.items || []).map((tutor) => ({
          ...tutor,
          subjects: (tutor.subjects || []).map((subject) => ({
            ...subject,
            subjectName:
              subjects.find((item) => item.id === subject.subjectId)?.name ||
              subject.subjectName,
          })),
        }));
        setTutors(normalizedTutors);
        setTotalCount(data.totalCount);
      } catch (error) {
        console.error('Failed to fetch tutors:', error);
        setTutors([]);
        setTotalCount(0);
        setError('Unable to find tutors. Please check the API and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [selectedSubject, minRate, maxRate, page, pageSize, subjects]);

  const handleSubjectChange = (value: number) => {
    setSelectedSubject(value);
    setPage(1);
  };

  const filteredTutors = searchTerm
    ? (tutors || []).filter(t =>
        t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : (tutors || []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#101114' }}>
          Find Tutors
        </Title>
        <Text type="secondary">
          Find tutors who match your learning needs
        </Text>
      </div>

      <Row gutter={24}>
        {/* Filters Panel */}
        <Col xs={24} lg={6}>
          <Card
            variant="borderless"
            style={{ borderRadius: 12, boxShadow: 'rgba(0, 0, 0, 0.03) 0px 4px 24px' }}
            title={
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FilterOutlined /> Filters
              </span>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Subject Filter */}
              <div>
                <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>
                  Subject <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <Select
                  placeholder="Select a subject"
                  style={{ width: '100%' }}
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  size="large"
                >
                  {subjects.map(subject => (
                    <Option key={subject.id} value={subject.id}>
                      {subject.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Rate Range */}
              <div>
                <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>
                  Rate (Learning Credits/hour)
                </label>
                <div style={{ padding: '0 8px' }}>
                  <Slider
                    range
                    min={0}
                    max={500000}
                    step={10000}
                    value={[minRate, maxRate]}
                    onChange={([min, max]) => {
                      setMinRate(min);
                      setMaxRate(max);
                    }}
                    tooltip={{ formatter: (value?: number) => value !== undefined ? formatCurrency(value) : '' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatCurrency(minRate)}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatCurrency(maxRate)}</Text>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <Button 
                block 
                onClick={() => {
                  setSelectedSubject(null);
                  setMinRate(0);
                  setMaxRate(500000);
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        </Col>

        {/* Results */}
        <Col xs={24} lg={18}>
          {error && (
            <Alert
              type="error"
              showIcon
              closable
              message={error}
              style={{ marginBottom: 16 }}
              onClose={() => setError(null)}
            />
          )}
          {/* Search Bar */}
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search by name or description..."
              prefix={<SearchOutlined style={{ color: '#9497a9' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
              style={{ borderRadius: 12 }}
            />
          </div>

          {/* Results Count */}
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              {selectedSubject 
                ? `Found ${totalCount} tutors`
                : 'Select a subject to search'
              }
            </Text>
          </div>

          {/* Tutor Grid */}
          {loading ? (
            <Row gutter={[16, 16]}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Col xs={24} sm={12} lg={8} key={i}>
                  <Card variant="borderless" style={{ borderRadius: 12 }}>
                    <Skeleton active avatar paragraph={{ rows: 3 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : filteredTutors.length > 0 ? (
            <>
              <Row gutter={[16, 16]}>
                {filteredTutors.map(tutor => (
                  <Col xs={24} sm={12} lg={8} key={tutor.id}>
                    <TutorCard tutor={tutor} />
                  </Col>
                ))}
              </Row>

              {/* Pagination */}
              {totalCount > pageSize && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={totalCount}
                    onChange={(p, ps) => {
                      setPage(p);
                      setPageSize(ps);
                    }}
                    showSizeChanger
                    showTotal={(total) => `Total ${total} tutors`}
                  />
                </div>
              )}
            </>
          ) : (
            <Card
              variant="borderless"
              style={{
                borderRadius: 12,
                textAlign: 'center',
                padding: '48px 24px'
              }}
            >
              <SearchOutlined style={{ fontSize: 48, color: '#9497a9', marginBottom: 16 }} />
              <Title level={4} type="secondary">No Tutors Found</Title>
              <Text type="secondary">
                Try adjusting the filters or using a different search term
              </Text>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SearchTutors;
