// src/types/address.ts

export enum AddressType {
  DELIVERY = 'delivery',
  BILLING = 'billing',
}

export interface AddressFormData {
  street: string;
  additional?: string;
  zipcode: string;
  city: string;
  type: AddressType;
}