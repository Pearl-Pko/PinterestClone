"use server";
import { redirect } from "next/navigation";
import { LoginUserSchema } from "../schema/user";
import { useLogin } from "../service/useUser";
import axios from "axios";
import { cookies } from "next/headers";

export async function login(user: LoginUserSchema) {
  // const email = form.get("email");
  // const password = form.get("password");
  // console.log("email", "password");
  console.log("serverr");
  // const data = (await useLogin(user)).data;

  try {
    const res = (await axios.post(`${process.env.API_URL}/auth/login`, user))
      .data;
  } catch (error) {
    return console.error(error);
  }
  redirect("/pin-creation-tool");
}

export async function clearSession() {
    const cookie = cookies();
    cookie.delete("access_token");
    cookie.delete("refresh_token")
}

export async function getSession() {

}


