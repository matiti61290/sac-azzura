import { Module } from "@nestjs/common";
import { UsersService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserController } from "./user.controller";
import { UserEntity } from "../../entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UsersService],
    controllers: [UserController],
    exports: [UsersService,]
})
export class UserModule {}