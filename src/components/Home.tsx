import React, { useEffect } from "react";
import { redirect } from "react-router-dom";

export const Home = () => {
  useEffect(() => {
    redirect("/1");
  }, []);
  return <></>;
};
