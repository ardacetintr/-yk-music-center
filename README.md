# YK Music Center

Full-stack music school management app built with Next.js 14, Tailwind CSS, PostgreSQL and Prisma.

## Features

- Student registration
- Teacher application form
- Role-based authentication (admin, teacher, student)
- Attendance check-in/check-out logs
- Admin dashboard for students and teachers
- Zod validated REST API routes

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Zod
- JWT auth with HTTP-only cookies

## Setup

1. Install packages:

```bash
npm install
```

2. Copy env:

```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL connection and JWT secret.

4. Generate Prisma client and migrate:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Seed demo data:

```bash
npm run prisma:seed
```

6. Run development server:

```bash
npm run dev
```

## Demo credentials

Web üzerinden giriş yalnızca personel içindir: **`/admin/login`** ( **`/login`** aynı adrese yönlendirir).

- **Savaş Aydoğdu (Main Admin 1)** — telefon: `05064363881` / şifre: `savasay1305`
- **Burcu Aydoğdu (Main Admin 2)** — telefon: `05535932301` / şifre: `burcuay1407`

Seed ile oluşan öğretmen / öğrenci / veli demo kullanıcıları veritabanında kalır; şu an giriş API’si yalnızca **ADMIN** rolünü kabul eder.
