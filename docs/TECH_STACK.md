# KisanMitra: Technical Manifest

This document outlines the professional technology stack used to build the National Agricultural Grid.

## 1. Frontend Architecture
*   **Next.js 15 (Turbopack):** Used as the core framework. It provides the App Router for complex navigation and Server Actions for high-performance AI processing.
*   **React 19:** Utilized for building the interactive, component-based interface.
*   **Tailwind CSS:** Provides the utility-first styling system. Used to create the "Farmer-Green" and "Expert-Blue" thematic distinction.
*   **ShadCN UI:** A collection of Radix UI primitives. Used for high-fidelity components like the **Dashboard Sidebar**, **Mandi-Link Tabs**, and **Diagnostic Dialogs**.
*   **Framer Motion:** Used for staggered animations and the "Live Data" count-up effect on the Expert dashboard.
*   **Recharts:** Implemented in the Market Intelligence hub to render area charts for Mandi price volatility analysis.

## 2. Backend & Security
*   **Firebase Authentication:** Handles identity management. It maps every user to a specific professional role (Farmer, Expert, Logistics, Authority).
*   **Firebase App Hosting:** The production environment that supports Next.js server-side features.
*   **Firestore Security Rules:** The "Shield". These rules ensure that only Experts can issue bio-security alerts and only Logistics providers can manage their own fleets.

## 3. Database Layer
*   **Cloud Firestore (NoSQL):** The real-time grid. Used to synchronize:
    *   **Crops Collection:** 100+ professional agricultural profiles.
    *   **Bookings:** Real-time shipment tracking for Mandi-Link.
    *   **Pest Outbreaks:** Geospatial threat vectors for the Surveillance hub.
    *   **Kisan Network:** Community intelligence and expert-verified posts.

## 4. Artificial Intelligence (Genkit + Gemini)
*   **Google Genkit:** The orchestration framework for AI. It wraps Gemini models into functional "Flows" like `diagnoseCropPest` and `marketPriceTrendAnalysis`.
*   **Gemini 2.5 Flash:** The multimodal engine. Used to analyze field photos for diseases and generate strategic "Hold/Sell" market recommendations.
*   **Text-to-Speech (TTS):** Used to provide audio guidance in regional scripts (Hindi, Bengali, etc.), ensuring accessibility for all farmers.

## 5. State Management
*   **Zustand:** Handles client-side persistence. It ensures that when a user selects their role or language, the entire application adapts instantly and remembers those settings across sessions.
