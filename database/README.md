# 4Insights Database Schema

**4Insights** is a **privacy-first, lightweight web analytics platform**
designed to help website owners track essential engagement metrics without
collecting personal data.\
This repository contains the **MySQL schema** that powers the 4Insights backend.

---

## Overview

The database schema is structured to store and manage:

- **Website information** (registered tracking sites)
- **Event logs** (pageviews, clicks, etc.)
- **Metadata and route parameters**
- **Session data** (free or paid mode)

All data is anonymous, aggregated, and aligned with privacy-first principles.\
No cookies, user identifiers, or personal information are stored.

---

## Schema Structure

| Table                    | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| **`site_info`**          | Stores registered websites and their unique public tokens.     |
| **`event_type`**         | Defines supported event types (e.g., pageview, click).         |
| **`event_logs`**         | Logs anonymized events linked to site and event type.          |
| **`metadata_templates`** | Stores metadata for URLs, such as hostname and path structure. |
| **`routeParams_info`**   | Placeholder for route parameters, used for URL-level tracking. |
| **`session_type`**       | Defines session categories (`free_mode`, `paid_session`).      |
| **`free_mode_session`**  | Stores short-lived tracking sessions for free users.           |

---

## Key Features

### Automated Expiry

- The `free_mode_session.expires_at` field automatically sets **one hour ahead**
  using:
  ```sql
  DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 HOUR))
  ```
