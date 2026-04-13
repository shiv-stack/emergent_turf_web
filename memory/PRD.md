# TurfBook - Turf Booking Application PRD

## Problem Statement
Build a turf booking UI application for discovering, viewing, and booking sports turfs.

## Architecture
- **Frontend**: React 19 + Tailwind CSS + Shadcn UI + React Router v7
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Auth**: JWT Bearer tokens (localStorage)
- **Design**: Dark theme ("Performance Pro" archetype), Barlow Condensed headings, DM Sans body

## User Personas
1. **Sports Enthusiast**: Browses turfs, books time slots for matches
2. **Admin**: Manages turf listings and bookings

## Core Requirements
- Browse and search turfs by city, sport, name
- View turf details (photos, amenities, pricing, hours)
- Book time slots with calendar date picker and time grid
- User registration and login (JWT auth)
- Booking history management with cancel option

## What's Been Implemented (April 13, 2026)
- Full-stack app with 6 seeded turfs across 3 cities
- Home page with hero section, search, featured turfs
- Turfs listing with search, sport filter, city filter
- Turf detail page with amenities, pricing, Book Now CTA
- Booking page with Calendar + Time Slot Grid (Control Room layout)
- My Bookings page with cancel functionality
- JWT Bearer token auth (register, login, logout, refresh)
- Admin seeding, brute force protection
- Dark theme with blue (#007AFF) primary accent
- Responsive design with mobile nav

## Prioritized Backlog
### P0 (Must-have, deferred)
- None remaining for MVP

### P1 (Should-have)
- Turf admin panel (add/edit/delete turfs)
- Multi-hour booking (select multiple consecutive slots)
- Payment integration (Stripe/Razorpay)
- Email confirmation on booking

### P2 (Nice-to-have)
- User reviews and ratings
- Turf owner dashboard
- Recurring booking
- Google Maps integration for locations
- Notification system (booking reminders)

## Next Tasks
1. Add payment integration for booking confirmation
2. Admin panel for turf management
3. Email notifications for booking confirmation/cancellation
4. User profile page with edit functionality
