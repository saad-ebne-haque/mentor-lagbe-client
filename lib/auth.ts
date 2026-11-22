import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { z } from "zod/mini";

const mongodbUri = process.env.MONGODB_SECRET_URI;

if (!mongodbUri) {
    throw new Error("MONGODB_SECRET_URI is required to initialize authentication.");
}

const client = new MongoClient(mongodbUri);
const db = client.db("mentor-lagbe");
const signupRoleValidator =
    process.env.NODE_ENV === "development"
        ? z.enum(["student", "tutor", "admin"])
        : z.enum(["student", "tutor"]);

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    user: {
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
        },
    },
    database: mongodbAdapter(db, {
        client,
    }),
});