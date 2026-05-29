import { MigrationInterface, QueryRunner } from "typeorm";

export class Database1780062227872 implements MigrationInterface {
    name = 'Database1780062227872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Promotion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`promotionType\` enum ('percentage', 'fixed_amount') NOT NULL DEFAULT 'percentage', \`percentageValue\` int NULL, \`fixedValue\` int NULL, \`startdate\` datetime NOT NULL, \`enddate\` datetime NOT NULL, \`minAmount\` int NULL, \`categories\` json NULL, \`isActive\` tinyint NOT NULL, UNIQUE INDEX \`IDX_9786eb4269fd8acfdd69620a65\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Color\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, UNIQUE INDEX \`IDX_a29e349d26b88314ec5324a428\` (\`name\`), UNIQUE INDEX \`IDX_faaec86b4a9de0457f620fc8d2\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Material\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, UNIQUE INDEX \`IDX_944a945c72ce0228b54ca7a370\` (\`name\`), UNIQUE INDEX \`IDX_8be0d0a974b6e6641ece924a4e\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, UNIQUE INDEX \`IDX_0ac420e8701e781dbf1231dc23\` (\`name\`), UNIQUE INDEX \`IDX_e9bc13a4c6a2cb71d7f07d0e3c\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Subcategory\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, \`categoryId\` int NULL, UNIQUE INDEX \`IDX_36fe52e276a8b562d967dab768\` (\`name\`), UNIQUE INDEX \`IDX_a00d335bf0a398b3a906f58c02\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Image\` (\`id\` int NOT NULL AUTO_INCREMENT, \`key\` varchar(255) NOT NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(512) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isActive\` tinyint NOT NULL DEFAULT 1, \`sku_code\` varchar(15) NOT NULL, \`subcategoryId\` int NULL, UNIQUE INDEX \`IDX_08cd99ca921561a289373c14b4\` (\`name\`), UNIQUE INDEX \`IDX_280f769af0c63e863b53d1c726\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Stock\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`sku\` varchar(50) NOT NULL, \`productId\` int NULL, \`materialId\` int NULL, \`colorId\` int NULL, UNIQUE INDEX \`IDX_9ee732e1cc687f8a67c5d12fcc\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`OrderItem\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`priceAtPurchase\` decimal(10,2) NOT NULL, \`orderId\` int NULL, \`stockId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Order\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending', \`totalAmount\` decimal(10,2) NOT NULL, \`stripeSessionId\` varchar(255) NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`carrier\` enum ('COLISSIMO', 'MONDIAL_RELAY') NULL, \`trackingNumber\` varchar(255) NULL, \`lastTrackingUpdate\` datetime NULL, \`shippingDetails\` json NULL, \`shippedAt\` datetime NULL, \`userId\` int NULL, \`deliveryAddressId\` int NULL, \`billingAddressId\` int NULL, \`promotionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Address\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('delivery', 'billing') NOT NULL, \`street\` varchar(255) NOT NULL, \`additional\` varchar(255) NOT NULL, \`zipcode\` varchar(20) NOT NULL, \`city\` varchar(255) NOT NULL, \`userId\` int NULL, INDEX \`IDX_08a96a002044d5ca902ce834d9\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`User\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstname\` varchar(255) NOT NULL, \`lastname\` varchar(255) NOT NULL, \`mail\` varchar(255) NOT NULL, \`phoneNumber\` varchar(20) NOT NULL, \`password\` varchar(255) NOT NULL, \`isVerified\` tinyint NOT NULL, \`isAdmin\` tinyint NOT NULL, UNIQUE INDEX \`IDX_dc78ff11c856c4f8b4c8288386\` (\`mail\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`subscriber\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`isVerified\` tinyint NOT NULL DEFAULT 0, \`isActive\` tinyint NOT NULL DEFAULT 1, \`verifyToken\` varchar(255) NULL, \`subscribedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_073600148a22d05dcf81d119a6\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Subcategory\` ADD CONSTRAINT \`FK_ea8bf5437032e203a991a8a316b\` FOREIGN KEY (\`categoryId\`) REFERENCES \`Category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Image\` ADD CONSTRAINT \`FK_c5c304be8b03758812750c64e96\` FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Product\` ADD CONSTRAINT \`FK_762a192f08ad0470dcb2ecf93d5\` FOREIGN KEY (\`subcategoryId\`) REFERENCES \`Subcategory\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Stock\` ADD CONSTRAINT \`FK_17b0ef39058eca67f3bcd9aa49e\` FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Stock\` ADD CONSTRAINT \`FK_cde3988360d99875dffbe7e6d1c\` FOREIGN KEY (\`materialId\`) REFERENCES \`Material\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Stock\` ADD CONSTRAINT \`FK_93179cddb3235fc8cba510d70fa\` FOREIGN KEY (\`colorId\`) REFERENCES \`Color\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`OrderItem\` ADD CONSTRAINT \`FK_c94ace27164b9ffde93ebdbe95c\` FOREIGN KEY (\`orderId\`) REFERENCES \`Order\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`OrderItem\` ADD CONSTRAINT \`FK_e2918aa39ea4841b056765b29b2\` FOREIGN KEY (\`stockId\`) REFERENCES \`Stock\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD CONSTRAINT \`FK_cdc25a0a42e8f451020a26680b3\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD CONSTRAINT \`FK_4bbaea059600bd01e15a48c6172\` FOREIGN KEY (\`deliveryAddressId\`) REFERENCES \`Address\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD CONSTRAINT \`FK_1af5be08ceb7072b71fd503f08c\` FOREIGN KEY (\`billingAddressId\`) REFERENCES \`Address\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD CONSTRAINT \`FK_dc8843682208b9a47d7c0bf046e\` FOREIGN KEY (\`promotionId\`) REFERENCES \`Promotion\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Address\` ADD CONSTRAINT \`FK_08a96a002044d5ca902ce834d97\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Address\` DROP FOREIGN KEY \`FK_08a96a002044d5ca902ce834d97\``);
        await queryRunner.query(`ALTER TABLE \`Order\` DROP FOREIGN KEY \`FK_dc8843682208b9a47d7c0bf046e\``);
        await queryRunner.query(`ALTER TABLE \`Order\` DROP FOREIGN KEY \`FK_1af5be08ceb7072b71fd503f08c\``);
        await queryRunner.query(`ALTER TABLE \`Order\` DROP FOREIGN KEY \`FK_4bbaea059600bd01e15a48c6172\``);
        await queryRunner.query(`ALTER TABLE \`Order\` DROP FOREIGN KEY \`FK_cdc25a0a42e8f451020a26680b3\``);
        await queryRunner.query(`ALTER TABLE \`OrderItem\` DROP FOREIGN KEY \`FK_e2918aa39ea4841b056765b29b2\``);
        await queryRunner.query(`ALTER TABLE \`OrderItem\` DROP FOREIGN KEY \`FK_c94ace27164b9ffde93ebdbe95c\``);
        await queryRunner.query(`ALTER TABLE \`Stock\` DROP FOREIGN KEY \`FK_93179cddb3235fc8cba510d70fa\``);
        await queryRunner.query(`ALTER TABLE \`Stock\` DROP FOREIGN KEY \`FK_cde3988360d99875dffbe7e6d1c\``);
        await queryRunner.query(`ALTER TABLE \`Stock\` DROP FOREIGN KEY \`FK_17b0ef39058eca67f3bcd9aa49e\``);
        await queryRunner.query(`ALTER TABLE \`Product\` DROP FOREIGN KEY \`FK_762a192f08ad0470dcb2ecf93d5\``);
        await queryRunner.query(`ALTER TABLE \`Image\` DROP FOREIGN KEY \`FK_c5c304be8b03758812750c64e96\``);
        await queryRunner.query(`ALTER TABLE \`Subcategory\` DROP FOREIGN KEY \`FK_ea8bf5437032e203a991a8a316b\``);
        await queryRunner.query(`DROP INDEX \`IDX_073600148a22d05dcf81d119a6\` ON \`subscriber\``);
        await queryRunner.query(`DROP TABLE \`subscriber\``);
        await queryRunner.query(`DROP INDEX \`IDX_dc78ff11c856c4f8b4c8288386\` ON \`User\``);
        await queryRunner.query(`DROP TABLE \`User\``);
        await queryRunner.query(`DROP INDEX \`IDX_08a96a002044d5ca902ce834d9\` ON \`Address\``);
        await queryRunner.query(`DROP TABLE \`Address\``);
        await queryRunner.query(`DROP TABLE \`Order\``);
        await queryRunner.query(`DROP TABLE \`OrderItem\``);
        await queryRunner.query(`DROP INDEX \`IDX_9ee732e1cc687f8a67c5d12fcc\` ON \`Stock\``);
        await queryRunner.query(`DROP TABLE \`Stock\``);
        await queryRunner.query(`DROP INDEX \`IDX_280f769af0c63e863b53d1c726\` ON \`Product\``);
        await queryRunner.query(`DROP INDEX \`IDX_08cd99ca921561a289373c14b4\` ON \`Product\``);
        await queryRunner.query(`DROP TABLE \`Product\``);
        await queryRunner.query(`DROP TABLE \`Image\``);
        await queryRunner.query(`DROP INDEX \`IDX_a00d335bf0a398b3a906f58c02\` ON \`Subcategory\``);
        await queryRunner.query(`DROP INDEX \`IDX_36fe52e276a8b562d967dab768\` ON \`Subcategory\``);
        await queryRunner.query(`DROP TABLE \`Subcategory\``);
        await queryRunner.query(`DROP INDEX \`IDX_e9bc13a4c6a2cb71d7f07d0e3c\` ON \`Category\``);
        await queryRunner.query(`DROP INDEX \`IDX_0ac420e8701e781dbf1231dc23\` ON \`Category\``);
        await queryRunner.query(`DROP TABLE \`Category\``);
        await queryRunner.query(`DROP INDEX \`IDX_8be0d0a974b6e6641ece924a4e\` ON \`Material\``);
        await queryRunner.query(`DROP INDEX \`IDX_944a945c72ce0228b54ca7a370\` ON \`Material\``);
        await queryRunner.query(`DROP TABLE \`Material\``);
        await queryRunner.query(`DROP INDEX \`IDX_faaec86b4a9de0457f620fc8d2\` ON \`Color\``);
        await queryRunner.query(`DROP INDEX \`IDX_a29e349d26b88314ec5324a428\` ON \`Color\``);
        await queryRunner.query(`DROP TABLE \`Color\``);
        await queryRunner.query(`DROP INDEX \`IDX_9786eb4269fd8acfdd69620a65\` ON \`Promotion\``);
        await queryRunner.query(`DROP TABLE \`Promotion\``);
    }

}
