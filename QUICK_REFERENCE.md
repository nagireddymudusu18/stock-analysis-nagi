# Quick Reference - New Features

## For Users

### 🔍 Global Search
**Keyboard Shortcut**: `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac)
- Opens instant search modal
- Search across all NSE & BSE stocks
- Press `Esc` to close
- Click any result to navigate to stock analysis

### 📱 Pull to Refresh (Mobile)
- Pull down on the home page to refresh data
- Visual feedback with animated indicator
- Works on touch devices

### 📴 Offline Mode
- App works even without internet connection
- Previous data is cached automatically
- Service worker handles offline scenarios

### 📲 Install as App
**Desktop (Chrome/Edge)**:
1. Click the install icon in address bar
2. Or Menu → Install Stock Analysis

**Mobile**:
1. Menu → Add to Home Screen
2. App opens in standalone mode

---

## For Developers

### 🚀 Quick Start
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build

# Full validation (lint + build)
npm run validate
```

### 📦 New Components

#### ErrorBoundary
```jsx
import ErrorBoundary from './components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### GlobalSearch
```jsx
import GlobalSearch from './components/GlobalSearch';

// Already integrated in App.jsx
<GlobalSearch />
```

#### PullToRefresh
```jsx
import PullToRefresh from './components/PullToRefresh';

<PullToRefresh onRefresh={handleRefresh}>
  <YourContent />
</PullToRefresh>
```

### 🎨 Toast Notifications
```jsx
import toast from 'react-hot-toast';

// Success
toast.success('Stock added to watchlist!', { icon: '✅' });

// Error
toast.error('Failed to load data', { icon: '❌' });

// Custom
toast('Processing...', { icon: '⏳' });
```

### 🔧 Code Splitting
```jsx
// Lazy load components
const MyComponent = lazy(() => import('./components/MyComponent'));

// Use with Suspense
<Suspense fallback={<LoadingComponent />}>
  <MyComponent />
</Suspense>
```

### 🎯 Performance Tips

1. **Lazy Load Routes**: Already implemented for all pages
2. **Bundle Analysis**: Check build output for chunk sizes
3. **PWA Caching**: Configured for API responses (7-day max age)
4. **Code Splitting**: Manual chunks in vite.config.js

### 📊 Bundle Sizes
- React vendor: **162 KB** (52.91 KB gzipped)
- Charts: **383 KB** (105.4 KB gzipped)
- Utils: **36 KB** (14.69 KB gzipped)
- Individual pages: **4-25 KB** each

### 🛠️ Configuration Files

#### vite.config.js
```javascript
// PWA Configuration
VitePWA({
  registerType: 'autoUpdate',
  manifest: { /* ... */ },
  workbox: { /* ... */ }
})

// Manual Chunk Splitting
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'charts': ['recharts'],
        'utils': ['axios', 'date-fns']
      }
    }
  }
}
```

#### ESLint (.eslintrc.cjs)
```javascript
// React-specific rules
plugins: ['react', 'react-hooks', 'react-refresh']
rules: {
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  // ... more rules
}
```

### 🐛 Debugging

**Error Boundary Errors**:
- Check browser console for detailed stack trace
- Development mode shows full error details
- Production shows user-friendly message

**PWA Issues**:
- Check `Application > Service Workers` in DevTools
- Clear cache: `Application > Clear storage`
- Unregister SW and reload

**Build Errors**:
- Run `npm run validate` to check lint + build
- Check `dist/` folder for output
- Review Vite build logs

### 🧪 Testing New Features

```javascript
// Test Error Boundary
const BuggyComponent = () => {
  throw new Error('Test error');
  return <div>Never renders</div>;
};

// Test in development to see error details
```

### 📱 PWA Testing

**Development**:
```bash
npm run build
npx serve -s dist
```
Then open `http://localhost:3000` and test:
- Install prompt
- Offline functionality
- Service worker caching

### 🔐 Security

- No sensitive data in localStorage
- API calls use relative URLs (proxied in dev)
- CSP headers recommended for production
- Regular dependency updates: `npm audit`

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Open global search |
| `Esc` | Close search modal |
| `↑` `↓` | Navigate search results |
| `Enter` | Select search result |

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Environment Variables

```env
# Development
VITE_API_URL=http://localhost:5000

# Production (auto-handled by Vite)
# No additional env vars needed
```

---

## Deployment

**Vercel** (Recommended):
```bash
# Deploy with validation
npm run vercel-build

# Or use Vercel CLI
vercel --prod
```

**Build Output**:
- Static files in `dist/`
- Service worker: `dist/sw.js`
- Manifest: `dist/manifest.webmanifest`

---

## Troubleshooting

### Service Worker Not Updating
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
location.reload();
```

### Toast Not Showing
- Check `<Toaster />` is in App.jsx
- Verify `react-hot-toast` is imported correctly
- Check browser console for errors

### Global Search Not Working
- Verify API endpoints are accessible
- Check network tab for stock data loading
- Ensure Ctrl+K listener is registered

---

## Performance Monitoring

```javascript
// Check bundle sizes
npm run build

// Analyze chunks (add to package.json)
"analyze": "vite build --mode analyze"

// Use Lighthouse in Chrome DevTools
// Target: Performance > 90, PWA > 90
```

---

## Support & Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [PWA Documentation](https://web.dev/progressive-web-apps)
- [React Hot Toast Docs](https://react-hot-toast.com)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
