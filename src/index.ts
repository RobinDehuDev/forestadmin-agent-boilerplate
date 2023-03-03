import { createSqlDataSource } from "@forestadmin/datasource-sql";
import { createAgent } from "@forestadmin/agent";
import dotenv from "dotenv";
import { z } from "zod";
import { Schema } from "./forestAdminTyping";
dotenv.config();

const parseEnv = z.object({
  FOREST_AUTH_SECRET: z.string(),
  FOREST_ENV_SECRET: z.string(),

  BDD_NAME: z.string(),
  BDD_USERNAME: z.string(),
  BDD_PASSWORD: z.string(),
  BDD_HOST: z.string(),
  BDD_PORT: z
    .string()
    .regex(/^\d+$/)
    .transform((d) => parseInt(d)),

  NODE_ENV: z.enum(["production", "development"]),
  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform((d) => parseInt(d)),
});

const env = parseEnv.parse(process.env);

createAgent<Schema>({
  authSecret: env.FOREST_AUTH_SECRET,
  envSecret: env.FOREST_ENV_SECRET,
  isProduction: env.NODE_ENV === "production",
  typingsMaxDepth: 4,
  typingsPath: "src/forestAdminTyping.ts",
})
  .addDataSource(
    createSqlDataSource({
      database: env.BDD_NAME,
      username: env.BDD_USERNAME,
      password: env.BDD_PASSWORD,
      host: env.BDD_HOST,
      port: env.BDD_PORT,
      dialect: "postgres",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  )
  .mountOnStandaloneServer(env.PORT || 3000)
  .start();
