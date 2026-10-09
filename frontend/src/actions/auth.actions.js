"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginApi, registerApi } from "@/services/auth.api";

export async function loginAction(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Vui lòng nhập đầy đủ email và mật khẩu" };
  }

  let success = false;

  try {
    const data = await loginApi({ email, password });
    const cookieStore = await cookies();

    cookieStore.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    success = true;
  } catch (err) {
    return { error: err.message };
  }

  if (success) {
    redirect("/dashboard");
  }
}

export async function registerAction(prevState, formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const department = formData.get("department");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (!name || !email || !department || !password) {
    return { error: "Vui lòng điền đầy đủ thông tin" };
  }

  if (password !== confirmPassword) {
    return { error: "Mật khẩu nhập lại không khớp" };
  }

  if (password.length < 6) {
    return { error: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  try {
    await registerApi({
      name,
      email,
      department,
      password,
      role: "employee",
    });
  } catch (err) {
    return { error: err.message };
  }

  redirect("/login");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
