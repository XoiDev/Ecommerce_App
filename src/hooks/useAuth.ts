// //Đây chỉ là ví dụ đơn giản, muốn kiểm tra user đăng nhập hay chưa phải sử dụng token và gửi request lên server
// //không nên áp dụng cách này trong thực tế
// //ví dụ này anh làm để tụi em biết cách triển khai private route, custom hook và sử dụng localStorage
// // function useAuth() {
// //   // const navigate = useNavigate(); /// lỗi phải dùng usenavigate nằm trong router

// //   const handleLogin = () => {
// //     // Simulate login
// //     localStorage.setItem("isAuthenticated", "true");
// //     // navigate("/dashboard");
// //   };

// //   const handleLogout = () => {
// //     // Simulate login
// //     localStorage.setItem("isAuthenticated", "false");
// //     // navigate("/login");
// //   };

// //   return {
// //     handleLogin,
// //     handleLogout,
// //     isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
// //   };
// // }

// // export default useAuth;

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// interface AuthContext {
//   handleLogin: (username: string, password: string) => Promise<void>;
//   handleLogout: () => void;
//   isAuthenticated: boolean;
//   token: string | null;
// }
// const navigate = useNavigate()
// function useAuth(): AuthContext {
//   const [token, setToken] = useState<string | null>(
//     localStorage.getItem("token")
//   );

//   // useEffect(() => {
//   //   // Theo dõi các thay đổi của `localStorage` (nếu cần đồng bộ với các tab trình duyệt khác)
//   //   const syncToken = () => {
//   //     const updatedToken = localStorage.getItem("token");
//   //     setToken(updatedToken);
//   //   };

//   //   window.addEventListener("storage", syncToken);
//   //   return () => {
//   //     window.removeEventListener("storage", syncToken);
//   //   };
//   // }, []);
//   const handleLogin = async (
//     username: string,
//     password: string
//   ): Promise<void> => {
//     try {
//       const response = await fetch("http://localhost:3000/auth/login/admin", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password, role: "admin" }),
//       });

//       console.log(response);
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || "Login failed"); // Hiển thị thông báo lỗi từ server
//       }

//       const data = await response.json();

//       const accessToken = data.access_token;
//       localStorage.setItem("token", accessToken); // Lưu token

//       setToken(accessToken); // Cập nhật state token
//     } catch (error) {
//       console.error("Error during login:", error);
//       throw error;
//     }
//   };

//   const handleLogout = (): void => {
//     localStorage.removeItem("token");
//     setToken(null);
//   };

//   // const isAuthenticated = !!token;
//   const isAuthenticated = Boolean(localStorage.getItem("token"));

//   return {
//     handleLogin,
//     handleLogout,
//     isAuthenticated,
//     token,
//   };
// }

// export default useAuth;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContext {
  handleLogin: (username: string, password: string) => Promise<void>;
  handleLogout: () => void;
  isAuthenticated: boolean;
  token: string | null;
}

function useAuth(): AuthContext {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const navigate = useNavigate();
  useEffect(() => {
    // Theo dõi các thay đổi của `localStorage` (nếu cần đồng bộ với các tab trình duyệt khác)
    const syncToken = () => {
      const updatedToken = localStorage.getItem("token");
      setToken(updatedToken);
    };

    window.addEventListener("storage", syncToken);
    return () => {
      window.removeEventListener("storage", syncToken);
    };
  }, []);
  const handleLogin = async (
    username: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await fetch("http://localhost:3000/auth/login/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      const accessToken = data.access_token;
      localStorage.setItem("token", accessToken);

      setToken(accessToken); // Cập nhật state token
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return {
    handleLogin,
    handleLogout,
    isAuthenticated,
    token,
  };
}

export default useAuth;
