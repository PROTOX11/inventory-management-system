FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code and build app
COPY . .
RUN rm -rf backend
RUN pnpm build

EXPOSE 3000

# Start the Next.js production server
CMD ["pnpm", "start"]
