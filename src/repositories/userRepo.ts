import { UserType } from "@prisma/client";
import { prisma } from "../services/db.js";
import bcrypt from 'bcryptjs';

export function findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: { name: string; email: string; password: string; phone: string; address: string; zip: string; userType?: UserType }) {
    const hashed = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
        data: { name: data.name, email: data.email, password: hashed, phone: data.phone, address: data.address, zip: data.zip, userType: data.userType ?? UserType['CLIENT'] }
    });
}

export async function updateUser(id: string, data: Partial<{ name: string; phone: string; address: string; zip: string; type: UserType }>) {
    return prisma.user.update({ where: { id }, data });
}

export async function changePassword(id: string, newPassword: string) {
    const hashed = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({ where: { id }, data: { password: hashed } });
}

export async function listUsers(skip = 0, take = 20) {
    return prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } });
}