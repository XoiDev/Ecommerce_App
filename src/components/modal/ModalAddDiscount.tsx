import React from "react";
import { Modal, Form, Input, InputNumber, Select, Switch } from "antd";

const ModalAddDiscount: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: any) => void;
  products: { id: number; name: string }[];
}> = ({ visible, onCancel, onFinish, products }) => {
  return (
    <Modal
      title="Add New Discount"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Description" name="description">
          <Input />
        </Form.Item>
        <Form.Item
          label="Min Amount"
          name="minAmount"
          rules={[{ required: true }]}
        >
          <InputNumber className="w-full" />
        </Form.Item>
        <Form.Item
          label="Discount Rate"
          name="discountRate"
          rules={[{ required: true }]}
        >
          <InputNumber className="w-full" min={0} max={100} />
        </Form.Item>
        <Form.Item
          label="Product IDs"
          name="productIds"
          rules={[{ required: true }]}
        >
          <Select
            mode="multiple"
            placeholder="Select products"
            className="w-full"
          >
            {products.map((product) => (
              <Select.Option key={product.id} value={product.id}>
                {product.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Number Code Apply" name="numberCodeApply">
          <InputNumber className="w-full" min={1} />
        </Form.Item>
        <Form.Item label="Active" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ButtonCustom text="Cancel" onClick={onCancel} className="mr-2" />
          <ButtonCustom text="Save" type="primary" htmlType="submit" />
        </div>
      </Form>
    </Modal>
  );
};

export default ModalAddDiscount;
