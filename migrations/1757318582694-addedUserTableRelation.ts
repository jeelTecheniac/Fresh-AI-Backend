import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedUserTableRelation1757318582694 implements MigrationInterface {
    name = 'AddedUserTableRelation1757318582694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "created_by" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_f32b1cb14a9920477bcfd63df2c"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_by"`);
    }

}
