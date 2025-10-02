# Multi-File Uploader with State Machines

A production-ready React application for uploading multiple files with progress tracking, retry functionality, and concurrency control. Built with TypeScript, Vite, and modern React patterns.

## Features

- **Multi-file upload** with drag & drop support
- **Progress tracking** with real-time updates
- **Concurrency control** (max 5 simultaneous uploads)
- **Retry functionality** with exponential backoff
- **Cancel uploads** at any time
- **Error handling** with clear error messages
- **Accessible UI** with ARIA labels and keyboard navigation
- **Fully mocked APIs** - no external network requests
- **Comprehensive testing** with Vitest and React Testing Library

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Custom React hooks with concurrent upload management
- **File Handling**: react-dropzone for drag & drop
- **API Layer**: tRPC with Zod validation (fully mocked)
- **Testing**: Vitest + @testing-library/react + jest-dom
- **Styling**: CSS Modules with accessible design
- **Code Quality**: ESLint + Prettier with strict TypeScript configuration

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup & Installation

```bash
# Clone the repository
git clone <repository-url>
cd file_uploader

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5174
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run typecheck    # Type check without emitting
npm run format       # Format code with Prettier
```

## Architecture Overview

### Upload Flow

Each file goes through a 4-step upload process:

1. **Get Upload URL** - Request a signed upload URL from the server
2. **Upload File** - Upload the file with progress tracking
3. **Process File** - Server-side processing with retry logic
4. **Notify Completion** - Final notification to complete the upload

### State Management

The application uses a custom React hook (`useUploadManager`) that manages:

- **File Queue**: Tracks all files and their current status
- **Concurrency Control**: Limits active uploads to 5 simultaneous operations
- **Progress Tracking**: Real-time progress updates during upload
- **Error Handling**: Comprehensive error states with retry options

### Mock Configuration

All APIs are mocked using tRPC with configurable behavior:

```typescript
// Adjust mock behavior in src/server/trpc.ts
export const mockConfig = {
  latencyMs: [200, 1200],    // Random latency range
  failRate: 0.15,            // 15% failure rate
  seed: 42,                  // Deterministic randomization
  forceAllSuccess: false,    // Override failures for demos
};
```

### File States

- `queued` - Waiting to start
- `gettingUrl` - Requesting upload URL
- `uploading` - File upload in progress
- `processing` - Server-side processing
- `notifying` - Final notification
- `done` - Successfully completed
- `failed` - Error occurred (retryable)
- `canceled` - User canceled

## Usage

1. **Add Files**: Drag & drop files or click to select
2. **Start Uploads**: Click "Start Uploads" to begin processing
3. **Monitor Progress**: Watch real-time progress in the Active section
4. **Handle Errors**: Use "Retry Step" or "Retry All" for failed uploads
5. **Manage Queue**: Cancel active uploads or remove completed items

## Testing

The application includes comprehensive tests:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test -- --coverage
```

Test coverage includes:
- Upload manager functionality
- File state transitions
- Concurrency control
- Error handling and retries
- UI component interactions

## Mock Controls

For testing and demonstration purposes, you can control mock behavior:

```typescript
// Force all operations to succeed
mockConfig.forceAllSuccess = true;

// Set specific failure rate
mockConfig.failRate = 0.3; // 30% failure rate

// Adjust latency for faster testing
mockConfig.latencyMs = [0, 100];
```

## Trade-offs & Extensions

### Current Implementation
- **Simplicity**: Uses React hooks instead of complex state machines
- **Performance**: Efficient concurrent upload management
- **Testing**: Fully mocked for reliable testing

### Possible Extensions
- **Resumable Uploads**: Add support for pausing/resuming large files
- **Multipart Uploads**: Handle very large files with chunked uploads
- **Persistence**: Save upload state to localStorage
- **Real Backend**: Replace mocks with actual server integration
- **File Validation**: Add file type/size validation
- **Drag & Drop Zones**: Multiple drop zones for different file types

## Browser Support

- Modern browsers with ES2022 support
- File API and drag & drop support required
- AbortController for upload cancellation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run `npm run typecheck` and `npm run lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
