import { PartialType } from "@nestjs/mapped-types";
import { AddAddressDto } from "./addAddress.dto";

export class UpdateAddressDto extends PartialType(AddAddressDto) {}