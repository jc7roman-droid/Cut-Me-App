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

This project uses Expo SDK 56 so it can open in the current public iPhone version of Expo Go.

On Windows PowerShell, use the `.cmd` commands if script execution is restricted:

```powershell
npm.cmd install
npx.cmd expo start
```

Keep PowerShell open, make sure the iPhone and computer use the same Wi-Fi, and scan the QR code with the iPhone Camera. Tap **Open in Expo Go** when prompted. Press `w` in the running Expo terminal to open the web build instead.

## Verify

```bash
npx tsc --noEmit
npx expo-doctor
```
