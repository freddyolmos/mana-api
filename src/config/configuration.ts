import { envSchema } from './env.validation';

export default () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      'Invalid environment variables:',
      JSON.stringify(parsed.error.issues, null, 2),
    );
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
};
