import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateMondialRelai1773753720178 implements MigrationInterface {
    name = 'UpdateMondialRelai1773753720178'

    public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`ALTER TABLE \`Order\` ADD \`lastTrackingUpdate\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`Order\` ADD \`trackingDetails\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`Order\` DROP COLUMN \`trackingDetails\``);
        await queryRunner.query(`ALTER TABLE \`Order\` DROP COLUMN \`lastTrackingUpdate\``);
    }

}
