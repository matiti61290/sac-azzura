import { MigrationInterface, QueryRunner } from "typeorm";

export class Database1765368014853 implements MigrationInterface {
    name = 'Database1765368014853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`Address\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` enum ('delivery', 'billing') NOT NULL, \`street\` varchar(255) NOT NULL, \`additional\` varchar(255) NOT NULL, \`zipcode\` varchar(20) NOT NULL, \`city\` varchar(255) NOT NULL, \`userId\` int NULL, INDEX \`IDX_08a96a002044d5ca902ce834d9\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, UNIQUE INDEX \`IDX_0ac420e8701e781dbf1231dc23\` (\`name\`), UNIQUE INDEX \`IDX_e9bc13a4c6a2cb71d7f07d0e3c\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Subcategory\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, \`categoryId\` int NULL, UNIQUE INDEX \`IDX_36fe52e276a8b562d967dab768\` (\`name\`), UNIQUE INDEX \`IDX_a00d335bf0a398b3a906f58c02\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Color\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, UNIQUE INDEX \`IDX_a29e349d26b88314ec5324a428\` (\`name\`), UNIQUE INDEX \`IDX_faaec86b4a9de0457f620fc8d2\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Material\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`sku_code\` varchar(5) NOT NULL, UNIQUE INDEX \`IDX_944a945c72ce0228b54ca7a370\` (\`name\`), UNIQUE INDEX \`IDX_8be0d0a974b6e6641ece924a4e\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Stock\` (\`id\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`createdAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`sku\` varchar(50) NOT NULL, \`productId\` int NULL, \`materialId\` int NULL, \`colorId\` int NULL, UNIQUE INDEX \`IDX_9ee732e1cc687f8a67c5d12fcc\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`image_entity\` (\`id\` int NOT NULL AUTO_INCREMENT, \`key\` varchar(255) NOT NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Product\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(512) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, \`isActive\` tinyint NOT NULL DEFAULT 1, \`sku_code\` varchar(5) NOT NULL, \`subcategoryId\` int NULL, UNIQUE INDEX \`IDX_08cd99ca921561a289373c14b4\` (\`name\`), UNIQUE INDEX \`IDX_280f769af0c63e863b53d1c726\` (\`sku_code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Promotion\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL, \`promotion_type\` varchar(255) NOT NULL, \`valeur\` int NOT NULL, \`startdate\` datetime NOT NULL, \`enddate\` datetime NOT NULL, \`condition\` text NULL, \`isActive\` tinyint NOT NULL, UNIQUE INDEX \`IDX_797949ef9e79c48e5bc4563ffe\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`Order\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('pending', 'paid', 'shipped', 'cancelled') NOT NULL DEFAULT 'pending', \`quantity\` int NOT NULL DEFAULT '1', \`priceAtPurchase\` decimal(20,2) NOT NULL, \`total\` decimal(10,2) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`userId\` int NULL, \`productId\` int NULL, \`promotionId\` int NULL, INDEX \`IDX_8a2a38faa1708165e53e23c2fa\` (\`status\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`User\` (\`id\` int NOT NULL AUTO_INCREMENT, \`firstname\` varchar(255) NOT NULL, \`lastname\` varchar(255) NOT NULL, \`mail\` varchar(255) NOT NULL, \`phoneNumber\` varchar(20) NOT NULL, \`password\` varchar(255) NOT NULL, \`isVerified\` tinyint NOT NULL, \`isAdmin\` tinyint NOT NULL, UNIQUE INDEX \`IDX_dc78ff11c856c4f8b4c8288386\` (\`mail\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`Address\` ADD CONSTRAINT \`FK_08a96a002044d5ca902ce834d97\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Subcategory\` ADD CONSTRAINT \`FK_ea8bf5437032e203a991a8a316b\` FOREIGN KEY (\`categoryId\`) REFERENCES \`Category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Stock\` ADD CONSTRAINT \`FK_17b0ef39058eca67f3bcd9aa49e\` FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Stock\` ADD CONSTRAINT \`FK_cde3988360d99875dffbe7e6d1c\` FOREIGN KEY (\`materialId\`) REFERENCES \`Material\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Stock\` ADD CONSTRAINT \`FK_93179cddb3235fc8cba510d70fa\` FOREIGN KEY (\`colorId\`) REFERENCES \`Color\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`image_entity\` ADD CONSTRAINT \`FK_b639bbe2d5f1d4090e81ebc1505\` FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Product\` ADD CONSTRAINT \`FK_762a192f08ad0470dcb2ecf93d5\` FOREIGN KEY (\`subcategoryId\`) REFERENCES \`Subcategory\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD CONSTRAINT \`FK_cdc25a0a42e8f451020a26680b3\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD CONSTRAINT \`FK_ccf3e5dad88bd746580f824cba9\` FOREIGN KEY (\`productId\`) REFERENCES \`Product\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD CONSTRAINT \`FK_dc8843682208b9a47d7c0bf046e\` FOREIGN KEY (\`promotionId\`) REFERENCES \`Promotion\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Order\` DROP FOREIGN KEY \`FK_dc8843682208b9a47d7c0bf046e\``);
        await queryRunner.query(`ALTER TABLE \`Order\` DROP FOREIGN KEY \`FK_ccf3e5dad88bd746580f824cba9\``);
        await queryRunner.query(`ALTER TABLE \`Order\` DROP FOREIGN KEY \`FK_cdc25a0a42e8f451020a26680b3\``);
        await queryRunner.query(`ALTER TABLE \`Product\` DROP FOREIGN KEY \`FK_762a192f08ad0470dcb2ecf93d5\``);
        await queryRunner.query(`ALTER TABLE \`image_entity\` DROP FOREIGN KEY \`FK_b639bbe2d5f1d4090e81ebc1505\``);
        await queryRunner.query(`ALTER TABLE \`Stock\` DROP FOREIGN KEY \`FK_93179cddb3235fc8cba510d70fa\``);
        await queryRunner.query(`ALTER TABLE \`Stock\` DROP FOREIGN KEY \`FK_cde3988360d99875dffbe7e6d1c\``);
        await queryRunner.query(`ALTER TABLE \`Stock\` DROP FOREIGN KEY \`FK_17b0ef39058eca67f3bcd9aa49e\``);
        await queryRunner.query(`ALTER TABLE \`Subcategory\` DROP FOREIGN KEY \`FK_ea8bf5437032e203a991a8a316b\``);
        await queryRunner.query(`ALTER TABLE \`Address\` DROP FOREIGN KEY \`FK_08a96a002044d5ca902ce834d97\``);
        await queryRunner.query(`DROP INDEX \`IDX_dc78ff11c856c4f8b4c8288386\` ON \`User\``);
        await queryRunner.query(`DROP TABLE \`User\``);
        await queryRunner.query(`DROP INDEX \`IDX_8a2a38faa1708165e53e23c2fa\` ON \`Order\``);
        await queryRunner.query(`DROP TABLE \`Order\``);
        await queryRunner.query(`DROP INDEX \`IDX_797949ef9e79c48e5bc4563ffe\` ON \`Promotion\``);
        await queryRunner.query(`DROP TABLE \`Promotion\``);
        await queryRunner.query(`DROP INDEX \`IDX_280f769af0c63e863b53d1c726\` ON \`Product\``);
        await queryRunner.query(`DROP INDEX \`IDX_08cd99ca921561a289373c14b4\` ON \`Product\``);
        await queryRunner.query(`DROP TABLE \`Product\``);
        await queryRunner.query(`DROP TABLE \`image_entity\``);
        await queryRunner.query(`DROP INDEX \`IDX_9ee732e1cc687f8a67c5d12fcc\` ON \`Stock\``);
        await queryRunner.query(`DROP TABLE \`Stock\``);
        await queryRunner.query(`DROP INDEX \`IDX_8be0d0a974b6e6641ece924a4e\` ON \`Material\``);
        await queryRunner.query(`DROP INDEX \`IDX_944a945c72ce0228b54ca7a370\` ON \`Material\``);
        await queryRunner.query(`DROP TABLE \`Material\``);
        await queryRunner.query(`DROP INDEX \`IDX_faaec86b4a9de0457f620fc8d2\` ON \`Color\``);
        await queryRunner.query(`DROP INDEX \`IDX_a29e349d26b88314ec5324a428\` ON \`Color\``);
        await queryRunner.query(`DROP TABLE \`Color\``);
        await queryRunner.query(`DROP INDEX \`IDX_a00d335bf0a398b3a906f58c02\` ON \`Subcategory\``);
        await queryRunner.query(`DROP INDEX \`IDX_36fe52e276a8b562d967dab768\` ON \`Subcategory\``);
        await queryRunner.query(`DROP TABLE \`Subcategory\``);
        await queryRunner.query(`DROP INDEX \`IDX_e9bc13a4c6a2cb71d7f07d0e3c\` ON \`Category\``);
        await queryRunner.query(`DROP INDEX \`IDX_0ac420e8701e781dbf1231dc23\` ON \`Category\``);
        await queryRunner.query(`DROP TABLE \`Category\``);
        await queryRunner.query(`DROP INDEX \`IDX_08a96a002044d5ca902ce834d9\` ON \`Address\``);
        await queryRunner.query(`DROP TABLE \`Address\``);
    }

}
