import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "../../enum/order.enum";

export class UpdateOrderStatusDto{
    @IsEnum(OrderStatus)
    status!: OrderStatus

    @IsOptional()
    @IsString()
    trackingNumber!: string
}