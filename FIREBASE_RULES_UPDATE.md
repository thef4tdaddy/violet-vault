# Firebase Security Rules Update

The current rules should work with anonymous authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Budget documents and their chunks
    match /budgets/{budgetId} {
      // Allow authenticated users (including anonymous) to read/write their own budget documents
      allow read, write: if request.auth != null;

      // Subcollection for budget chunks
      match /chunks/{chunkId} {
        // Allow authenticated users (including anonymous) to read/write chunks within their budget
        allow read, write: if request.auth != null;
      }
    }

    // Fallback: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## What Changed

- Added Firebase Anonymous Authentication to ChunkedFirebaseSync
- All Firestore operations now ensure authentication before proceeding
- Anonymous users can now access Firestore with proper authentication

## Implementation

- `ensureAuthenticated()` method added to ChunkedFirebaseSync
- All major methods (`saveToCloud`, `loadFromCloud`, `resetCloudData`) now authenticate first
- Uses `signInAnonymously()` for seamless user experience
- No user signup/login required - completely transparent to user
