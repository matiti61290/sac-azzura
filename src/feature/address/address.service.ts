import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddressEntity } from "src/entities/addresses.entity";
import { AddAddressDto } from "src/shared/dtos/address/addAddress.dto";
import { UpdateAddressDto } from "src/shared/dtos/address/updateAddress.dto";
import { AddressType } from "src/shared/enum/address.enum";
import { Repository } from "typeorm";

@Injectable()
export class AddressService {
    constructor(
        @InjectRepository(AddressEntity)
        private readonly addressRepository: Repository<AddressEntity>
    ) {}

    async getAllAddresses(){
       const addresses = await this.addressRepository.find()

       return addresses
    }

    async getAddressById(addressId: number){
        const address = await this.addressRepository.findOne({ where: {id: addressId}})

        return address
    }

    async getDelivaryAddressesByUser(user: any){
        const delivaryAddresses = await this.addressRepository.findBy({
            type: AddressType.DELIVERY,
            user: {id: user.id}
        })

        return delivaryAddresses 
    }

    async getDelivaryAddressesIdByUser(delivaryAddressId: number, user: any){
        const delivaryAddress = await this.addressRepository.findOneBy({
            type: AddressType.DELIVERY,
            id:delivaryAddressId,
            user: {id: user.id}
        })

        return delivaryAddress
    }

    async getBillingAddressesByUser(user:any) {
        const billingAddresses = await this.addressRepository.findBy({
            type: AddressType.BILLING,
            user: {id: user.id}
        })

        return billingAddresses
    }

        async getBillingAddressByIdByUser(billingAddressId: number, user:any) {
        const billingAddress = await this.addressRepository.findOneBy({
            type: AddressType.BILLING,
            id:billingAddressId,
            user: {id: user.id}
        })

        return billingAddress
    }

    async addAddress(addAddressDto: AddAddressDto, user: any){
        const newAddress = this.addressRepository.create({
            ...addAddressDto,
            user: user
        })

        await this.addressRepository.save(newAddress)
    }

    async updateAddress(addressId: number, updateAddressDto: UpdateAddressDto, user: any) {

        const address = await this.addressRepository.findOneBy({
            id: addressId,
            user: {id: user.id}
        })

        if(!address){
            throw new InternalServerErrorException('Cette adresse ne correspond pas a une adresse de l\'utilisateur')
        }

        const updatedAddress: any = updateAddressDto

        await this.addressRepository.update(addressId, updatedAddress)

        return { address, updatedAddress}
    }

    async deleteAddress(addressId: number, user: any){
        const address = await  this.addressRepository.findOneBy({
            id: addressId,
            user: {id: user.id}
        })

        if(!address) {
            throw new InternalServerErrorException('Cette adresse ne correspond pas a une adresse de l\'utilisateur')
        }

        return this.addressRepository.remove(address)
    }
}