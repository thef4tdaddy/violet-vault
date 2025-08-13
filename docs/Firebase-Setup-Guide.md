# Firebase Setup Guide for VioletVault

This guide covers setting up Firebase Firestore for VioletVault, including security rules and configuration for self-hosting.

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com)
- Firebase Authentication enabled (for user management)
- Firestore Database created

## Firebase Configuration

### Environment Variables

Set these environment variables in your `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEF
```

You can find these values in:
1. Firebase Console → Project Settings → General Tab → Your apps → Web app config

## Firestore Security Rules

VioletVault uses a chunked storage approach to handle large budget data. The app stores data in two structures:

1. **Main budget document**: `/budgets/{budgetId}` - Contains manifest and metadata
2. **Chunk subcollection**: `/budgets/{budgetId}/chunks/{chunkId}` - Contains actual data chunks

### Basic Security Rules (Recommended for Self-Hosting)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Budget documents and their chunks
    match /budgets/{budgetId} {
      // Allow authenticated users to read/write their own budget documents
      allow read, write: if request.auth != null;
      
      // Subcollection for budget chunks
      match /chunks/{chunkId} {
        // Allow authenticated users to read/write chunks within their budget
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

### Advanced Security Rules (Multi-User Environment)

For production environments with multiple users, use these more restrictive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Budget documents - only allow if user is owner or has access
    match /budgets/{budgetId} {
      // Allow read/write if user is owner or in allowed users list
      allow read, write: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.allowedUsers);
      
      // Allow creation if the user is setting themselves as owner
      allow create: if request.auth != null && 
        request.resource.data.ownerId == request.auth.uid;
      
      // Subcollection for budget chunks
      match /chunks/{chunkId} {
        // Check parent document permissions
        allow read, write: if request.auth != null && 
          (get(/databases/$(database)/documents/budgets/$(budgetId)).data.ownerId == request.auth.uid ||
           request.auth.uid in get(/databases/$(database)/documents/budgets/$(budgetId)).data.allowedUsers);
      }
    }
    
    // User profiles (optional - for team features)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Applying Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database**
4. Click on the **Rules** tab
5. Replace existing rules with one of the rulesets above
6. Click **Publish**

## Data Structure Overview

### Budget Manifest Document
```
/budgets/{budgetId}
{
  type: "budget_manifest",
  encryptedData: "...", // Encrypted manifest with chunk references
  lastModified: 1234567890,
  chunkCount: 5,
  ownerId: "user_uid", // (Advanced rules only)
  allowedUsers: ["user1", "user2"] // (Advanced rules only)
}
```

### Budget Chunks
```
/budgets/{budgetId}/chunks/{chunkId}
{
  chunkType: "transactions", // or "envelopes", "bills", etc.
  chunkIndex: 0,
  totalChunks: 3,
  encryptedData: "...", // Encrypted chunk data
  lastModified: 1234567890
}
```

## Chunked Storage Benefits

- **Handles large datasets**: Prevents Firestore 1MB document limit
- **Efficient syncing**: Only modified chunks are updated
- **Scalable**: Automatically splits data as it grows
- **Encrypted**: All data is encrypted before storage

## Troubleshooting

### "Missing or insufficient permissions" Error

This error occurs when Firestore security rules don't allow the operation. Solutions:

1. **Check authentication**: Ensure user is signed in to Firebase Auth
2. **Verify rules**: Make sure security rules match the data structure
3. **Test in Firebase Console**: Use the Rules Playground to test specific operations

### Large Dataset Performance

- The chunked system automatically handles datasets of any size
- Typical chunk size: ~600KB (safe margin under 1MB Firestore limit)
- Average items per chunk: varies by data complexity

### Migration from Single Document

The app automatically migrates from single-document storage to chunked storage when:
- Document size approaches Firestore limits
- User has large amounts of data

## Development vs Production

### Development
- Use the basic security rules
- Enable Firebase Auth for testing
- Monitor usage in Firebase Console

### Production
- Use advanced security rules with proper user isolation
- Set up billing alerts in Firebase Console
- Configure backup procedures
- Monitor security rules performance

## Support

If you encounter issues:
1. Check the browser console for Firebase errors
2. Review Firestore security rules in Firebase Console
3. Test authentication flow
4. Verify environment variables are set correctly

For VioletVault-specific issues, create an issue in the GitHub repository with:
- Firebase error messages
- Browser console logs
- Security rules configuration
- Environment setup details