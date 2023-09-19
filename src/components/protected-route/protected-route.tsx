import React from "react";
import { auth } from "../../firebase";
import { Navigate } from "react-router-dom";
import Home from "../routes/home";

export default function ProtectedRoute({children}: {children: React.ReactNode}) {
  const user = auth.currentUser

  if(user === null) {
    return <Navigate to="login" />
  }
  return children
} 