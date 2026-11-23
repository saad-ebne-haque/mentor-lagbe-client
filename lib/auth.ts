import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { jwt } from "better-auth/plugins"
import { MongoClient } from "mongodb"
import { z } from "zod/mini"
import { clientOrigin } from "./urls"

const mongodbUri = process.env.MONGODB_SECRET_URI

if (!mongodbUri) {
  throw new Error(
    "MONGODB_SECRET_URI is required to initialize authentication."
  )
}

const globalForMongo = globalThis as typeof globalThis & {
  mentorLagbeMongoClient?: MongoClient
}

const client =
  globalForMongo.mentorLagbeMongoClient ?? new MongoClient(mongodbUri)
globalForMongo.mentorLagbeMongoClient = client
export const db = client.db("mentor-lagbe")
const signupRoleValidator =
  process.env.NODE_ENV === "development"
    ? z.enum(["student", "tutor", "admin"])
    : z.enum(["student", "tutor"])

export const auth = betterAuth({
  baseURL: clientOrigin,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "user",
    additionalFields: {
      role: {
        type: ["student", "tutor", "admin"],
        required: false,
        defaultValue: "student",
        input: true,
        validator: {
          input: signupRoleValidator,
        },
      },
      plan: {
        type: ["free", "pro"],
        required: false,
        defaultValue: "free",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
        input: false,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/sign-in/email") {
        return
      }

      const email = context.body?.email
      if (typeof email !== "string") {
        return
      }

      const user = await db
        .collection("user")
        .findOne({ email }, { projection: { isActive: 1 } })

      if (user?.isActive === false) {
        throw new APIError("FORBIDDEN", {
          message: "This account has been deactivated.",
        })
      }
    }),
  },
  database: mongodbAdapter(db, {
    client,
  }),
  plugins: [
    jwt({
      jwt: {
        issuer: clientOrigin,
        audience: clientOrigin,
      },
    }),
  ],
})
