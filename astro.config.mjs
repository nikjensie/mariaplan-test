import { defineConfig } from 'astro/config';
export default defineConfig({
  site: process.env.SITE_URL || 'https://mariaplan-test.vercel.app',
  trailingSlash: 'ignore',
});
