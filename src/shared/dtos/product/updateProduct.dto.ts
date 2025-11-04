import { PartialType } from "@nestjs/mapped-types";
import { AddProductDto} from './addProduct.dto'

export class UpdateProductDto extends PartialType(AddProductDto) {}