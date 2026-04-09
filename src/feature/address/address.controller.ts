import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { AddressService } from "./address.service";
import { AddAddressDto } from "../../shared/dtos/address/addAddress.dto";
import { UpdateAddressDto } from "../../shared/dtos/address/updateAddress.dto";

@Controller('addresses')
export class AddressController {
    constructor(
        private readonly addressService: AddressService
    ) {}

    @Get('')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAllAddress(){
        return this.addressService.getAllAddresses()
    }

    @Get('/:addressId')
    @UseGuards(JwtAuthGuard, AdminGuard)
    async getAddressById(
        @Param('addressId', ParseIntPipe) addressId: number
    ) {
        return this.addressService.getAddressById(addressId)
    }

    @Get('/user/delivery_addresses')
    @UseGuards(JwtAuthGuard)
    async getDeliveryAddressByUser(
        @Req() req
    ){
        const user = req.user
        return this.addressService.getDelivaryAddressesByUser(user)
    }

    @Get('/user/delivery_address/:delivaryAddressId')
    @UseGuards(JwtAuthGuard)
    async getDeliveryAddressByIdByUser(
        @Req() req: any,
        @Param('delivaryAddressId', ParseIntPipe) delivaryAddressId: number
    ) {
        const user = req.user
        return this.addressService.getDelivaryAddressesIdByUser(delivaryAddressId, user)
    }

    @Get('/user/billing_addresses')
    @UseGuards(JwtAuthGuard)
    async getBillingAddressesByUser(
        @Req() req: any
    ) {
        const user = req.user
        return this.addressService.getBillingAddressesByUser(user)
    }

    @Get('/user/billing_address/:billingAddressId')
    @UseGuards(JwtAuthGuard)
    async getBillingAddressByIdByUser(
        @Param('billingAddressId', ParseIntPipe) billingAddressId: number,
        @Req() req: any
    ){
        const user = req.user
        return this.addressService.getBillingAddressByIdByUser(billingAddressId, user)
    }

    @Post('/user/add-address')
    @UseGuards(JwtAuthGuard)
    async addAddress (
        @Body() addAddressDto: AddAddressDto,
        @Req() req
    ){
        const user = req.user
        return this.addressService.addAddress(addAddressDto, user)
    }

    @Patch('/user/update-address/:addressId')
    @UseGuards(JwtAuthGuard)
    async updateAddress(
        @Param('addressId', ParseIntPipe) addressId,
        @Body() updateAddressDto: UpdateAddressDto,
        @Req() req
    ) {
        const user = req.user
        return this.addressService.updateAddress(addressId, updateAddressDto, user)
    }

    @Post('/user/delete-address/:addressId')
    @UseGuards(JwtAuthGuard)
    async deleteAddress(
        @Param('addressId', ParseIntPipe) addressId,
        @Req() req
    ) {
        const user = req.user
        return this.addressService.deleteAddress(addressId, user)
    }
}