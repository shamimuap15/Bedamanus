# BedaManush – 3-in-1 Silicone Bath Combo landing page

A Next.js (App Router, server-rendered) landing page with cash-on-delivery ordering and an admin panel where every section, image, video, price and setting can be edited.

- **Landing page** `/` — mobile-first (480px column on every screen), Bangla, brand lime `#C8FF3D` + charcoal `#1F1F1F`.
- **Order form** — server-validated (Bangla or English digits, `+88` accepted), duplicate-click protection, bot honeypot, per-IP rate limit, inside/outside Dhaka delivery charge.
- **Thank-you page** `/thank-you/[orderNo]` — order summary + Meta Pixel `Purchase` (deduplicated with the order number).
- **Admin** `/admin`
  - Dashboard: today / 7-day orders and revenue, orders by status.
  - Orders: search, filter by status, change status inline, edit customer details/quantity/delivery charge, internal notes, CSV export (Excel-friendly, for courier upload).
  - Page sections: reorder, show/hide, duplicate, add, delete, and edit every field (text, images, videos, icons, lists).
  - Products & price: the packages customers can choose, sale price + crossed-out price.
  - Settings: logo, accent colour, announcement bar, phone/WhatsApp/Facebook, delivery charges, sticky bar, thank-you text, SEO + share image, Meta Pixel ID.
- **Uploads** go straight from the browser to Vercel Blob (videos up to 300 MB).

Stack: Next.js 15 · React 19 · Tailwind CSS 4 · Drizzle ORM · PostgreSQL (Neon) · Vercel Blob · jose (signed admin session cookie).

---

## Deploy on Vercel (about 10 minutes)

1. **Import the repo**: Vercel → *Add New → Project* → pick this GitHub repo → *Deploy* can wait; first open *Settings*.
2. **Database**: Project → *Storage* → *Create Database* → **Neon (Postgres)** → connect to the project.
   This adds `DATABASE_URL` automatically.
3. **File storage**: Project → *Storage* → *Create* → **Blob** → connect to the project.
   This adds `BLOB_READ_WRITE_TOKEN` automatically.
4. **Environment variables** (Project → *Settings → Environment Variables*):

   | Name | Value |
   |---|---|
   | `ADMIN_USERNAME` | your admin login name |
   | `ADMIN_PASSWORD` | a strong password |
   | `AUTH_SECRET` | a random 32+ character string (e.g. `openssl rand -base64 32`) |
   | `NEXT_PUBLIC_SITE_URL` | your final URL, e.g. `https://combo.bedamanush.com` |

5. **Deploy**. The build runs `vercel-build`, which creates the tables and fills in the starter content automatically (it never overwrites content you've edited, and never touches orders).
6. **Domain**: Project → *Settings → Domains* → add e.g. `combo.bedamanush.com`, then add the CNAME record Vercel shows at your DNS provider.
7. Open `/admin`, log in, then:
   - **Products & price** → set the real price (the starter price is ৳990 / ৳1490).
   - **Page sections → How to use** → upload the how-to-use videos.
   - **Page sections → Hero** → upload the hero video.
   - **Page sections → Customer reviews** → add review screenshots (the section stays hidden until it has items).
   - **Settings** → paste your Meta Pixel ID and set delivery charges.

Content changes appear on the live page immediately after *Save*.

---

## Local development

```bash
cp .env.example .env          # fill in DATABASE_URL etc.
npm install
npm run db:setup              # create tables + starter content
npm run dev                   # http://localhost:3000  (admin: /admin)
```

Set `NEXT_PUBLIC_UPLOAD_MODE=local` in `.env` to store uploads in `public/uploads` instead of Vercel Blob while developing.

`npx tsx scripts/seed.ts --force` resets sections, products and settings to the starter content (orders are kept).

## Project map

```
src/app/page.tsx                    landing page (renders sections from the DB)
src/app/api/orders/route.ts         order endpoint (validation, pricing from DB)
src/app/thank-you/[orderNo]/        thank-you page + Pixel Purchase
src/app/admin/                      admin panel (login, dashboard, orders, sections, products, settings)
src/app/admin/actions.ts            all admin server actions (each checks the session)
src/app/api/upload/route.ts         Vercel Blob client-upload token endpoint (admin only)
src/lib/sections.ts                 content model: section types + editable fields + settings
src/components/landing/             section renderers, order form, header/footer/sticky bar/Pixel
src/components/admin/               generic field editor, media upload, product form
src/db/schema.ts                    tables: settings, sections, products, orders
scripts/seed.ts                     starter content from the approved design
```

**Adding a new kind of section:** add its fields + defaults to `SECTION_DEFS` in `src/lib/sections.ts` and a renderer in `src/components/landing/Sections.tsx`. The admin editor is generated from the field list automatically.
