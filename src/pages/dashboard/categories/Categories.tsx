import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Form, Input, Modal } from "antd";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import ButtonCustom from "../../../components/button/ButtonCustom";
import Table from "../../../components/table/Table";
import useAuth from "../../../hooks/useAuth";
import useDeleteItem from "../../../hooks/useDeleteItem";
import useToast from "../../../hooks/useToast";

interface Categories {
  id: number;
  name: string;
  thumbnail?: any | null;
  createdAt: string;
}
const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Categories[]>([]);
  const [error, setError] = useState<string>("");
  const [editingCate, setEditingCate] = useState<Categories | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [newCategoies, setNewCategoies] = useState<{
    name: string;
    thumbnail?: any | null;
  }>({
    name: "",
    thumbnail: null,
  });
  const { token } = useAuth();
  const { notifyError, notifySuccess } = useToast();
  const { deleteItem } = useDeleteItem(
    "http://localhost:3000/categories",
    token,
    setCategories
  );

  useEffect(() => {
    const fetchCate = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
        console.log(response);
      } catch {
        setError("Failed to fetch Cate.");
        console.log(error);
      }
    };
    fetchCate();
  }, []);

  let imageUrl: string = "";
  const handleAddCate = async () => {
    try {
      const newCateData = {
        name: newCategoies.name,
        thumbnail: newCategoies.thumbnail,
      };
      const addCateResponse = await api.post("/categories", newCateData);
      setCategories((prevCate) => [...prevCate, addCateResponse.data]);
      form.resetFields();
      notifySuccess("Add New Successfully!");
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding cate:", err);
      setError("Failed to add cate.");
      notifyError("Failed Add!");
    }
  };

  const handleDeleteCate = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this Categories?",
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

  const handleSaveCate = async (values: { name: string; thumbnail: File }) => {
    const formData = new FormData();
    formData.append("file", values.thumbnail);
    try {
      let imageUrl = editingCate?.thumbnail; // Giữ lại thumbnail nếu không thay đổi
      if (values.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append("file", values.thumbnail);
        const uploadResponse = await api.postForm("/upload", formData);
        imageUrl = uploadResponse.data.url.replace("htpp:", "http:");
      }
      const updatedCate = {
        ...values,
        thumbnail: imageUrl,
      };

      await api.patch(`/categories/${editingCate?.id}`, updatedCate);

      setCategories((prevCate) =>
        prevCate.map((cate) =>
          cate.id === editingCate?.id ? { ...cate, ...updatedCate } : cate
        )
      );

      setEditingCate(null);
      notifySuccess("Edit Successfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save cate.");
      notifyError("Failed To Save!");
    }
  };
  const handleEditCate = (cate: Categories) => {
    setEditingCate(cate);
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
        setNewCategoies({ ...newCategoies, thumbnail: imageUrl });
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }
  };

  const [form] = Form.useForm();

  // dùng useEffect để gọi lại form để cập nhật initvalue cho trường name
  useEffect(() => {
    if (editingCate) {
      form.setFieldsValue({
        name: editingCate.name,
      });
    }
  }, [editingCate, form]);
  return (
    <>
      <div className="flex justify-between ">
        <h1 className="mb-10 text-3xl font-bold">Categories</h1>
        <ButtonCustom
          className="p-4"
          text="Add Categories"
          onClick={() => setShowAddModal(true)}
        ></ButtonCustom>
      </div>
      <Table>
        <thead className="bg-gray-200 rounded-none">
          <tr className="text-[14px] leading-[21px] font-bold text-[#00152a]">
            <th className="p-2 text-left">Id</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Thumbnail</th>
            <th className="p-2 text-left">CreatedAt</th>
            <th className="p-2 text-left"> Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 &&
            categories.map((cate: any, index) => (
              <tr
                key={index}
                className="text-lg border-b font-normal text-[14px] leading-[21px] hover:bg-gray-100"
              >
                <td className="p-4">{cate.id}</td>
                <td>{cate.name}</td>
                <td>
                  <img
                    className="w-[50px] h-[50px] rounded-lg "
                    src={cate.thumbnail}
                    alt=""
                  />
                </td>
                <td className="italic text-gray-400">{cate.createdAt}</td>
                <td>
                  <div className="flex items-center text-gray-500 cursor-pointer gap-x-3">
                    <EditOutlined
                      onClick={() => handleEditCate(cate)}
                      className="p-2 text-2xl text-blue-400 border border-gray"
                    />
                    <DeleteOutlined
                      className="p-2 text-2xl text-red-400 border border-gray"
                      onClick={() => handleDeleteCate(cate.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* modal edit cate */}
      <Modal
        title="Edit Categories"
        visible={!!editingCate}
        onCancel={() => (setEditingCate(null), setIsDirty(false))}
        footer={null}
      >
        {editingCate && (
          <Form
            form={form}
            initialValues={{
              // name: editingCate?.name, // Gán giá trị name từ vendor hiện tại
              ...editingCate,
            }}
            onValuesChange={(allValues) => {
              const isChanged =
                allValues.name !== editingCate?.name ||
                allValues.thumbnail !== editingCate?.thumbnail;
              setIsDirty(isChanged);
            }}
            onFinish={(values) => {
              const updatedValues = {
                ...values,
                thumbnail: editingCate?.thumbnail, // Giữ thumbnail cũ nếu không thay đổi
              };
              handleSaveCate(updatedValues);
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
                      setEditingCate({
                        ...editingCate,
                        thumbnail: file,
                      });
                    }
                  }}
                />

                {editingCate.thumbnail && (
                  <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-lg shadow-md">
                    <img
                      src={
                        editingCate.thumbnail instanceof File
                          ? URL.createObjectURL(editingCate.thumbnail)
                          : editingCate.thumbnail
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
                text="Cancel"
                type="button"
                className="text-black bg-gray-200 border "
                onClick={() => (setEditingCate(null), setIsDirty(false))}
              ></ButtonCustom>
              <ButtonCustom
                text="Save"
                htmlType="submit"
                type="primary"
                disabled={!isDirty}
              >
                Save
              </ButtonCustom>
            </div>
          </Form>
        )}
      </Modal>

      {/* Modal add new cate */}
      <Modal
        title="Add New Categories"
        visible={showAddModal}
        key={showAddModal ? "show" : "hide"}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
        }}
        onOk={handleAddCate}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the cate name!" }]}
          >
            <Input
              value={newCategoies.name}
              onChange={(e) =>
                setNewCategoies({ ...newCategoies, name: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Thumbnail">
            <div className="flex flex-col items-start gap-4">
              <Input type="file" onChange={handleFileChange} />
              {newCategoies.thumbnail && (
                <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-lg shadow-md">
                  {newCategoies.thumbnail && (
                    <img
                      src={newCategoies?.thumbnail}
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
              onClick={handleAddCate}
            >
              Save
            </ButtonCustom>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default Categories;
