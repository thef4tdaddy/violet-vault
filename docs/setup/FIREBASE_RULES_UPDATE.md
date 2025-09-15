# Firebase Security Rules Update

The current rules should work with anonymous authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Budget documents and their chunks
    match /budgets/{budgetId} {
      // Allow any authenticated user to access any budget document
      // Access control is handled by share code -> budget ID derivation
      // Different anonymous users need shared access for shared budgets
      allow read, write: if request.auth != null;

      // Subcollection for budget chunks
      match /chunks/{chunkId} {
        // Allow any authenticated user to access budget chunks
        // Access control is handled by parent budget document access
        allow read, write: if request.auth != null;
      }
    }

    // Locks collection for sync coordination
    match /locks/{lockId} {
      // Allow authenticated users to read/write/create/delete lock documents
      allow read, write, create, delete: if request.auth != null;
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
- **CRITICAL**: Updated rules to allow shared budget access between different anonymous users
- Access control is now handled by share code -> budget ID derivation (not Firebase user ownership)

## Implementation

- `ensureAuthenticated()` method added to ChunkedFirebaseSync
- All major methods (`saveToCloud`, `loadFromCloud`, `resetCloudData`) now authenticate first
- Uses `signInAnonymously()` for seamless user experience
- No user signup/login required - completely transparent to user

## Shared Budget Support

These rules specifically enable shared budget functionality by allowing different anonymous users to access the same budget document. The security model works as follows:

1. **Share codes generate deterministic budget IDs** - Only users with the share code can derive the correct budget ID
2. **Firebase provides authentication** - Only authenticated users can access Firestore
3. **Budget ID acts as the access token** - If you can derive the budget ID, you have access
4. **Different UIDs preserve accountability** - Each user maintains their own anonymous UID for history tracking

This approach provides both security (via cryptographic share codes) and collaboration (via shared document access).
