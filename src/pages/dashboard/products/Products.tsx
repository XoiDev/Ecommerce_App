import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Form, Input, Modal, Pagination, Select } from "antd";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import ButtonCustom from "../../../components/button/ButtonCustom";
import InputCustom from "../../../components/input/InputCustom";
import Table from "../../../components/table/Table";
import useAuth from "../../../hooks/useAuth";
import useDeleteItem from "../../../hooks/useDeleteItem";
import useToast from "../../../hooks/useToast";

interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail?: string | null;
  vendorId: number | null;
  categoryId: number | null;
  desc: string;
  rating: number;
  createdAt?: string;
}
interface Vendor {
  id: number;
  name: string;
  thumbnail?: string;
}

interface Cate {
  id: number;
  name: string;
  thumbnail?: string;
}

const Products: React.FC = () => {
  const { token } = useAuth();
  const [product, setProduct] = useState<Product[]>([]);
  const [vendor, setVendor] = useState<Vendor[]>([]);
  const [cate, setCate] = useState<Cate[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [filterSortby, setFilterSortby] = useState<string | null>(null);
  const [filterSortOrd, setFilterSortOrd] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(true);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    desc?: string;
    thumbnail?: string | null;
    price: number;
    vendorId: number | null;
    categoryId: number | null;
  }>({
    name: "",
    desc: "",
    thumbnail: null,
    price: 0,
    vendorId: null,
    categoryId: 1,
  });
  const { Option } = Select;
  const { deleteItem } = useDeleteItem(
    "http://localhost:3000/products",
    token,
    setProduct
  );
  let imageUrl: string = "";
  const { notifySuccess, notifyError } = useToast();

  // handle debounce search
  useEffect(() => {
    const handleDebounce = debounce((term: string) => {
      setDebouncedSearchTerm(term);
      setPage(1);
    }, 500);

    handleDebounce(searchTerm);
    return () => handleDebounce.cancel(); // handle cleanup
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = `/products?page=${page}&limit=${pageSize}`;
        if (filterSortby) {
          url += `&sortBy=${filterSortby}`;
        }
        if (filterSortOrd) {
          url += `&sortOrder=${filterSortOrd}`;
        }
        if (debouncedSearchTerm) {
          url += `&name=${debouncedSearchTerm}`;
        }
        const response = await api.get(url);
        setProduct(response.data.data);
        setTotal(response.data.total);
      } catch {
        setError("Failed to fetch products.");
        console.log(error);
      }
    };

    fetchProducts();
  }, [token, page, pageSize, debouncedSearchTerm, filterSortby, filterSortOrd]);

  // call cate,vendor
  useEffect(() => {
    const fetchVendorId = async () => {
      try {
        const response = await api.get(`/vendors`);
        setVendor(response.data);
      } catch {
        setError("Failed to fetch products.");
      }
    };

    const fethCateId = async () => {
      try {
        const response = await api.get(`/categories`);
        setCate(response.data.data);
      } catch {
        setError("Failed to fetch products.");
      }
    };

    fetchVendorId();
    fethCateId();
  }, []);

  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page); // Update page
    setPageSize(pageSize); // Update page size
  };

  const handleAddProduct = async () => {
    try {
      const newProductdata = {
        ...newProduct,
      };
      const addProductResponse = await api.post("/products", newProductdata);
      setProduct((proProduct) => [...proProduct, addProductResponse.data]);
      setShowAddModal(false);
      form.resetFields();
      notifySuccess("Add new Product Successfully!");
    } catch (err) {
      console.log("Error adding vendor:", err);
      setError("Failed to add vendor.");
      notifyError("Failed To Add!");
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
        setNewProduct({ ...newProduct, thumbnail: imageUrl });
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }
  };

  const handleDeleteVendor = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this product?",
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

  const handleSaveProduct = async (values: {
    name: string;
    thumbnail?: File;
    desc: string;
    price: number;
    vendorId: number;
    categoryId: number;
  }) => {
    try {
      let imageUrl = editingProduct?.thumbnail;
      if (values.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append("file", values.thumbnail);
        const uploadResponse = await api.postForm("/upload", formData);
        imageUrl = uploadResponse.data.url.replace("htpp:", "http:");
      }
      const updateProduct = {
        name: values.name,
        thumbnail: imageUrl,
        desc: values.desc,
        price: Number(values.price),
        vendorId: Number(values.vendorId),
        categoryId: Number(values.categoryId),
      };

      await api.patch(`/products/${editingProduct?.id}`, updateProduct);
      setProduct((preProduct) =>
        preProduct.map((product) =>
          product.id === editingProduct?.id
            ? { ...product, ...updateProduct }
            : product
        )
      );
      setEditingProduct(null);
      setIsDirty(true);
      notifySuccess("Edit Succesfully!");
    } catch (err) {
      console.error(err);
      setError("Failed to save vendor.");
      notifyError("Failed Edit!");
    }
  };
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      desc: product.desc,
      price: product.price,
      categoryId: product.categoryId,
      vendorId: product.vendorId,
    });
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await api.get(`/products/${id}`);
      setProductDetail(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError("Failed to fetch discount details.");
      console.log(err);
    }
  };

  const [form] = Form.useForm();

  return (
    <>
      <div className="flex justify-between ">
        <h1 className="mb-10 text-3xl font-bold">Products</h1>

        <ButtonCustom
          text="Add Product"
          className="p-4"
          onClick={() => setShowAddModal(true)}
        ></ButtonCustom>
      </div>
      <div className="flex items-center justify-between mb-4">
        <InputCustom
          placeholder="Search Products"
          className="w-[50%]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="custom-select"
          placeholder="Filter SortBy"
          value={filterSortby}
          onChange={(value) => setFilterSortby(value)}
          style={{ width: "23%" }}
        >
          <Option value="price">
            <div className="font-medium text-[#202123]">price</div>
          </Option>
          <Option value="createdAt">
            <div className="font-medium text-[#202123]">createdAt</div>
          </Option>
        </Select>
        <Select
          className="custom-select"
          placeholder="Filter SortOrder"
          value={filterSortOrd}
          onChange={(value) => setFilterSortOrd(value)}
          style={{ width: "23%" }}
        >
          <Option value="desc">
            <div className="font-medium text-[#202123]">desc</div>
          </Option>
          <Option value="asc">
            <div className="font-medium text-[#202123]">asc</div>
          </Option>
        </Select>
      </div>
      <Table>
        <thead className="bg-gray-200">
          <tr className="text-[14px] leading-[21px] font-bold text-[#00152a]">
            <th className="p-2 text-left">Id</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Price</th>
            <th className="p-2 text-left">Created</th>
            <th className="p-2 text-left">Thumbnail</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Vendor</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {product.length > 0 &&
            product.map((pro, index) => (
              <tr
                key={index}
                className="text-lg border-b font-normal text-[14px] leading-[21px] hover:bg-gray-100"
              >
                <td className="p-4 ">{pro.id}</td>
                <td>{pro.name}</td>
                <td className="">{pro.price} $</td>
                <td className="">{pro.createdAt}</td>
                <td>
                  <img
                    className=" w-[50px] h-[50px] rounded-lg"
                    src={pro.thumbnail}
                    alt=""
                  />
                </td>

                {cate?.length > 0 && pro.categoryId && (
                  <td className="">
                    {pro.categoryId}
                    {cate.find((cate) => cate.id === pro.categoryId)?.name ||
                      "N/A"}
                  </td>
                )}
                {vendor?.length > 0 && (
                  <td className="rounded-sm ">
                    {vendor.find((vendor) => vendor.id === pro.vendorId)
                      ?.name || "N/A"}
                  </td>
                )}
                <td>
                  <div className="flex items-center text-gray-500 cursor-pointer gap-x-3">
                    <EyeOutlined
                      onClick={() => handleViewDetails(pro.id)}
                      className="p-2 text-2xl text-green-400 border border-gray"
                    />
                    <EditOutlined
                      onClick={() => handleEditProduct(pro)}
                      className="p-2 text-2xl text-blue-400 border border-gray"
                    />
                    <DeleteOutlined
                      className="p-2 text-2xl text-red-400 border border-gray"
                      onClick={() => handleDeleteVendor(pro.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* modal edit product */}
      <Modal
        title="Edit Vendor"
        visible={!!editingProduct}
        onCancel={() => (setEditingProduct(null), setIsDirty(true))}
        footer={null}
      >
        {editingProduct && (
          <Form
            initialValues={{
              ...editingProduct,
            }}
            onValuesChange={(allValues) => {
              const isChanged = Object.keys(allValues).some(
                (key) => allValues[key] !== editingProduct?.[key]
              );
              setIsDirty(!isChanged);
            }}
            onFinish={(values) => {
              const updatedValues = {
                ...values,
                thumbnail: editingProduct?.thumbnail, // Giữ thumbnail cũ nếu không thay đổi
              };
              handleSaveProduct(updatedValues);
            }}
            form={form}
            layout="vertical"
          >
            <Form.Item label="Name" name="name">
              <Input />
            </Form.Item>
            <Form.Item label="Desc" name="desc">
              <Input />
            </Form.Item>
            <Form.Item label="Price" name="price">
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
                      setEditingProduct({
                        ...editingProduct,
                        thumbnail: file,
                      });
                    }
                  }}
                />
                {editingProduct.thumbnail && (
                  <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-lg shadow-md">
                    <img
                      src={
                        editingProduct.thumbnail instanceof File
                          ? URL.createObjectURL(editingProduct.thumbnail)
                          : editingProduct.thumbnail
                      }
                      alt="Thumbnail Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>
            </Form.Item>
            <Form.Item label="Vendor ID" name="vendorId">
              <Select
                placeholder="Select products"
                optionLabelProp="label"
                className="w-full"
                dropdownRender={(menu) => <>{menu}</>}
              >
                {vendor &&
                  vendor?.map((ven) => (
                    <Option key={ven.id} value={ven.id} label={ven.name}>
                      {ven.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item label="Category IDs" name="categoryId">
              <Select
                mode="multiple"
                placeholder="Select Categories"
                optionLabelProp="label"
                className="w-full"
                dropdownRender={(menu) => <>{menu}</>}
              >
                {cate?.map((cate) => (
                  <Option key={cate.id} value={cate.id} label={cate.name}>
                    {cate.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ButtonCustom
                type="button"
                text="Cancel"
                className="text-black bg-gray-200 border "
                onClick={() => (setEditingProduct(null), setIsDirty(true))}
              ></ButtonCustom>
              <ButtonCustom text="Save" htmlType="submit" disabled={isDirty}>
                Save
              </ButtonCustom>
            </div>
          </Form>
        )}
      </Modal>

      {/* add new product */}
      <Modal
        key={showAddModal ? "show" : "hide"}
        title="Add New Product"
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
              { required: true, message: "Please enter the product name!" },
            ]}
          >
            <Input
              value={newProduct.name}
              onChange={(e) =>
                setNewProduct({ ...newProduct, name: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Desc" name="desc">
            <Input
              value={newProduct.desc}
              onChange={(e) =>
                setNewProduct({ ...newProduct, desc: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please enter the Price!" }]}
          >
            <Input
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  price: parseFloat(e.target.value),
                })
              }
            />
          </Form.Item>
          <Form.Item label="Thumbnail">
            <div className="flex flex-col items-start gap-4">
              <Input type="file" onChange={handleFileChange} />
              {newProduct.thumbnail && (
                <div className="relative w-20 h-20 overflow-hidden border border-gray-200 rounded-lg shadow-md">
                  {newProduct.thumbnail && (
                    <img
                      src={newProduct?.thumbnail}
                      alt="Thumbnail Preview"
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              )}
            </div>
          </Form.Item>
          <Form.Item
            label="Vendor ID"
            name="vendorId"
            rules={[
              { required: true, message: "Please enter the Vendor name!" },
            ]}
          >
            <Select
              // mode="multiple"
              placeholder="Select vendors"
              optionLabelProp="label"
              className="w-full"
              dropdownRender={(menu) => <>{menu}</>}
              onChange={(value) =>
                setNewProduct({ ...newProduct, vendorId: value })
              }
            >
              {vendor &&
                vendor?.map((ven) => (
                  <Option key={ven.id} value={ven.id} label={ven.name}>
                    {ven.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Category IDs"
            name="categoryId"
            rules={[
              { required: true, message: "Please enter the category name!" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select categories"
              optionLabelProp="label"
              className="w-full"
              dropdownRender={(menu) => <>{menu}</>}
              onChange={(value) =>
                setNewProduct({ ...newProduct, categoryId: value })
              }
            >
              {cate?.map((cate) => (
                <Option key={cate.id} value={cate.id} label={cate.name}>
                  {cate.name}
                </Option>
              ))}
            </Select>
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
              onClick={handleAddProduct}
            >
              Save
            </ButtonCustom>
          </div>
        </Form>
      </Modal>

      {/* Modal detail */}
      <Modal
        title="Discount Details"
        visible={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={null}
        className="modal-detail"
      >
        {productDetail && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <strong>ID:</strong> {productDetail.id}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Name:</strong> {productDetail.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Price:</strong> {productDetail.price} $
            </p>
            <p className="text-sm text-gray-700">
              <strong>Thumbnail:</strong>{" "}
              <img src={productDetail.thumbnail} alt="" />
            </p>
            {vendor && (
              <p className="text-sm text-gray-700">
                <strong>Vendor Name:</strong>{" "}
                {vendor[productDetail.vendorId - 1]?.name}
              </p>
            )}

            {cate && (
              <p className="text-sm text-gray-700">
                <strong>Categories:</strong>{" "}
                {vendor[productDetail.categoryId - 1]?.name}
                {productDetail.categoryId}
              </p>
            )}

            <p className="text-sm text-gray-700">
              <strong>CategoryId:</strong>
            </p>
            <p className="text-sm text-gray-700">
              <strong>Rating:</strong> {productDetail.rating}
            </p>
          </div>
        )}
      </Modal>
      <Pagination
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={handlePageChange}
        showSizeChanger
        pageSizeOptions={["10", "20", "50"]}
        onShowSizeChange={(size) => setPageSize(size)}
        style={{ marginTop: "20px", textAlign: "center" }}
      />
    </>
  );
};

export default Products;
