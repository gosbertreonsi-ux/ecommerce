import bcrypt from "bcrypt";

import prisma from "../../config/prisma";

import {
  RegisterInput,
  LoginInput,
} from "./auth.validation";

import { generateToken } from "../../utils/jwt";


// ==============================
// REGISTER
// ==============================

export const register = async (
  data: RegisterInput
) => {

  // Check if email already exists
  const existingUser =
    await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

  if (existingUser) {
    throw new Error(
      "Email already exists"
    );
  }


  // Find CUSTOMER role
  const customerRole =
    await prisma.role.findUnique({
      where: {
        name: "CUSTOMER",
      },
    });

  if (!customerRole) {
    throw new Error(
      "Customer role not found"
    );
  }


  // Hash password
  const hashedPassword =
    await bcrypt.hash(
      data.password,
      10
    );


  // Create user
  const user =
    await prisma.user.create({
      data: {
        firstName:
          data.firstName,

        lastName:
          data.lastName,

        email:
          data.email,

        password:
          hashedPassword,

        roleId:
          customerRole.id,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });


  return user;
};


// ==============================
// LOGIN
// ==============================

export const login = async (
  data: LoginInput
) => {

  // Find user
  const user =
    await prisma.user.findUnique({
      where: {
        email: data.email,
      },

      include: {
        role: true,
      },
    });


  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }


  // Compare password
  const passwordMatch =
    await bcrypt.compare(
      data.password,
      user.password
    );


  if (!passwordMatch) {
    throw new Error(
      "Invalid email or password"
    );
  }


  // Generate JWT
  const token =
    generateToken({
      id: user.id,
      role: user.role.name,
    });


  return {
    user: {
      id: user.id,
      firstName:
        user.firstName,
      lastName:
        user.lastName,
      email:
        user.email,
      role:
        user.role.name,
    },

    token,
  };
};


// ==============================
// GET CURRENT USER
// ==============================

export const getCurrentUser = async (
  userId: number
) => {

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,

        role: {
          select: {
            name: true,
          },
        },

        createdAt: true,
      },
    });


  return user;
};