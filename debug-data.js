// Debug script to check data in localStorage and IndexedDB
console.log("=== DEBUGGING VIOLET VAULT DATA ===");

// Check localStorage keys
console.log("LocalStorage keys:");
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key?.includes('budget') || key?.includes('violet') || key?.includes('envelope')) {
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value?.length || 0} characters`);
    
    // Try to parse and show data counts
    try {
      const parsed = JSON.parse(value);
      if (parsed.state) {
        console.log(`    Envelopes: ${parsed.state.envelopes?.length || 0}`);
        console.log(`    Transactions: ${parsed.state.transactions?.length || 0}`);
        console.log(`    Bills: ${parsed.state.bills?.length || 0}`);
      }
    } catch (e) {
      console.log(`    (Not JSON or encrypted data)`);
    }
  }
}

// Check if Dexie databases exist
if (typeof indexedDB !== 'undefined') {
  console.log("\nChecking IndexedDB databases...");
  
  // List all databases
  if (indexedDB.databases) {
    indexedDB.databases().then(dbs => {
      console.log("Available databases:", dbs.map(db => db.name));
      
      // Check VioletVaultDB specifically
      const violetDB = dbs.find(db => db.name === 'VioletVaultDB');
      if (violetDB) {
        console.log(`VioletVaultDB found, version: ${violetDB.version}`);
      } else {
        console.log("VioletVaultDB not found");
      }
    });
  }
}

console.log("=== END DEBUG ===");