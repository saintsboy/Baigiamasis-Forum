"use client";
import Image from "next/image";
import styles from "./page.module.css";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [questions, setQuestions] = useState<Array<any> | null>(null);
  const fetchQuestions = async () => {
    try {
      const response = await axios.get("http://localhost:3000/questions", {});
      setQuestions(response.data.questions);
    } catch {
      console.log("error");
    }
  };
  useEffect(() => {
    fetchQuestions();
  }, []);
  return <div>{questions && questions[0].question_text}</div>;
}

// import React, { useState } from "react";
// import axios from "axios";
// import cookie from "js-cookie";
// import { useRouter } from "next/router";

// import styles from "./styles.module.css";
// import PageTemplate from "@/components/PageTemplate/PageTemplate";

// const Register = () => {
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const onRegister = async () => {
//     const body = {
//       name: name,
//       email: email,
//       password: password,
//     };

//     try {
//       const response = await axios.post(
//         `${process.env.SERVER_URL}/users/register`,
//         body
//       );

//       if (response.status === 200) {
//         cookie.set("jwt_token", response.data.token);
//         router.push("/");
//       }

//       console.log("response", response);
//     } catch (error) {
//       console.error("Error registering:", error);
//       // Handle registration error, e.g., display an error message
//     }
//   };

//   return (
//     <PageTemplate>
//       <div className={styles.form}>
//         <input
//           placeholder="name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <input
//           placeholder="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           placeholder="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           type="password"
//         />
//         <button onClick={onRegister}>Register</button>
//       </div>
//     </PageTemplate>
//   );
// };

// export default Register;