# Cut Me

Cut Me is a universal Expo application for customer booking and barbershop operations.

## First working milestone

This build includes an interactive vertical slice:

1. Choose a service.
2. Choose a specific barber or Any Available.
3. Choose a date and valid time.
4. Review and confirm the booking.
5. Switch to the Barber view to see the appointment on the schedule.

The first milestone deliberately uses local sample data. Supabase authentication and persistence are the next integration, after the interaction model is verified.

## Run locally

```bash
npm install
npm start
```

Scan the QR code with Expo Go, or press `w` for the web build.

## Verify

```bash
npx tsc --noEmit
npx expo-doctor
```
