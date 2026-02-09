import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { OrderStatus } from "src/shared/enum/order.enum";

export class UpdateOrderStatusDto{
    @IsEnum(OrderStatus)
    status: OrderStatus

    @IsOptional()
    @IsString()
    trackingNumber: string
}