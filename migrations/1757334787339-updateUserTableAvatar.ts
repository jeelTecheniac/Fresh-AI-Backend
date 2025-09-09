import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTableAvatar1757334787339 implements MigrationInterface {
    name = 'UpdateUserTableAvatar1757334787339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
    }

}
