# Repair Link

Repair Link is a platform that makes electronic repair easier, more trustworthy, and more sustainable. It connects people who need to repair an electronic device with skilled technicians and spare-part sellers in one place.

The platform treats repair as a practical alternative to replacement: consumers can get help quickly, technicians can receive relevant repair work, and sellers can offer the parts needed to complete a repair. Each completed repair also contributes to a measurable effort to reduce electronic waste.

## The problem

Electronic devices are often discarded when a repair would be cheaper, faster, and better for the environment. Consumers may not know which technician to trust, whether parts are available, or how much a repair should cost. At the same time, capable technicians can struggle to find customers, while spare-part sellers have limited ways to showcase their inventory and reputation.

Repair Link solves these disconnected journeys by providing a single repair marketplace with clear service information, technician profiles, spare-part discovery, repair coordination, and sustainability rewards.

## Who Repair Link is for

### Consumers

People who own a damaged or malfunctioning electronic item, such as a phone, laptop, tablet, appliance, or other device, and want to find a reliable repair option.

### Technicians

Independent technicians and repair shops that want to publish their expertise, receive repair requests, manage jobs, and build a strong service reputation.

### Spare-part sellers

Businesses or individuals who sell genuine, compatible, refurbished, or used electronic spare parts and want a professional storefront and a way to reach technicians and consumers.

### Platform administrators

Team members responsible for moderation, user support, dispute handling, category management, impact-point rules, and the overall health of the marketplace.

## Core features

### Repair requests

Consumers can create a repair request by providing:

- Device type, brand, and model
- The issue they are experiencing
- Photos or videos of visible damage, where applicable
- Their preferred repair method: on-site, pickup/drop-off, or repair-shop visit
- Location and preferred time
- A budget or request for an estimate

The request can then be matched with suitable technicians based on skill, device category, location, availability, ratings, and price range.

### Technician profiles

Technicians have a profile designed around the trust and discoverability model used by freelance marketplaces. A profile may include:

- Profile photo, business name, bio, and service area
- Technical skills and supported device categories
- Years of experience and qualifications
- Services offered and estimated pricing
- Portfolio of completed repairs
- Working hours and availability
- Customer ratings, reviews, completed-job count, and response rate
- Environmental impact and earned impact points

Technicians can use the profile to build credibility and help consumers choose the right person for a repair.

### Spare-part seller storefronts

Sellers can create profiles and list spare parts with details such as:

- Part name, compatible devices, brand, and condition
- Part number or SKU
- Price, quantity, and stock status
- Images and warranty information
- Delivery, collection, or pickup options
- Seller ratings and reviews

Technicians and consumers can discover parts needed for a repair, compare sellers, and coordinate part availability before a job is confirmed.

### Quotes, booking, and repair tracking

Repair jobs follow a clear lifecycle:

1. A consumer submits a repair request.
2. Relevant technicians review the request and send quotes or ask questions.
3. The consumer compares technician profiles, pricing, availability, reviews, and proposed repair approach.
4. The consumer accepts a quote and books the repair.
5. The technician updates the repair status and may identify parts required.
6. The consumer can track progress, communicate with the technician, and confirm completion.
7. Both parties can leave a review after the repair is complete.

Suggested repair statuses are `requested`, `quoted`, `booked`, `in progress`, `waiting for parts`, `completed`, `cancelled`, and `disputed`.

### Messaging and notifications

The platform supports communication between the people involved in a repair. Important events should produce notifications, including:

- A new repair request or quote
- Quote acceptance or rejection
- Booking confirmation and schedule updates
- Requests for more information
- Part availability updates
- Repair-status changes
- Completion confirmation, reviews, and impact-point awards

### Reviews and trust

After a completed job, consumers can review technicians and technicians can review consumers where appropriate. Sellers can also receive ratings for part quality, delivery, and support.

The goal is to make trust visible through verified completed repairs, fair review handling, responsive communication, reliable profile information, and moderation tools.

## Repair impact points

Repair Link includes an impact-points system inspired by habit-building apps such as Forest. It gives consumers and technicians a tangible reward for choosing repair over disposal.

When a repair is completed and confirmed, both the consumer and technician receive impact points. Points may be based on factors such as:

- Device category and estimated waste diverted
- Repair complexity
- Reuse of a working part
- Use of refurbished or recycled components
- Completion of a repair instead of replacement
- Verified recycling of parts that cannot be reused

Impact points can be displayed on profiles, used in achievements or sustainability levels, and contribute to community-wide impact statistics. The system should reward verified activity, prevent duplicate awards, and make the reason for each award transparent.

Examples of future rewards include badges, profile highlights, repair discounts, partner benefits, leaderboards, and community impact milestones.

## Key operations

| Area | Main operations |
| --- | --- |
| Accounts | Sign up, sign in, profile management, role selection, account recovery, verification |
| Consumer | Create requests, compare quotes, book repairs, track jobs, message, pay, review, receive points |
| Technician | Build profile, set availability, browse leads, quote, manage jobs, request parts, update status, receive points |
| Seller | Build storefront, manage inventory, list parts, manage orders, respond to enquiries, receive reviews |
| Repair jobs | Request creation, matching, quoting, booking, progress updates, completion, cancellation, disputes |
| Sustainability | Verify repairs, calculate and award points, show achievements and impact reports |
| Administration | Moderate listings and reviews, manage categories, handle disputes, configure point rules, audit activity |

## Suggested platform entities

The backend will grow around these main data areas:

- Users and roles
- Consumer, technician, and seller profiles
- Device categories, brands, and models
- Repair requests, quotes, bookings, and repair status history
- Spare-part listings, inventory, and orders
- Conversations and notifications
- Reviews, ratings, reports, and disputes
- Impact events, point balances, badges, and sustainability metrics

## Backend setup

This backend uses TypeScript, PostgreSQL/Neon, and Drizzle ORM.

### Prerequisites

- Node.js 18 or newer
- pnpm
- A Neon PostgreSQL database

### Environment variables

Copy the example environment file and set the Neon connection string:

```bash
cp .env.example .env
```

```env
DATABASE_URL=your_neon_postgres_connection_string
```

Do not commit `.env`; it is intentionally ignored by Git.

### Database commands

Generate a SQL migration after editing a Drizzle schema:

```bash
pnpm db:generate
```

Apply pending migrations to the configured database:

```bash
pnpm db:migrate
```

For rapid development schema synchronization:

```bash
pnpm db:push
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

Run TypeScript validation:

```bash
pnpm typecheck
```

## Project structure

```text
backend/
├── drizzle/                 # Generated SQL migrations and Drizzle metadata
├── src/
│   ├── db/
│   │   ├── index.ts         # Neon HTTP client and Drizzle database instance
│   │   └── schema.ts        # PostgreSQL table definitions
│   └── index.ts             # Public database entry point
├── .env.example             # Required environment-variable names
├── drizzle.config.ts        # Drizzle Kit configuration
├── package.json
└── tsconfig.json
```

## Product roadmap

The current backend foundation includes the Neon/Drizzle database connection and an initial example `users` schema. The marketplace capabilities described above are the intended product scope and should be implemented incrementally.

Recommended next milestones:

1. Add authentication, roles, and user profiles.
2. Model devices, repair requests, technician services, and quotes.
3. Add bookings, repair-status history, messaging, and reviews.
4. Add seller storefronts, part listings, and inventory.
5. Implement verified completion and impact-point awarding.
6. Add payment, moderation, reporting, analytics, and administrator tools.

## Sustainability commitment

Repair Link is built to make repair visible, accessible, and rewarding across local communities. By helping more devices remain useful for longer, the platform can reduce unnecessary electronic waste, extend product life cycles, support local repair professionals, and encourage an active, circular electronics economy that protects the environment and reduces landfill burden.
