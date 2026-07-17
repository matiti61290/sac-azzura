import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AddressEntity } from "../../entities/addresses.entity";
import { AddAddressDto } from "../../shared/dtos/address/addAddress.dto";
import { UpdateAddressDto } from "../../shared/dtos/address/updateAddress.dto";
import { AddressType } from "../../shared/enum/address.enum";

/**
 * Service for managing user addresses (delivery and billing)
 * 
 * This service handles CRUD operations for user addresses including:
 * - Retrieving all addresses or specific addresses by ID
 * - Filtering addresses by type (DELIVERY, BILLING) and user
 * - Adding new addresses
 * - Updating existing addresses with validation
 * - Deleting addresses
 */
@Injectable()
export class AddressService {
  /**
   * TypeORM repository for AddressEntity operations
   */
  constructor(
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>
  ) {}

  /**
   * Retrieves all addresses from the database
   * 
   * Returns an array of all AddressEntity instances.
   * Use with caution for large datasets as it loads all records.
   * 
   * @returns Promise<Array<AddressEntity>> - Array of all address entities
   */
  async getAllAddresses(): Promise<AddressEntity[]> {
    const addresses = await this.addressRepository.find();

    return addresses;
  }

  /**
   * Retrieves a single address by its ID
   * 
   * @param addressId - The unique identifier of the address to retrieve
   * @returns Promise<AddressEntity | null> - The address entity if found, null otherwise
   */
  async getAddressById(addressId: number): Promise<AddressEntity | null> {
    const address = await this.addressRepository.findOne({ where: { id: addressId } });

    return address;
  }

  /**
   * Retrieves all delivery addresses for a specific user
   * 
   * Filters addresses by DELIVERY type and the specified user ID.
   * Returns an array of delivery address entities owned by the user.
   * 
   * @param user - User object containing user.id for filtering
   * @returns Promise<Array<AddressEntity>> - Array of user's delivery addresses
   */
  async getDelivaryAddressesByUser(user: any): Promise<AddressEntity[]> {
    const delivaryAddresses = await this.addressRepository.findBy({
      type: AddressType.DELIVERY,
      user: { id: user.id }
    });

    return delivaryAddresses;
  }

  /**
   * Retrieves a single delivery address by ID for a specific user
   * 
   * Filters by DELIVERY type, address ID, and the specified user.
   * Ensures the address belongs to the authenticated user.
   * 
   * @param delivaryAddressId - The unique identifier of the delivery address
   * @param user - User object containing user.id for filtering
   * @returns Promise<AddressEntity | null> - The delivery address if found, null otherwise
   */
  async getDelivaryAddressesIdByUser(delivaryAddressId: number, user: any): Promise<AddressEntity | null> {
    const delivaryAddress = await this.addressRepository.findOneBy({
      type: AddressType.DELIVERY,
      id: delivaryAddressId,
      user: { id: user.id }
    });

    return delivaryAddress;
  }

  /**
   * Retrieves all billing addresses for a specific user
   * 
   * Filters addresses by BILLING type and the specified user ID.
   * Returns an array of billing address entities owned by the user.
   * 
   * @param user - User object containing user.id for filtering
   * @returns Promise<Array<AddressEntity>> - Array of user's billing addresses
   */
  async getBillingAddressesByUser(user: any): Promise<AddressEntity[]> {
    const billingAddresses = await this.addressRepository.findBy({
      type: AddressType.BILLING,
      user: { id: user.id }
    });

    return billingAddresses;
  }

  /**
   * Retrieves a single billing address by ID for a specific user
   * 
   * Filters by BILLING type, address ID, and the specified user.
   * Ensures the address belongs to the authenticated user.
   * 
   * @param billingAddressId - The unique identifier of the billing address
   * @param user - User object containing user.id for filtering
   * @returns Promise<AddressEntity | null> - The billing address if found, null otherwise
   */
  async getBillingAddressByIdByUser(billingAddressId: number, user: any): Promise<AddressEntity | null> {
    const billingAddress = await this.addressRepository.findOneBy({
      type: AddressType.BILLING,
      id: billingAddressId,
      user: { id: user.id }
    });

    return billingAddress;
  }

  /**
   * Creates a new address in the database
   * 
   * Merges the DTO data with the user object and persists to the database.
   * The new address is automatically assigned to the specified user.
   * 
   * @param addAddressDto - DTO containing address data (type, street, zipcode, city)
   * @param user - User object to associate with the new address
   * @returns Promise<AddressEntity> - The newly created and saved address entity
   */
  async addAddress(addAddressDto: AddAddressDto, user: any): Promise<AddressEntity> {
    const newAddress = this.addressRepository.create({
      ...addAddressDto,
      user: user
    });

    return await this.addressRepository.save(newAddress);
  }

  /**
   * Updates an existing address by ID
   * 
   * Validates that the address belongs to the authenticated user.
   * If not found or access denied, throws InternalServerErrorException.
   * Returns both original and updated data for reference.
   * 
   * @param addressId - The unique identifier of the address to update
   * @param updateAddressDto - Partial DTO containing fields to update
   * @param user - User object for ownership verification
   * @returns Promise<{ address: AddressEntity; updatedAddress: any }> - Object containing original and updated addresses
   */
  async updateAddress(addressId: number, updateAddressDto: UpdateAddressDto, user: any): Promise<{ address: AddressEntity; updatedAddress: any }> {
    const address = await this.addressRepository.findOneBy({
      id: addressId,
      user: { id: user.id }
    });

    if (!address) {
      throw new InternalServerErrorException('Cette adresse ne correspond pas a une adresse de l\'utilisateur');
    }

    const updatedAddress: any = updateAddressDto;

    await this.addressRepository.update(addressId, updatedAddress);

    return { address, updatedAddress };
  }

  /**
   * Deletes an address by ID
   * 
   * Validates that the address exists and belongs to the authenticated user.
   * Throws InternalServerErrorException if address is not found or unauthorized.
   * Returns the result of the removal operation (the removed entity).
   * 
   * @param addressId - The unique identifier of the address to delete
   * @param user - User object for ownership verification
   * @returns Promise<AddressEntity> - The removed address entity
   */
  async deleteAddress(addressId: number, user: any): Promise<AddressEntity> {
    const address = await this.addressRepository.findOneBy({
      id: addressId,
      user: { id: user.id }
    });

    if (!address) {
      throw new InternalServerErrorException('Cette adresse ne correspond pas a une adresse de l\'utilisateur');
    }

    return this.addressRepository.remove(address);
  }
}