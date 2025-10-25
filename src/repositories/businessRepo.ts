import { BusinessClientProfile, Prisma } from "@prisma/client";
import { prisma } from "../services/db.js";

export async function findBusinessClientById(id: string): Promise<BusinessClientProfile | null> {
    return await prisma.businessClientProfile.findUnique({ where: { id } });
}

export async function findBusinessClientByUserId(userId: string): Promise<BusinessClientProfile | null> {
    return await prisma.businessClientProfile.findUnique({ where: { userId } });
}

export async function listAllBusinessClients(): Promise<BusinessClientProfile[] | null> {
    return await prisma.businessClientProfile.findMany();
}

export async function createBusinessClient(data: Prisma.BusinessClientProfileCreateInput): Promise<BusinessClientProfile | null> {
    return await prisma.businessClientProfile.create({ data });
}

export async function updateBusinessClient(id: string, data: Prisma.BusinessClientProfileUpdateInput): Promise<BusinessClientProfile | null> {
    return await prisma.businessClientProfile.update({ where: { id }, data })
}

export async function deleteBusinessClient(id: string) {
    return await prisma.businessClientProfile.delete({
        where: {id},
    })
}