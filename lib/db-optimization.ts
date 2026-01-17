import clientPromise from './mongodb';

/**
 * Ensure database indexes exist for optimal query performance.
 * This should be run once on app initialization.
 */
export async function ensureIndexes() {
    try {
        const client = await clientPromise;
        const collection = client.db('protagame').collection('journal_entries');

        // Create index on date field (our most common query)
        await collection.createIndex({ date: 1 }, { unique: true });

        console.log('✓ Database indexes created successfully');
    } catch (error) {
        console.error('Failed to create indexes:', error);
    }
}
