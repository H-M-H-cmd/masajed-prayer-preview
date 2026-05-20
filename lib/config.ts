const requiredEnvVariables = ['NEXT_PUBLIC_API_URL'] as const;

export function validateConfig() {
  for (const variable of requiredEnvVariables) {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }
}

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
} as const; 