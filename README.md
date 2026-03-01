# PassOP — Password Manager

A client-side password manager built with React and Tailwind CSS. PassOP allows users to store, manage, and access credentials locally in their browser. The project focuses on usability, accessibility, and security-conscious design without relying on any backend or third-party storage.

**Live Demo:** [passop-vault.vercel.app](https://passop-vault.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technical Stack](#technical-stack)
- [Architecture Highlights](#architecture-highlights)
- [Getting Started](#getting-started)
- [Future Improvements](#future-improvements)

---

## Overview

PassOP is a portfolio-grade password manager that runs entirely in the browser. All credentials are stored in `localStorage` — no data is sent to any server. The project demonstrates practical React patterns, form validation, accessibility-conscious UI, and thoughtful UX details that go beyond a basic CRUD implementation.

---

## Features

### Core Features

- Add, edit, and delete credentials (website, username, password)
- Website field accepts both valid URLs (`https://google.com`) and plain names (`Google`)
- Username validation: minimum 3 characters, must start with a letter or number, only letters, numbers, and underscores allowed
- Strong password validation: minimum 8 characters, requires uppercase, lowercase, number, and special character
- Show/Hide password toggle in both Add and Edit modes
- Credentials persist across sessions via `localStorage`

### UX Enhancements

- Toast notifications for all actions: add (green), edit (blue), delete (red)
- Toast auto-dismisses with a visible countdown progress bar
- Responsive toast positioning: top-right on desktop, bottom-center on mobile
- Swipe-to-dismiss toasts on mobile (horizontal swipe on desktop, vertical swipe on mobile)
- Subtle haptic feedback on toast appearance via the Vibration API (Android browsers)
- Smooth entry and exit animations on toasts and credential cards
- Edit mode scales up the active card and dims all others for focused interaction
- New credentials animate in with a fade and slide effect
- Loading spinner and disabled state on buttons during save to prevent duplicate submissions
- Undo option on delete with a 5-second window before permanent removal

### Accessibility and Keyboard Support

- Arrow key navigation between fields (ArrowDown / ArrowUp)
- Enter key moves focus from Website → Username → Password → Submit button
- Mobile keyboard "Next" button support via proper input attributes
- All navigation implemented using `useRef` without interfering with existing form logic

### Security Considerations

- Clipboard auto-clear: after copying a password, the clipboard is cleared after 30 seconds
- Before clearing, the app verifies the clipboard still contains the copied password to avoid overwriting unrelated content
- Strong validation prevents weak or malformed credentials from being saved
- Controlled React state prevents race conditions and double submissions
- No external API calls — all data stays on the user's device

---

## Technical Stack

| Technology | Usage |
|---|---|
| React | UI, state management, component architecture |
| Tailwind CSS | Styling and responsive layout |
| Clipboard API | Copy and auto-clear password from clipboard |
| Vibration API | Haptic feedback on supported mobile devices |
| localStorage | Client-side credential persistence |

---

## Architecture Highlights

- **Centralized toast system** — a single `Toast` component handles all variants (success, edit, delete) with type-based styling, icons, and behavior
- **Reusable validation utilities** — `credentialUtils.js` exports `validateWebsite`, `validateUsername`, `validatePassword`, and `validateCredentials` used consistently across both Add and Edit flows
- **Custom hook** — `useFieldNavigation` provides a reusable keyboard navigation interface using refs, shared across Manager and Vault forms
- **Lifted state** — credentials state lives in `App.jsx` and is passed down as props, avoiding sync issues between pages
- **Modular component structure** — `Manager`, `Vault`, `Toast`, and `Navbar` are cleanly separated with single responsibilities

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/7Aryannn/passop.git

# Navigate to the project directory
cd passop

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser.

> No environment variables or backend setup required.

---

## Future Improvements

- Password strength meter with real-time visual feedback
- Import and export credentials as encrypted JSON
- Master password with AES encryption before storing in localStorage
- Backend integration with user accounts and server-side storage
- Browser extension support