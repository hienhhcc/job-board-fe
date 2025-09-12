import { env } from "@/data/env/client";
import { UTApi } from "uploadthing/server";

export const uploadthing = new UTApi({ token: env.UPLOADTHING_TOKEN });
