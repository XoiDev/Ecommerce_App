import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Spin,
  Switch,
} from "antd";
import { debounce } from "lodash";
import React, { useEffect, useState } from "react";
import api from "../../../api";
import ButtonCustom from "../../../components/button/ButtonCustom";
import InputCustom from "../../../components/input/InputCustom";
import Table from "../../../components/table/Table";
import useAuth from "../../../hooks/useAuth";
import useDeleteItem from "../../../hooks/useDeleteItem";
import dayjs from "dayjs";
import useToast from "../../../hooks/useToast";

interface Discount {
  id: number;
  createdAt: string;
  endDate: string;
  startDate: string;
  name: string;
  active: boolean;
  code?: string;
  percentage: number;
}

const Discount: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [discountDetails, setDiscountDetails] = useState<Discount | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [pageProduct, setPageProduct] = useState(1);
  const [pageProTotal, setPageProTotal] = useState(2); // Cập nhật totalPage sau khi nhận được dữ liệu
  const [searchTerm, setSearchTerm] = useState<string | null>(null);
  const [filterActive, setFilterActive] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [endDate, setEndData] = useState<string>("asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [newDiscounts, setNewDiscounts] = useState<{
    name: string;
    desc?: string;
    percentage: number | null;
    startDate: string;
    endDate: string;
    productIds: [] | null;
  }>({
    name: "",
    desc: "",
    percentage: null,
    startDate: "",
    endDate: "",
    productIds: null,
  });
  const { Option } = Select;
  const [form] = Form.useForm();

  const { notifySuccess, notifyError } = useToast();
  // handle debounce
  useEffect(() => {
    const handleDebounce = debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 500);

    handleDebounce(searchTerm);
    return () => handleDebounce.cancel(); // handle cleanup
  }, [searchTerm]);
  // filter
  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        let url = `/discounts?page=${page}&limit=${pageSize}`;
        if (debouncedSearchTerm) {
          url += `&search=${debouncedSearchTerm}`;
        }
        if (filterActive !== undefined && filterActive !== null) {
          url += `&startDate=${filterStartDate}`;
        }
        if (filterActive !== undefined && filterActive !== null) {
          url += `&endDate=${filterEndDate}`;
        }
        if (filterActive !== undefined && filterActive !== null) {
          url += `&active=${filterActive}`;
        }
        const response = await api.get(url);
        setDiscounts(response.data.discounts);
        setTotal(response.data.total);
      } catch {
        setError("Failed to fetch discounts.");
      }
    };
    fetchDiscounts();
  }, [
    token,
    page,
    pageSize,
    debouncedSearchTerm,
    filterActive,
    filterStartDate,
    filterEndDate,
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

  const handleAddDiscount = async () => {
    try {
      const newDiscount = {
        ...newDiscounts,
      };
      console.log("new", newDiscount);
      const response = await api.post("/discounts", newDiscount);
      setDiscounts([...discounts, response.data]);
      setShowAddModal(false);
      form.resetFields();
      notifySuccess("Add New Successfully!");
    } catch (err) {
      console.error("Error adding discount:", err); // Xem lỗi từ API nếu có
      setError("Failed to add discount.");
      notifyError("Failed Add!");
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const response = await api.get(`/discounts/${id}`);
      setDiscountDetails(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError("Failed to fetch discount details.");
      console.log(err);
    }
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
        <h1 className="mb-10 text-3xl font-bold">Discounts</h1>
        <ButtonCustom
          className="p-4"
          text="Add Discount"
          onClick={() => setShowAddModal(true)}
        ></ButtonCustom>
      </div>
      <div className="flex items-center justify-between mb-4">
        <InputCustom
          placeholder="Search discounts"
          className="w-[50%]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          className="custom-select"
          placeholder="Filter by"
          value={filterActive}
          onChange={(value) => setFilterActive(value)}
          style={{ width: "15%" }}
        >
          <Option value="active">Active</Option>
          <Option value="inactive">InActive</Option>
        </Select>

        <Select
          className="custom-select"
          placeholder="Filter by"
          value={endDate}
          onChange={(value) => setEndData(value)}
          style={{ width: "15%" }}
        >
          <Option value="startDate">startDate</Option>
          <Option value="endDate">endDate</Option>
        </Select>
      </div>
      <Table>
        <thead className="bg-gray-200 rounded-none">
          <tr className="text-[14px] leading-[21px] font-bold text-[#00152a]">
            <th className="p-2 text-left">Id</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">PercentAge</th>
            <th className="p-2 text-left">Start Date</th>
            <th className="p-2 text-left">End Date</th>
            <th className="p-2 text-left">Created At</th>
            <th className="p-2 text-left">Active</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {discounts?.map((discount) => (
            <tr
              key={discount.id}
              className="text-lg border-b font-normal text-[14px] leading-[21px] hover:bg-gray-100"
            >
              <td className="p-4">{discount.id}</td>
              <td>{discount.name}</td>
              <td>{discount.percentage}%</td>
              <td className="italic text-gray-400">{discount.startDate}</td>
              <td className="italic text-gray-400">{discount.endDate}</td>

              <td className="italic text-gray-400">{discount.createdAt}</td>
              <td>
                <Switch checked={discount.active} disabled />
              </td>
              <td>
                <div className="flex items-center text-gray-500 cursor-pointer gap-x-3">
                  <EyeOutlined
                    onClick={() => handleViewDetails(discount.id)}
                    className="p-2 text-2xl text-green-400 border border-gray"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

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
        onOk={() => {
          form.submit(); // Gọi submit khi nhấn OK
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          validateTrigger={["onBlur", "onChange"]}
          onFinish={handleAddDiscount}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input
              value={newDiscounts.name}
              onChange={(e) =>
                setNewDiscounts({ ...newDiscounts, name: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input
              value={newDiscounts.desc}
              onChange={(e) =>
                setNewDiscounts({ ...newDiscounts, desc: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            label="PercentAge"
            name="percentage"
            rules={[{ required: true, message: "Please enter the percentage" }]}
          >
            <InputNumber
              className="w-full"
              value={newDiscounts.percentage}
              onChange={(value) =>
                setNewDiscounts({
                  ...newDiscounts,
                  percentage: value,
                })
              }
            />
          </Form.Item>

          <Form.Item
            label="Start Date"
            name="startDate"
            rules={[
              { required: true, message: "Please select the start date" },
            ]}
          >
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current.isBefore(dayjs(), "day")
              }
              value={
                newDiscounts.startDate ? dayjs(newDiscounts.startDate) : null
              }
              onChange={(date) => {
                setNewDiscounts({
                  ...newDiscounts,
                  startDate: date ? date.format("YYYY-MM-DD") : null,
                });
              }}
            />
          </Form.Item>

          <Form.Item
            label="End Date"
            name="endDate"
            rules={[
              { required: true, message: "Please select the end date" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("startDate");
                  if (!value || !startDate || value.isAfter(startDate, "day")) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("End date must be after start date")
                  );
                },
              }),
            ]}
          >
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              disabledDate={(current) =>
                current && current.isBefore(dayjs(), "day")
              }
              value={newDiscounts.endDate ? dayjs(newDiscounts.endDate) : null}
              onChange={(date) => {
                setNewDiscounts({
                  ...newDiscounts,
                  endDate: date ? date.format("YYYY-MM-DD") : null,
                });
              }}
            />
          </Form.Item>

          <Form.Item
            rules={[{ required: true, message: "Please enter the ProductId" }]}
            label="productIds"
            name="productIds"
          >
            <Select
              mode="multiple"
              placeholder="Select products"
              optionLabelProp="label"
              className="w-full"
              onChange={(value) =>
                setNewDiscounts({ ...newDiscounts, productIds: value })
              }
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

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <ButtonCustom
              text="Cancel"
              className="text-black bg-gray-200 border"
              onClick={() => setShowAddModal(false)}
            ></ButtonCustom>
            <ButtonCustom text="Save" type="primary" htmlType="submit">
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
              <strong>Description:</strong> {discountDetails.desc}
            </p>
            <p className="text-sm text-gray-700">
              <strong>percentage:</strong> {discountDetails.percentage}%
            </p>
            <p className="text-sm text-gray-700">
              <strong>startDate:</strong> {discountDetails.startDate}
            </p>
            <p className="text-sm text-gray-700">
              <strong>endDate:</strong> {discountDetails.endDate}
            </p>
            <p className="text-sm text-gray-700">
              <strong>productDiscount:</strong>{" "}
              {discountDetails.productDiscount?.map((item, index) => (
                <div key={index}>
                  <span className="mr-4">productID: {item.product.id}</span>
                  <span className="mr-4">Name: {item.product.name}</span>
                </div>
              ))}
            </p>
            <p className="text-sm text-gray-700">
              <strong>createdAt:</strong> {discountDetails.createdAt}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Active:</strong> {discountDetails.active ? "Yes" : "No"}
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

export default Discount;
