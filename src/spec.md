# Specification

## Summary
**Goal:** Refresh the app’s UI typography/theme and reorganize the Farmer form into clear MGO/ST, Farmer, and Crop sections with improved responsive layout—without changing functionality or submission behavior.

**Planned changes:**
- Apply a consistent, more modern typography and spacing theme across LoginPage, Header, FarmerForm, and SettingsDialog (within existing Tailwind + shadcn/ui patterns).
- Reorganize FarmerForm into three distinct, titled sections: MGO/ST info, Farmer info, and Crop info, keeping Login ID visible and read-only.
- Preserve all existing field behaviors (e.g., ST → enables MGO Headquarters, District → Taluka dependency), validations, error messages, and the exact submission payload.
- Improve FarmerForm responsiveness: stacked layout on small screens and more structured multi-column grids on larger screens to reduce vertical scrolling while keeping existing shadcn/ui components.

**User-visible outcome:** The app looks more polished and readable with consistent typography, and the Farmer form is easier to navigate via clearly labeled sections and a more responsive layout—while working exactly the same as before.
