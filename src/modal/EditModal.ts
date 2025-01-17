import React from "react";
import { Modal, Form, Input, Button, FormInstance } from "antd";

interface Vendor {
  name: string;
  thumbnail: File | string;
}

interface VendorModalProps {
  title?: string;
  visible: boolean;
  onCancel: () => void;
  onSave: (values: Vendor) => void;
  initialValues?: Partial<Vendor>;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  setEditingVendor: (vendor: Partial<Vendor> | null) => void;
  form: FormInstance;
}

const VendorModal: React.FC<VendorModalProps> = ({
  title = "Edit ",
  visible,
  onCancel,
  onSave,
  initialValues = {},
  isDirty,
  setIsDirty,
  setEditingVendor,
  form,
}) => {
  return (
    <Modal title={title} visible={visible} onCancel={onCancel} footer={null}>
      {visible && (
        <Form
          form={form}
          initialValues={initialValues}
          onValuesChange={(allValues: Partial<Vendor>) => {
            const isChanged = allValues.thumbnail !== initialValues.thumbnail;
            setIsDirty(isChanged);
          }}
          onFinish={(values: Partial<Vendor>) => {
            const updatedValues: Vendor = {
              ...values,
              thumbnail: initialValues.thumbnail || "",
            };
            onSave(updatedValues);
            setIsDirty(false);
          }}
          layout="vertical"
        >
          <Form.Item label="Name" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="Thumbnail" name="thumbnail">
            <div className="flex flex-col items-start gap-4">
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    form.setFieldsValue({ thumbnail: file });
                    setEditingVendor((prev) => ({
                      ...prev,
                      thumbnail: file,
                    }));
                  }
                }}
              />
              {initialValues.thumbnail && (
                <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-lg shadow-md">
                  <img
                    src={
                      initialValues.thumbnail instanceof File
                        ? URL.createObjectURL(initialValues.thumbnail)
                        : initialValues.thumbnail
                    }
                    alt="Thumbnail Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="button"
              onClick={onCancel}
              className="text-black bg-gray-200 border"
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" disabled={!isDirty}>
              Save
            </Button>
          </div>
        </Form>
      )}
    </Modal>
  );
};

export default VendorModal;
