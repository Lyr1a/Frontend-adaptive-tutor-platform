import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingProps {
  fullPage?: boolean;
  tip?: string;
  size?: 'small' | 'default' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ 
  fullPage = false, 
  tip = 'Đang tải...',
  size = 'default'
}) => {
  const indicator = <LoadingOutlined spin style={{ fontSize: size === 'small' ? 16 : size === 'large' ? 32 : 24, color: '#7132f5' }} />;
  
  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
      }}>
        <Spin indicator={indicator} tip={tip} size={size} />
      </div>
    );
  }

  return <Spin indicator={indicator} tip={tip} size={size} />;
};

export default Loading;
