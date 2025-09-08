import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserLimitTable1757325622722 implements MigrationInterface {
    name = 'CreateUserLimitTable1757325622722'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_limits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "total_user_license" integer NOT NULL DEFAULT '0', "max_persona" integer NOT NULL DEFAULT '0', "max_image_upload" integer NOT NULL DEFAULT '0', "monthly_query_limit" integer NOT NULL DEFAULT '0', "max_document_upload" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_75a80f26e54df4194d15bea666" UNIQUE ("user_id"), CONSTRAINT "PK_6ccf7f1003a588cc764f969bd3f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_limits" ADD CONSTRAINT "FK_75a80f26e54df4194d15bea6668" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_limits" DROP CONSTRAINT "FK_75a80f26e54df4194d15bea6668"`);
        await queryRunner.query(`DROP TABLE "user_limits"`);
    }

}
