import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import * as yup from "yup";
import ButtonCustom from "../../components/button/ButtonCustom";
import InputCustom from "../../components/input/InputCustom";
import Label from "../../components/label/Label";
import Field from "../../components/field/Field";
import useAuth from "../../hooks/useAuth";

type FieldType = {
  username: string;
  password: string;
  remember?: boolean;
};
const schema = yup.object({
  username: yup.string().required("Please enter your username address"),
  password: yup
    .string()
    .min(6, "Your password must be at least 6 characters or greater")
    .required("Please enter your password"),
});

const Login: React.FC = () => {
  // const [togglePassword, setTogglePassword] = useState(false);
  const { handleLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      username: "", //
      password: "", //  ( không đặt sẽ báo lỗi khi control thay đổi )
    },
  });

  useEffect(() => {
    console.log(isAuthenticated);
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const onLogin = async (values: FieldType) => {
    try {
      await handleLogin(values.username, values.password);
    } catch (err) {
      toast.error("Login failed: Invalid credentials.", {
        position: "top-right",
        autoClose: 3000,
      });
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-[30%] bg-primary min-h-screen"></div>
        <form onSubmit={handleSubmit(onLogin)} className="mx-auto form">
          <h1 className="mb-10 text-3xl font-bold text-center text-primary">
            LoginPage
          </h1>
          <Field>
            <Label htmlFor="email">Username</Label>
            <InputCustom
              name="username"
              type="username"
              control={control}
              placeholder="Please enter your username"
            ></InputCustom>
          </Field>
          <Field>
            <Label htmlFor="password">Password</Label>
            <InputCustom
              placeholder="please enter your password"
              name="password"
              type="password"
              control={control}
            ></InputCustom>
          </Field>

          <ButtonCustom
            text="Sign up"
            className="hover:bg-primary "
            disabled={isSubmitting}
            // isLoading={isSubmitting}
          ></ButtonCustom>
        </form>
        <div className="w-[30%] bg-primary min-h-screen"></div>
      </div>
    </>
  );
};

export default Login;
