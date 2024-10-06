"use server";
import { redirect } from "next/navigation";
import { useLogin } from "../service/useUser";
import axios from "axios";
import { cookies } from "next/headers";
import { LoginUserDto, } from "@schema/user";
import { AccessTokenDTO, } from "@schema/auth";
import { jwtDecode } from "jwt-decode";

export async function login(user: LoginUserDto) {
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

export async function getServerSession() {
  const session = cookies();

  const accessToken = session.get("access_token");
  if (!accessToken) return null;

  return jwtDecode<AccessTokenDTO>(accessToken?.value);
}

export async function refreshToken() {
    const session = cookies();
    const refreshToken = session.get("refresh_token")
    console.log(refreshToken, "refresh");

    await axios.post(`${process.env.API_URL}/auth/refresh`, {
        headers: {
            Authorization: `Bearer ${refreshToken?.value}`
        }
    })
}

export async function getSession() {

}

