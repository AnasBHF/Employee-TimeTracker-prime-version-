import React, { useState } from 'react';
import { useApp } from '../App';
import { Form, Input, Select, Switch, Button, Space } from 'antd';

interface EmployeeFormProps {
  employee?: {
    id: string;
    name: string;
    email: string;
    department: string;
    position: string;
    isActive: boolean;
    password?: string;
  };
  onSubmit: (employee: any) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const { departments, positions } = useApp();
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        name: employee?.name || '',
        email: employee?.email || '',
        department: employee?.department || '',
        position: employee?.position || '',
        isActive: employee?.isActive ?? true,
        password: employee?.password || ''
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please enter employee name' }]}
      >
        <Input size="large" placeholder="Enter employee name" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please enter email address' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input size="large" placeholder="Enter email address" />
      </Form.Item>

      <Form.Item
        name="department"
        label="Department"
        rules={[{ required: true, message: 'Please select department' }]}
      >
        <Select
          size="large"
          placeholder="Select Department"
          options={departments.map(dept => ({
            value: dept,
            label: dept
          }))}
        />
      </Form.Item>

      <Form.Item
        name="position"
        label="Position"
        rules={[{ required: true, message: 'Please select position' }]}
      >
        <Select
          size="large"
          placeholder="Select Position"
          options={positions.map(pos => ({
            value: pos,
            label: pos
          }))}
        />
      </Form.Item>

      <Form.Item
        name="isActive"
        label="Status"
        valuePropName="checked"
      >
        <Switch
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          defaultChecked
        />
      </Form.Item>

      {!employee && (
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please enter password' }]}
        >
          <Input.Password size="large" placeholder="Enter password" />
        </Form.Item>
      )}

      <Form.Item>
        <Space className="w-full justify-end">
          <Button onClick={onCancel} size="large">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" size="large">
            {employee ? 'Update' : 'Create'} Employee
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}