import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import ButtonCustom from "../../../components/button/ButtonCustom";
import Table from "../../../components/table/Table";
import useAuth from "../../../hooks/useAuth";
import useDeleteItem from "../../../hooks/useDeleteItem";
import useToast from "../../../hooks/useToast";

interface Vendor {
  id: number;
  name: string;
  thumbnail?: string | null;
  createdAt: string;
}
const Vendors: React.FC = () => {
  const { token } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [newVendor, setNewVendor] = useState<{
    name: string;
    thumbnail?: string | null;
  }>({
    name: "",
    thumbnail: null,
  });

  const { deleteItem } = useDeleteItem(
    "http://localhost:3000/vendors",
    token,
    setVendors
  );
  const { notifySuccess, notifyError } = useToast();
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await api.get("/vendors");
        setVendors(response.data);
      } catch (err) {
        setError("Failed to fetch vendors.");
      }
    };
    fetchVendors();
  }, []);

  let imageUrl: string = "";

  const handleAddVendor = async () => {
    try {
      const newVendorData = {
        name: newVendor.name,
        thumbnail: newVendor.thumbnail,
      };

      const addVendorResponse = await api.post("/vendors", newVendorData);
      setVendors((prevVendors) => [...prevVendors, addVendorResponse.data]);
      setShowAddModal(false);
      form.resetFields();
      notifySuccess("Add New Successfully!");
      setNewVendor({ name: "", thumbnail: "" });
    } catch (err) {
      console.error("Error adding vendor:", err);
      setError("Failed to add vendor.");
      notifyError("Failed Add!");
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const uploadResponse = await api.postForm("upload", formData);
        imageUrl = uploadResponse.data.url.replace("htpp:", "http:");
        setNewVendor({ ...newVendor, thumbnail: imageUrl });
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }
  };

  const handleDeleteVendor = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this vendor?",
      onOk: () => {
        deleteItem(id);
      },
      footer: (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <ButtonCustom
            text="Cancel"
            className="text-black bg-gray-200 border "
            onClick={() => Modal.destroyAll()}
          ></ButtonCustom>
          <ButtonCustom
            className="bg-red-400 hover:bg-red-700"
            text="Delete"
            type="primary"
            htmlType="submit"
            onClick={() => {
              deleteItem(id);
              Modal.destroyAll(); // Đóng modal sau khi thực hiện xóa
            }}
          ></ButtonCustom>
        </div>
      ),
    });
  };

  const handleSaveVendor = async (values: {
    name: string;
    thumbnail?: File;
  }) => {
    try {
      let imageUrl = editingVendor?.thumbnail; // Giữ lại thumbnail nếu không thay đổi
      if (values.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append("file", values.thumbnail);
        const uploadResponse = await api.postForm("/upload", formData);
        imageUrl = uploadResponse.data.url.replace("htpp:", "http:");
      }
      const updatedVendor = {
        name: values.name,
        thumbnail: imageUrl, //truyền lại thumnail cũ nếu không có thumb mới
      };
      await api.patch(`/vendors/${editingVendor?.id}`, updatedVendor);
      setVendors((prevVendors) =>
        prevVendors.map((vendor) =>
          vendor.id === editingVendor?.id
            ? { ...vendor, ...updatedVendor }
            : vendor
        )
      );
      setEditingVendor(null);
      notifySuccess("Edit Successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save vendor.");
      notifyError("Failed To Save!");
    }
  };
  const handleEditVendor = (vendor: Vendor) => {
    setEditingVendor(vendor);
    if (editingVendor) {
      form.setFieldsValue({
        name: editingVendor.name,
      });
    }
  };

  const [form] = Form.useForm();
  // dùng useEffect để gọi lại form để cập nhật initvalue cho trường name
  useEffect(() => {
    if (editingVendor) {
      form.setFieldsValue({
        name: editingVendor.name,
      });
    }
  }, [editingVendor, form]);
  return (
    <>
      <div className="flex justify-between ">
        <h1 className="mb-10 text-3xl font-bold">Vendors</h1>

        <ButtonCustom
          text=" Add Vendor"
          className="p-4"
          onClick={() => setShowAddModal(true)}
        ></ButtonCustom>
      </div>
      <Table>
        <thead className="bg-gray-200">
          <tr className="text-[14px] leading-[21px] font-bold text-[#00152a]">
            <th className="p-2 text-left">Id</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Thumbnail</th>
            <th className="p-2 text-left">CreatedAt</th>
            <th className="p-2 text-left"> Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length > 0 &&
            vendors.map((vendor, index) => (
              <tr
                key={index}
                className="text-lg border-b font-normal text-[14px] leading-[21px] hover:bg-gray-100"
              >
                <td className="p-4">{vendor.id}</td>
                <td>{vendor.name}</td>
                <td>
                  <img
                    className="w-[50px] h-[50px] rounded-lg "
                    src={vendor.thumbnail}
                    alt=""
                  />
                </td>
                <td className="italic text-gray-400">{vendor.createdAt}</td>
                <td>
                  <div className="flex items-center text-gray-500 cursor-pointer gap-x-3">
                    <EditOutlined
                      onClick={() => handleEditVendor(vendor)}
                      className="p-2 text-2xl text-blue-400 border border-gray"
                    />
                    <DeleteOutlined
                      className="p-2 text-2xl text-red-400 border border-gray"
                      onClick={() => handleDeleteVendor(vendor.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* modal edit vendor */}

      <Modal
        title="Edit Vendor"
        visible={!!editingVendor}
        onCancel={() => (setEditingVendor(null), setIsDirty(false))}
        footer={null}
      >
        {editingVendor && (
          <Form
            form={form}
            initialValues={{
              ...editingVendor,
            }}
            onValuesChange={(allValues) => {
              const isChanged =
                // allValues.name !== editingVendor?.name ||
                allValues.thumbnail !== editingVendor?.thumbnail;
              setIsDirty(isChanged);
              console.log(allValues);
            }}
            onFinish={(values) => {
              const updatedValues = {
                ...values,
                thumbnail: editingVendor?.thumbnail, // Giữ thumbnail cũ nếu không thay đổi
              };
              handleSaveVendor(updatedValues);
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
                      setEditingVendor({
                        ...editingVendor,
                        thumbnail: file,
                      });
                    }
                  }}
                />
                {editingVendor.thumbnail && (
                  <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-lg shadow-md">
                    <img
                      src={
                        editingVendor.thumbnail instanceof File
                          ? URL.createObjectURL(editingVendor.thumbnail)
                          : editingVendor.thumbnail
                      }
                      alt="Thumbnail Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ButtonCustom
                type="button"
                text="Cancel"
                className="text-black bg-gray-200 border "
                onClick={() => (setEditingVendor(null), setIsDirty(false))}
              ></ButtonCustom>
              <ButtonCustom text="Save" htmlType="submit" disabled={!isDirty}>
                Save
              </ButtonCustom>
            </div>
          </Form>
        )}
      </Modal>

      {/* add new vendor */}
      <Modal
        title="Add New Vendor"
        key={showAddModal ? "show" : "hide"}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields(); // Reset form fields khi đóng modal
        }}
        visible={showAddModal}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter the vendor name!" },
            ]}
          >
            <Input
              value={newVendor.name}
              onChange={(e) =>
                setNewVendor({ ...newVendor, name: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Thumbnail">
            <div className="flex flex-col items-start gap-4">
              <Input type="file" onChange={handleFileChange} />
              {newVendor.thumbnail && (
                <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-lg shadow-md">
                  {newVendor.thumbnail && (
                    <img
                      src={newVendor?.thumbnail}
                      alt="Thumbnail Preview"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              )}
            </div>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <ButtonCustom
              text="Cancel"
              className="text-black bg-gray-200 border "
              onClick={() => setShowAddModal(false)}
            ></ButtonCustom>
            <ButtonCustom
              text="Save"
              type="primary"
              htmlType="submit"
              onClick={handleAddVendor}
            >
              Save
            </ButtonCustom>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default Vendors;
