import { MigrationInterface, QueryRunner } from "typeorm";

export class VerifiedAtAddedinToken1757416113926 implements MigrationInterface {
    name = 'VerifiedAtAddedinToken1757416113926'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" ADD "verified_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP COLUMN "verified_at"`);
    }

}
