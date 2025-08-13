/// <reference types="@clerk/nextjs" />

declare namespace NodeJS {
  interface ProcessEnv {
    CLERK_PUBLISHABLE_KEY?: string
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string
    CLERK_SECRET_KEY: string
    MONGODB_URI: string
    GOOGLE_GENERATIVE_AI_API_KEY: string
    MEM0_API_KEY?: string
    CLOUDINARY_CLOUD_NAME: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string
  }
}

