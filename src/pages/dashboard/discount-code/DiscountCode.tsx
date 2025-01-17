import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Spin,
  Switch,
} from "antd";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import ButtonCustom from "../../../components/button/ButtonCustom";
import Table from "../../../components/table/Table";
import useAuth from "../../../hooks/useAuth";
import useDeleteItem from "../../../hooks/useDeleteItem";
import "./Discount.scss";
import { debounce } from "lodash";
import { Select } from "antd";
import dayjs from "dayjs";
import InputCustom from "../../../components/input/InputCustom";
import useToast from "../../../hooks/useToast";

interface Discount {
  id: number;
  description: string;
  minAmount: number;
  discountRate: number;
  productIds: [string];
  numberCodeApply: number;
  isActive: string;
  productDiscountCodes: [] | null;
  updatedAt?: string;
  code?: string;
  createdAt: string;
}

const DiscountCode: React.FC = () => {
  const [discountCode, setDiscountCode] = useState<Discount[]>([]);
  const [editingDiscountCode, setEditingDiscount] = useState<Discount | null>(
    null
  );
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [error, setError] = useState<string | null>("");
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isDirty, setIsDirty] = useState<boolean>(true);
  const [discountDetails, setDiscountDetails] = useState<Discount | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [pageProduct, setPageProduct] = useState(1);
  const [pageProTotal, setPageProTotal] = useState(2); // Cập nhật totalPage sau khi nhận được dữ liệu
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterSortby, setFilterSortby] = useState<string | null>(null);
  const [filterSortOrd, setFilterSortOrd] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [newDiscountCode, setNewDiscountCode] = useState<{
    desc?: string;
    minAmount: number | null;
    discountRate: number | null;
    productIds: [string] | null;
    numberCodeApply?: number | null;
  }>({
    desc: "",
    minAmount: null,
    discountRate: null,
    productIds: null,
    numberCodeApply: null,
  });
  const createdAtFormatted = dayjs(discountDetails?.createdAt).format(
    "DD/MM/YYYY HH:mm"
  );
  const updatedAtFormatted = dayjs(discountDetails?.updatedAt).format(
    "DD/MM/YYYY HH:mm"
  );
  const { Option } = Select;
  const [form] = Form.useForm();
  const { notifyError, notifySuccess } = useToast();
  // handle debounce
  useEffect(() => {
    const handleDebounce = debounce((term: string) => {
      setDebouncedSearchTerm(term);
      setPage(1);
    }, 500);

    handleDebounce(searchTerm);
    return () => handleDebounce.cancel(); // handle cleanup
  }, [searchTerm]);
  // filter
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        let url = `/discount-codes?page=${page}&limit=${pageSize}`;
        if (filterSortby) {
          url += `&sortBy=${filterSortby}`;
        }
        if (filterSortOrd) {
          url += `&sortOrder=${filterSortOrd}`;
        }
        if (debouncedSearchTerm) {
          url += `&code=${debouncedSearchTerm}`;
        }
        if (filterActive !== undefined && filterActive !== null) {
          url += `&active=${filterActive}`;
        }
        const response = await api.get(url);
        setDiscountCode(response.data.data);
        setTotal(response.data.total);
      } catch {
        setError("Failed to fetch discountCode.");
      }
    };

    fetchDiscounts();
  }, [
    token,
    page,
    pageSize,
    debouncedSearchTerm,
    filterActive,
    filterSortby,
    filterSortOrd,
  ]);
  // fetch product
  useEffect(() => {
    const fetchProducts = async () => {
      // if (pageProduct > pageProTotal) return;
      setLoading(true);
      try {
        const response = await api.get(
          `/products?page=${pageProduct}&limit=10`
        );
        setPageProTotal(response.data.totalPages);
        setProducts((prevProducts) => [...prevProducts, ...response.data.data]);
      } catch (err) {
        setError("Failed to fetch products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // fetchProducts();
    if (pageProduct <= pageProTotal || pageProTotal === 0) {
      fetchProducts();
    }
  }, [token, pageProduct, pageProTotal]);

  const handleLoadMore = () => {
    if (pageProduct < pageProTotal) {
      setPageProduct((prevPage) => prevPage + 1);
    }
  };
  const { deleteItem } = useDeleteItem(
    "http://localhost:3000/discount-codes",
    token,
    setDiscountCode
  );

  const handleAddDiscount = async () => {
    try {
      // setError(null);
      const newDiscount = {
        ...newDiscountCode,
      };
      const response = await api.post("/discount-codes", newDiscount);
      setDiscountCode([...discountCode, response.data]);
      setShowAddModal(false);
      form.resetFields();
      notifySuccess("Add New Succesfully!");
    } catch (err) {
      console.log(err);
      console.log("error", error);
      setError("Failed to add discount.");
      notifyError("Failed To Add!");
    }
  };

  const handleSaveDiscount = async (values: any) => {
    if (editingDiscountCode) {
      console.log("edit", editingDiscountCode);
      try {
        const updatedValues = {
          ...values,
        };
        await api.patch(
          `/discount-codes/${editingDiscountCode.id}`,
          updatedValues
        );
        setDiscountCode(
          discountCode.map((discount) =>
            discount.id === editingDiscountCode.id
              ? { ...discount, ...updatedValues }
              : discount
          )
        );
        setEditingDiscount(null);
        setIsDirty(true);
        notifySuccess("Edit Succesfully!");
      } catch (err) {
        console.error(err);
        setError("Failed to save discount.");
        notifyError("Failed To Save!");
      }
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await api.get(`/discount-codes/${id}`);
      setDiscountDetails(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError("Failed to fetch discount details.");
      console.log(err);
    }
  };

  const handleDeleteDiscount = (id: number) => {
    Modal.confirm({
      title: "Are you sure you want to delete this discount?",
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

  const handleEditDiscount = (discount: Discount) => {
    setEditingDiscount(discount);
    form.setFieldsValue({
      description: discount.description,
      minAmount: discount.minAmount,
      discountRate: discount.discountRate,
      numberCodeApply: discount.numberCodeApply,
    });
  };
  const handlePageChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  };
  const uniqueProducts = products.filter(
    (product, index, self) =>
      index === self.findIndex((p) => p.id === product.id)
  );

  return (
    <>
      <div className="flex justify-between">
        <h1 className="mb-10 text-3xl font-bold">Discounts Code</h1>
        <ButtonCustom
          className="p-4"
          text="Add Discount"
          onClick={() => setShowAddModal(true)}
        ></ButtonCustom>
      </div>
      <div className="flex items-center justify-between mb-4">
        <InputCustom
          placeholder="Search discountCode"
          className="w-[50%]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="custom-select"
          placeholder="Filter Active"
          value={filterActive}
          onChange={(value) => setFilterActive(value)}
          style={{ width: "15%" }}
        >
          <Option value={true}>Active</Option>
          <Option value={false}>InActive</Option>
        </Select>
        <Select
          className="custom-select"
          placeholder="Filter SortBy"
          value={filterSortby}
          onChange={(value) => setFilterSortby(value)}
          style={{ width: "15%" }}
        >
          <Option value="minAmount">minAmount</Option>
          <Option value="createdAt">createdAt</Option>
        </Select>

        <Select
          className="custom-select"
          placeholder="Filter SortOrder"
          value={filterSortOrd}
          onChange={(value) => setFilterSortOrd(value)}
          style={{ width: "15%" }}
        >
          <Option value="desc">desc</Option>
          <Option value="asc">asc</Option>
        </Select>
      </div>
      <Table>
        <thead className="bg-gray-200 rounded-none">
          <tr className="text-[14px] leading-[21px] font-bold text-[#00152a]">
            <th className="p-2 text-left">Id</th>
            <th className="p-2 text-left">Code</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Min Amount</th>
            <th className="p-2 text-left">Discount Rate</th>
            <th className="p-2 text-left">Number Code Apply</th>
            <th className="p-2 text-left">Created At</th>
            <th className="p-2 text-left">Active</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {discountCode.map((discount) => (
            <tr
              key={discount.id}
              className="text-lg border-b font-normal text-[14px] leading-[21px] hover:bg-gray-100"
            >
              <td className="p-4">{discount.id}</td>
              <td className="p-4">{discount.code}</td>
              <td>{discount.description}</td>
              <td>{discount.minAmount}</td>
              <td>{discount.discountRate * 100}%</td>
              <td>{discount.numberCodeApply}</td>
              <td className="italic text-gray-400">{discount.createdAt}</td>
              <td>
                <Switch checked={discount.isActive} disabled />
              </td>
              <td>
                <div className="flex items-center text-gray-500 cursor-pointer gap-x-3">
                  <EyeOutlined
                    onClick={() => handleViewDetails(discount.id)}
                    className="p-2 text-2xl text-green-400 border border-gray"
                  />
                  <EditOutlined
                    onClick={() => handleEditDiscount(discount)}
                    className="p-2 text-2xl text-yellow-400 border border-gray"
                  />
                  <DeleteOutlined
                    onClick={() => handleDeleteDiscount(discount.id)}
                    className="p-2 text-2xl text-red-400 border border-gray"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Edit Discount */}
      <Modal
        title="Edit Discount"
        visible={!!editingDiscountCode}
        onCancel={() => {
          setEditingDiscount(null);
          setPageProduct(1);
          setIsDirty(true);
        }}
        footer={null}
      >
        {editingDiscountCode && (
          <Form
            initialValues={{
              ...editingDiscountCode,
            }}
            form={form}
            onFinish={handleSaveDiscount}
            layout="vertical"
            onValuesChange={(allValues) => {
              const isChanged = Object.keys(allValues).some(
                (key) => allValues[key] !== editingDiscountCode?.[key]
              );
              setIsDirty(!isChanged);
            }}
          >
            <Form.Item label="Description" name="description">
              <Input />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: "Please enter the minimum amount" },
              ]}
              label="Min Amount"
              name="minAmount"
            >
              <InputNumber className="w-full" />
            </Form.Item>
            <Form.Item
              rules={[
                { required: true, message: "Please enter the discount rate" },
              ]}
              label="Discount Rate"
              name="discountRate"
            >
              <InputNumber className="w-full" min={0} max={100} />
            </Form.Item>
            <Form.Item label="Number Code Apply" name="numberCodeApply">
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <ButtonCustom
                text="Cancel"
                type="button"
                className="text-black bg-gray-200 border "
                onClick={() => (setEditingDiscount(null), setIsDirty(true))}
              ></ButtonCustom>

              <ButtonCustom
                text="Save"
                htmlType="submit"
                disabled={isDirty} // Disable if no changes
              >
                Save
              </ButtonCustom>
            </div>
          </Form>
        )}
      </Modal>
      {/* Modal Add Discount */}
      <Modal
        key={showAddModal ? "show" : "hide"}
        title="Add New Discount"
        visible={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
          setPageProduct(1);
        }}
        onOk={() => setShowAddModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          validateTrigger={["onBlur", "onChange"]}
          onFinish={handleAddDiscount}
        >
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item
            label="Min Amount"
            name="minAmount"
            rules={[
              { required: true, message: "Please enter the minimum amount" },
            ]}
          >
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item
            label="Discount Rate"
            name="discountRate"
            rules={[
              { required: true, message: "Please enter the discount rate" },
            ]}
          >
            <InputNumber className="w-full" min={0} max={100} />
          </Form.Item>
          <Form.Item label="Product IDs" name="productIds">
            <Select
              mode="multiple"
              placeholder="Select products"
              optionLabelProp="label"
              className="w-full"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {loading ? (
                    <div style={{ padding: "10px", textAlign: "center" }}>
                      <Spin size="small" />
                    </div>
                  ) : pageProduct < pageProTotal ? (
                    <div
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        cursor: "pointer",
                      }}
                      onClick={handleLoadMore}
                    >
                      <Button
                        className={`mt-2 font-medium text-center`}
                        type="link"
                      >
                        Load More
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2 font-medium text-center text-red-500">
                      Không còn sản phẩm nào
                    </div>
                  )}
                </>
              )}
            >
              {uniqueProducts.map((product, index) => (
                <Option
                  key={`${product.id}-${index}`}
                  value={product.id}
                  label={product.name}
                >
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Number Code Apply" name="numberCodeApply">
            <InputNumber className="w-full" min={1} />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <ButtonCustom
              text="Cancel"
              className="text-black bg-gray-200 border"
              onClick={() => setShowAddModal(false)}
            ></ButtonCustom>
            <ButtonCustom
              text="Save"
              type="primary"
              htmlType="submit"
              onClick={handleAddDiscount}
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
        {discountDetails && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <strong>Description:</strong> {discountDetails.description}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Code:</strong> {discountDetails.code}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Min Amount:</strong> {discountDetails.minAmount}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Discount Rate:</strong>{" "}
              {discountDetails.discountRate * 100}%
            </p>
            <p className="text-sm text-gray-700">
              <strong>Product:</strong>{" "}
              {discountDetails.productDiscountCodes?.map((item, index) => (
                <div key={index}>
                  <span className="mr-4">productID: {item.product.id}</span>
                  <span className="mr-4">Name: {item.product.name}</span>
                </div>
              ))}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Number Code Apply:</strong>{" "}
              {discountDetails.numberCodeApply}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Create At:</strong> {createdAtFormatted}
              {discountDetails.numberCodeApply}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Update At:</strong> {updatedAtFormatted}
              {discountDetails.numberCodeApply}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Active:</strong> {discountDetails.isActive ? "Yes" : "No"}
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

export default DiscountCode;
