const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');

// Firebase configuration (you'll need to add your config here)
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateBookingsToUUID() {
  try {
    console.log('Starting migration to UUID...');

    // Get all existing bookings
    const bookingsRef = collection(db, 'bookings');
    const querySnapshot = await getDocs(bookingsRef);

    console.log(`Found ${querySnapshot.size} bookings to migrate`);

    const migrationResults = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const docSnapshot of querySnapshot.docs) {
      try {
        const bookingData = docSnapshot.data();
        const oldId = docSnapshot.id;

        // Generate new UUID
        const newId = uuidv4();

        // Create new booking with UUID
        const newBooking = {
          id: newId,
          ...bookingData
        };

        // Save with new UUID
        await setDoc(doc(db, 'bookings', newId), newBooking);

        // Delete old document
        await deleteDoc(doc(db, 'bookings', oldId));

        console.log(`Migrated booking: ${oldId} -> ${newId}`);
        migrationResults.success++;

      } catch (error) {
        console.error(`Failed to migrate booking ${docSnapshot.id}:`, error);
        migrationResults.failed++;
        migrationResults.errors.push({
          id: docSnapshot.id,
          error: error.message
        });
      }
    }

    console.log('\nMigration completed!');
    console.log(`Success: ${migrationResults.success}`);
    console.log(`Failed: ${migrationResults.failed}`);

    if (migrationResults.errors.length > 0) {
      console.log('\nErrors:');
      migrationResults.errors.forEach(error => {
        console.log(`- ${error.id}: ${error.error}`);
      });
    }

  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateBookingsToUUID();
