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
