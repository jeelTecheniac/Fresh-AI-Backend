import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTableUserNameField1757336765683 implements MigrationInterface {
    name = 'UpdateUserTableUserNameField1757336765683'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "username" TO "userName"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" TO "UQ_226bb9aa7aa8a69991209d58f59"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME CONSTRAINT "UQ_226bb9aa7aa8a69991209d58f59" TO "UQ_fe0bb3f6520ee0469504521e710"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "userName" TO "username"`);
    }

}
