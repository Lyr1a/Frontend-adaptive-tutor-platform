import React from 'react';
import { Button, Result } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        padding: 24,
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="This page or feature is unavailable."
        extra={[
          <Button key="back" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </Button>,
          <Button key="home" type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
            Go to home page
          </Button>,
        ]}
      />
    </div>
  );
};

export default NotFoundPage;
