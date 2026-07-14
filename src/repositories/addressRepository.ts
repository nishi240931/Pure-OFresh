import { db } from '@/lib/db';
import { AddressType } from '@prisma/client';

export class AddressRepository {
  async getUserAddresses(userId: string) {
    return db.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAddressById(id: string, userId: string) {
    return db.address.findFirst({
      where: { id, userId },
    });
  }

  async findDefault(userId: string) {
    return db.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async createAddress(userId: string, data: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    postalCode: string;
    addressType: AddressType;
    isDefault?: boolean;
  }) {
    // If it's the first address, make it default automatically
    const count = await db.address.count({ where: { userId } });
    const isDefault = count === 0 ? true : !!data.isDefault;

    if (isDefault) {
      // Unset all other defaults
      await db.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return db.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        addressType: data.addressType,
        isDefault,
      },
    });
  }

  async updateAddress(id: string, userId: string, data: {
    fullName?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string | null;
    landmark?: string | null;
    city?: string;
    state?: string;
    postalCode?: string;
    addressType?: AddressType;
    isDefault?: boolean;
  }) {
    const existing = await this.getAddressById(id, userId);
    if (!existing) {
      throw new Error('Address not found or unauthorized.');
    }

    const isSettingDefault = data.isDefault;

    if (isSettingDefault) {
      await db.address.updateMany({
        where: { userId, NOT: { id } },
        data: { isDefault: false },
      });
    }

    return db.address.update({
      where: { id },
      data: {
        ...data,
      },
    });
  }

  async deleteAddress(id: string, userId: string) {
    const address = await this.getAddressById(id, userId);
    if (!address) {
      throw new Error('Address not found or unauthorized.');
    }

    const wasDefault = address.isDefault;

    // Delete the address
    await db.address.delete({
      where: { id },
    });

    // If we deleted the default address, promote another one
    if (wasDefault) {
      const nextDefault = await db.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' }, // promote the oldest remaining
      });

      if (nextDefault) {
        await db.address.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }
  }

  async setDefaultAddress(id: string, userId: string) {
    const address = await this.getAddressById(id, userId);
    if (!address) {
      throw new Error('Address not found or unauthorized.');
    }

    await db.$transaction([
      db.address.updateMany({
        where: { userId, NOT: { id } },
        data: { isDefault: false },
      }),
      db.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);
  }
}

export const addressRepository = new AddressRepository();
