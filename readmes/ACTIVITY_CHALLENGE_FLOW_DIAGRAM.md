# Activity-Based Challenge Flow Diagram

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Challenge Creation Form                                     │   │
│  │                                                              │   │
│  │  [Challenge Name: _________________]                        │   │
│  │  [Description: ____________________]                        │   │
│  │  [Type: ▼ daily_limit]                                      │   │
│  │  [Target: _____] [Unit: kg_co2e]                           │   │
│  │                                                              │   │
│  │  ┌───────────────────────────────────────────────┐         │   │
│  │  │  🪄 Generate from Activity                    │         │   │
│  │  └───────────────────────────────────────────────┘         │   │
│  │                  ↓ CLICK                                     │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ACTIVITY SEARCH MODAL                             │
│                                                                      │
│  Search: [car____________] Category: [▼ transport] [🔍 Search]     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚗 Passenger Car, Gasoline (Medium Size)                    │  │
│  │ Gasoline-powered medium-size passenger vehicle              │  │
│  │ 🏷️ Transport  🌎 US  📊 climatiq                          │  │
│  │                                          0.404 kg CO2e/mile  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚙 Passenger Car, Electric                                   │  │
│  │ Battery electric vehicle                                     │  │
│  │ 🏷️ Transport  🌎 US  📊 climatiq                          │  │
│  │                                          0.122 kg CO2e/mile  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           ↓ CLICK                                    │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│              CHALLENGE TEMPLATES (4 OPTIONS)                         │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ 1️⃣ Daily Limit Challenge                              │        │
│  │ Name: "Daily Car Usage Limit"                          │        │
│  │ Target: 4.04 kg CO2e per day                           │        │
│  │ Duration: 7 days                                        │        │
│  │ Reasoning: Allows ~10 miles of driving per day         │        │
│  │           [✅ Use This Challenge]                       │        │
│  └────────────────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ 2️⃣ Weekly Total Challenge                             │        │
│  │ Name: "Weekly Car Challenge"                           │        │
│  │ Target: 20.2 kg CO2e total                             │        │
│  │ Duration: 7 days                                        │        │
│  │ Reasoning: Weekly target allowing ~50 miles total      │        │
│  │           [✅ Use This Challenge]                       │        │
│  └────────────────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ 3️⃣ Monthly Total Challenge                            │        │
│  │ Name: "Month of Car Awareness"                         │        │
│  │ Target: 80.8 kg CO2e total                             │        │
│  │ Duration: 30 days                                       │        │
│  │ Reasoning: Monthly target for sustainable habits       │        │
│  │           [✅ Use This Challenge]                       │        │
│  └────────────────────────────────────────────────────────┘        │
│  ┌────────────────────────────────────────────────────────┐        │
│  │ 4️⃣ Activity Tracker                                   │        │
│  │ Name: "Track Car Usage"                                │        │
│  │ Target: 15 activities                                  │        │
│  │ Duration: 14 days                                       │        │
│  │ Reasoning: Focus on tracking behavior                  │        │
│  │           [✅ Use This Challenge]                       │        │
│  └────────────────────────────────────────────────────────┘        │
│                         ↓ CLICK                                      │
└─────────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  FORM AUTO-FILLS (Back to Admin Panel)               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │ Challenge Creation Form                                     │   │
│  │                                                              │   │
│  │  [Challenge Name: Daily Car Usage Limit]           ✅       │   │
│  │  [Description: Keep your daily car usage...]       ✅       │   │
│  │  [Type: ▼ daily_limit]                             ✅       │   │
│  │  [Target: 4.04] [Unit: kg_co2e]                    ✅       │   │
│  │  [Duration: 7 days]                                 ✅       │   │
│  │  [Badge: Car Saver]                                 ✅       │   │
│  │                                                              │   │
│  │  Admin can customize any field here!                        │   │
│  │                                                              │   │
│  │             [💾 Save Challenge]                             │   │
│  └────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Backend Data Flow

```
┌─────────────┐
│   ADMIN     │
│   CLICKS    │
│  "Search"   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend: admin-activity-generator │
│  function: searchClimatiqActivities()│
└──────┬──────────────────────────────┘
       │
       │ POST /api/admin/climatiq-search
       │ Body: { query: "car", category: "transport" }
       │
       ▼
┌─────────────────────────────────────┐
│  Backend: adminRoutes.js            │
│  Endpoint: /climatiq-search         │
└──────┬──────────────────────────────┘
       │
       │ Has CLIMATIQ_API_KEY?
       │
   ┌───┴───┐
   │       │
  YES     NO
   │       │
   │       └──────────────┐
   │                      │
   ▼                      ▼
┌──────────────┐    ┌──────────────┐
│ Climatiq API │    │  Local DB    │
│ 1000+ items  │    │  emission_   │
│              │    │  factors     │
└──────┬───────┘    └──────┬───────┘
       │                   │
       └─────────┬─────────┘
                 │
                 ▼
     ┌─────────────────────────┐
     │ Return Activities Array │
     │ [{id, name, factor...}] │
     └──────────┬──────────────┘
                │
                ▼
     ┌─────────────────────────┐
     │ Frontend Displays       │
     │ Activity Cards          │
     └─────────────────────────┘
```

---

## 🎯 Challenge Generation Flow

```
┌─────────────┐
│   ADMIN     │
│   CLICKS    │
│  Activity   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend: selectActivity()         │
│  Sends activity emission data       │
└──────┬──────────────────────────────┘
       │
       │ POST /api/admin/generate-challenge
       │ Body: {
       │   activity_name: "Passenger car, gasoline",
       │   co2e_per_unit: 0.404,
       │   unit: "kg per mile",
       │   category: "transport"
       │ }
       │
       ▼
┌─────────────────────────────────────┐
│  Backend: adminRoutes.js            │
│  Endpoint: /generate-challenge      │
└──────┬──────────────────────────────┘
       │
       │ Calculate Targets:
       │ ┌────────────────────────────┐
       │ │ Daily:   factor × 10       │
       │ │ Weekly:  factor × 50       │
       │ │ Monthly: factor × 200      │
       │ │ Tracker: 15 activities     │
       │ └────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Return 4 Challenge Templates        │
│ {                                   │
│   daily_limit: {...},               │
│   weekly_total: {...},              │
│   monthly_total: {...},             │
│   activity_tracker: {...}           │
│ }                                   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Frontend: displayChallengeSuggestions│
│ Shows 4 cards with "Use" buttons   │
└──────┬──────────────────────────────┘
       │
       │ Admin clicks "Use This Challenge"
       │
       ▼
┌─────────────────────────────────────┐
│ Frontend: useChallengeSuggestion()  │
│ Auto-fills challenge creation form  │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema (No Changes Needed!)

```
┌─────────────────────────────┐
│    challenges table         │
├─────────────────────────────┤
│ id (PK)                     │
│ name                        │
│ description                 │
│ challenge_type ◄── Used!    │
│ target_value   ◄── Used!    │
│ target_unit    ◄── Used!    │
│ duration_days  ◄── Used!    │
│ badge_name     ◄── Used!    │
│ is_active                   │
│ created_at                  │
└─────────────────────────────┘
        ▲
        │ No schema changes!
        │ Works with existing structure
        │
```

---

## 🌐 API Endpoints Summary

### 1. Search Activities

```
POST /api/admin/climatiq-search

Request:
{
  "query": "car",
  "category": "transport"  // optional
}

Response:
{
  "status": "success",
  "data": [
    {
      "id": "passenger_vehicle-...",
      "name": "Passenger car, gasoline",
      "category": "transport",
      "co2e_per_unit": 0.404,
      "unit": "kg per mile",
      "region": "US",
      "source": "climatiq"
    }
  ],
  "fallback": false
}
```

### 2. Generate Challenges

```
POST /api/admin/generate-challenge

Request:
{
  "activity_name": "Passenger car, gasoline",
  "co2e_per_unit": 0.404,
  "unit": "kg per mile",
  "category": "transport"
}

Response:
{
  "status": "success",
  "data": {
    "suggestions": {
      "daily_limit": {
        "name": "Daily Car Usage Limit",
        "description": "...",
        "challenge_type": "daily_limit",
        "target_value": 4.04,
        "target_unit": "kg_co2e",
        "duration_days": 7,
        "badge_name": "Car Saver",
        "reasoning": "..."
      },
      // ... 3 more templates
    },
    "activity_info": { /* activity data */ }
  }
}
```

---

## 🎨 UI Component Structure

```
frontend/
├── admin/
│   └── index.html ◄── Loads scripts
│
└── js/
    ├── admin.js ◄── Existing admin logic
    ├── admin-climatiq-helper.js ◄── Target suggestions (existing feature)
    └── admin-activity-generator.js ◄── NEW! Activity search & generation
        │
        ├── initActivityGenerator() ◄── Adds "Generate" button
        ├── showActivitySearchModal() ◄── Opens search UI
        ├── searchClimatiqActivities() ◄── Searches API
        ├── displayActivityResults() ◄── Shows activity cards
        ├── selectActivity() ◄── Generates templates
        ├── displayChallengeSuggestions() ◄── Shows 4 templates
        └── useChallengeSuggestion() ◄── Auto-fills form
```

---

## ⚡ Key Features at a Glance

| Feature | Description | Status |
|---------|-------------|--------|
| **Activity Search** | Search 1000+ activities from Climatiq | ✅ Ready |
| **Local Fallback** | Uses emission_factors table if no API key | ✅ Ready |
| **4 Templates** | Daily, Weekly, Monthly, Tracker | ✅ Ready |
| **Auto-Calculate** | Targets based on emission factors | ✅ Ready |
| **Auto-Fill Form** | One-click to populate challenge | ✅ Ready |
| **Customizable** | Admin can edit any field | ✅ Ready |
| **Category Filter** | Search by Transport/Diet/Energy/Waste | ✅ Ready |
| **Reasoning** | Explains why target makes sense | ✅ Ready |

---

## 🚀 Usage Examples

### Example 1: Transport Challenge

```
Search → "car"
Select → "Passenger car, gasoline" (0.404 kg/mile)
Template → Daily Limit
Result → 4.04 kg/day (allows ~10 miles driving)
```

### Example 2: Diet Challenge

```
Search → "beef"
Select → "Beef (red meat)" (27.0 kg/kg)
Template → Activity Tracker
Result → Track 15 beef meals (awareness building)
```

### Example 3: Energy Challenge

```
Search → "electricity"
Select → "Grid electricity" (0.385 kg/kWh)
Template → Monthly Total
Result → 77 kg/month (allows ~200 kWh usage)
```

---

## 🎯 Target Calculation Reference

| Activity | Factor | Daily (×10) | Weekly (×50) | Monthly (×200) |
|----------|--------|-------------|--------------|----------------|
| Car (gasoline) | 0.404 kg/mile | 4.04 kg | 20.2 kg | 80.8 kg |
| Car (electric) | 0.122 kg/mile | 1.22 kg | 6.1 kg | 24.4 kg |
| Bus | 0.089 kg/mile | 0.89 kg | 4.45 kg | 17.8 kg |
| Beef | 27.0 kg/kg | 270 kg | 1350 kg | 5400 kg |
| Chicken | 6.9 kg/kg | 69 kg | 345 kg | 1380 kg |
| Electricity | 0.385 kg/kWh | 3.85 kg | 19.25 kg | 77 kg |

**Note:** Some factors (like beef) produce unrealistic daily targets. Always review and adjust!

---

## ✅ Implementation Complete!

All components are built and integrated. Feature is ready for testing! 🎉
