import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Badge, Button, List, Popover, Typography, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  UserOutlined,
  SolutionOutlined,
  SearchOutlined,
  WalletOutlined,
  BarChartOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  DollarCircleOutlined,
  FileProtectOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores';
import { notificationService } from '../../services';
import type { Notification } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const studentMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <HomeOutlined />, label: 'Trang chủ', path: '/student/dashboard' },
  { key: 'search', icon: <SearchOutlined />, label: 'Tìm gia sư', path: '/student/search-tutors' },
  { key: 'sessions', icon: <SolutionOutlined />, label: 'Lịch học', path: '/student/sessions' },
  { key: 'wallet', icon: <WalletOutlined />, label: 'Ví Credit', path: '/student/wallet' },
  { key: 'progress', icon: <BarChartOutlined />, label: 'Tiến độ học tập', path: '/student/progress' },
  { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ', path: '/student/profile' },
];

const tutorMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <HomeOutlined />, label: 'Trang chủ', path: '/tutor/dashboard' },
  { key: 'sessions', icon: <SolutionOutlined />, label: 'Lịch dạy', path: '/tutor/sessions' },
  { key: 'schedule', icon: <ClockCircleOutlined />, label: 'Lịch rảnh', path: '/tutor/schedule' },
  { key: 'students', icon: <TeamOutlined />, label: 'Học sinh', path: '/tutor/students' },
  { key: 'wallet', icon: <WalletOutlined />, label: 'Ví Credit', path: '/tutor/wallet' },
  { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ', path: '/tutor/profile' },
];

const adminMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <HomeOutlined />, label: 'Tổng quan', path: '/admin/dashboard' },
  { key: 'tutors', icon: <UserAddOutlined />, label: 'Duyệt gia sư', path: '/admin/tutors/pending' },
  { key: 'credits', icon: <DollarCircleOutlined />, label: 'Yêu cầu nạp tiền', path: '/admin/credits/pending' },
  { key: 'complaints', icon: <ExclamationCircleOutlined />, label: 'Khiếu nại', path: '/admin/complaints' },
  { key: 'users', icon: <TeamOutlined />, label: 'Quản lý người dùng', path: '/admin/users' },
];

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const getMenuItems = (): MenuItem[] => {
    switch (user?.role) {
      case 'Student':
        return studentMenuItems;
      case 'Tutor':
        return tutorMenuItems;
      case 'Administrator':
        return adminMenuItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const getSelectedKey = (): string => {
    const currentPath = location.pathname;
    for (const item of menuItems) {
      if (currentPath.startsWith(item.path)) {
        return item.key;
      }
    }
    return 'dashboard';
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getAll();
        setNotifications(data);
      } catch (error) {
        // API may not exist yet — silently ignore 404/network errors
        setNotifications([]);
      }
    };
    
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMenuClick = ({ key }: { key: string }) => {
    const item = menuItems.find((i) => i.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const notificationContent = (
    <div style={{ width: 360, maxHeight: 400, overflow: 'auto' }}>
      <div style={{ 
        padding: '12px 16px', 
        borderBottom: '1px solid #dedee5',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong style={{ fontSize: 16 }}>Thông báo</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={() => notificationService.markAllAsRead()}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>
      <List
        dataSource={notifications.slice(0, 10)}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '12px 16px',
              backgroundColor: item.isRead ? 'transparent' : 'rgba(113, 50, 245, 0.04)',
              cursor: 'pointer',
            }}
            onClick={() => {
              notificationService.markAsRead(item.id);
              setNotifications(notifications.map(n => n.id === item.id ? { ...n, isRead: true } : n));
            }}
          >
            <List.Item.Meta
              title={
                <Text strong={!item.isRead} style={{ fontSize: 14 }}>
                  {item.title}
                </Text>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text style={{ fontSize: 13, color: '#686b82' }}>{item.message}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.createdAt).fromNow()}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        locale={{ emptyText: 'Không có thông báo' }}
      />
    </div>
  );

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ',
      onClick: () => navigate(user?.role === 'Student' ? '/student/profile' : user?.role === 'Tutor' ? '/tutor/profile' : '/admin/dashboard'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Cài đặt',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
        }}
        width={240}
        collapsedWidth={80}
      >
        {/* Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid #dedee5',
        }}>
          <div style={{
            width: 36,
            height: 36,
            backgroundColor: '#7132f5',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#ffffff', fontSize: 20, fontWeight: 700 }}>T</span>
          </div>
          {!collapsed && (
            <span style={{
              marginLeft: 12,
              fontSize: 16,
              fontWeight: 700,
              color: '#101114',
              letterSpacing: '-0.5px',
            }}>
              TutorMatch
            </span>
          )}
        </div>

        {/* Menu */}
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          onClick={handleMenuClick}
          style={{ 
            border: 'none', 
            marginTop: 8,
            backgroundColor: 'transparent',
          }}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header style={{
          backgroundColor: '#ffffff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notifications */}
            <Popover
              content={notificationContent}
              trigger="click"
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 20 }} />}
                  style={{ width: 44, height: 44 }}
                />
              </Badge>
            </Popover>

            {/* User Menu */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  src={user?.avatarUrl}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#7132f5' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#101114' }}>
                    {user?.fullName}
                  </span>
                  <span style={{ fontSize: 12, color: '#686b82' }}>
                    {user?.role === 'Student' ? 'Học sinh' : user?.role === 'Tutor' ? 'Gia sư' : 'Quản trị viên'}
                  </span>
                </div>
              </Space>
            </Dropdown>
          </div>
        </Header>

        {/* Content */}
        <Content style={{
          margin: 24,
          padding: 24,
          backgroundColor: '#f8f9fa',
          borderRadius: 12,
          minHeight: 280,
          overflow: 'auto',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
