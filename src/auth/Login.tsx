import React, { useState } from 'react';
import { useApp } from '../App';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, Card, Typography, Alert, Space, Checkbox, Spin } from 'antd';
import type { FormInstance } from 'antd/es/form';

const { Title, Text } = Typography;

export function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const formRef = React.useRef<FormInstance>(null);

  const handleSubmit = async (values: { email: string; password: string; remember: boolean }) => {
    setError('');
    setLoading(true);
    try {
      const success = login(values.email, values.password);
      if (!success) {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card
        className="w-full max-w-md shadow-lg hover:shadow-xl transition-shadow duration-300"
        bordered={false}
      >
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
            <UserOutlined className="text-white text-xl" />
          </div>
          <Title level={2} className="mb-2">Employee Clock In/Out</Title>
          <Text type="secondary">Sign in to track your work hours</Text>
        </div>

        <Form
          ref={formRef}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Email address"
              size="large"
              className="hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Password"
              size="large"
              className="hover:border-blue-500 focus:border-blue-500"
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" className="mb-4">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-4 animate-fade-in"
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 h-12 text-base"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Form.Item>
        </Form>

        <Space direction="vertical" size="middle" className="w-full mt-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Text strong className="text-base">Admin Demo:</Text>
            <div>
              <Text type="secondary">Email: admin@company.com</Text>
            </div>
            <div>
              <Text type="secondary">Password: admin123</Text>
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Text strong className="text-base">Created Employees:</Text>
            <div>
              <Text type="secondary">Use their email and password: password123</Text>
            </div>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Text strong className="text-base">Legacy Employee:</Text>
            <div>
              <Text type="secondary">Email: employee@company.com</Text>
            </div>
            <div>
              <Text type="secondary">Password: password</Text>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
}