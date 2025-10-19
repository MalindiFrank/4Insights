# 4Insights Dashboard

A SvelteKit-based dashboard for the 4Insights analytics platform. This dashboard provides a clean, modern interface for viewing analytics data collected by the 4Insights tracker and processed by the Collector API.

## Features

- **Real-time Metrics**: Displays total events, pageviews, and top paths
- **Clean Interface**: Minimal, modern design without external styling libraries
- **Responsive Layout**: Works on desktop and mobile devices
- **Auto-refresh**: Manual refresh capability for updated metrics
- **Dark Mode Support**: Automatic dark mode detection and styling

## Architecture

The dashboard is built with:
- **SvelteKit**: Modern web framework for the frontend
- **TypeScript**: Type-safe development
- **Native CSS**: No external styling dependencies
- **Fetch API**: Communicates with the Dashboard Backend (BFF)

## Quick Start

### Prerequisites

- Node.js (for npm)
- 4Insights Collector running on `http://localhost:8000`
- 4Insights Dashboard Backend running on `http://localhost:8010`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Configuration

The dashboard connects to the Dashboard Backend at `http://localhost:8010/dashboard/metrics` by default. To change this:

1. Edit `src/routes/+page.svelte`
2. Update the `BACKEND_URL` constant:

```typescript
const BACKEND_URL = 'http://your-backend-url:port/dashboard/metrics';
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking
- `npm run check:watch` - Run type checking in watch mode

### Project Structure

```
src/
├── routes/
│   ├── +page.svelte        # Main dashboard page
│   ├── +layout.svelte      # App layout wrapper
│   ├── Header.svelte       # App header
│   └── about/              # About page
├── lib/                    # Shared components and utilities
└── app.html               # HTML template
```

## Integration

The dashboard automatically fetches metrics from the Collector API and displays:

- **Total Events**: Count of all tracked events
- **Total Pageviews**: Count of pageview events specifically
- **Top Paths**: Most visited pages with view counts

## Styling

The dashboard uses a minimal, modern design with:
- CSS Grid for responsive layouts
- CSS Custom Properties for theming
- Automatic dark mode detection
- No external styling dependencies

## Deployment

To deploy the dashboard:

1. Build the project: `npm run build`
2. Deploy the `build/` directory to your hosting provider
3. Ensure the Collector API is accessible from your deployment

For SvelteKit-specific deployment options, see the [SvelteKit adapters documentation](https://svelte.dev/docs/kit/adapters).
