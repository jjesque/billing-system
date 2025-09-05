const { Client, Databases, Query } = require("node-appwrite");

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT || "http://appwrite/v1")
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

/**
 * Main function handler
 */
module.exports = async ({ req, res, log, error }) => {
  try {
    // Parse request payload
    const {
      invoiceID,       // changed from invoiceId
      action,          // changed from operation
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = JSON.parse(req.body || "{}");

    log("Payload received:", { invoiceID, action, startDate, endDate, page, limit });

    // Build query filters
    const queries = [
      Query.orderDesc("timestamp"),
      Query.limit(Math.min(limit, 100)), // max 100
      Query.offset((page - 1) * limit),
    ];

    // Add filters if provided
    if (invoiceID) queries.push(Query.equal("invoiceId", invoiceID));
    if (action && action !== "all") queries.push(Query.equal("action", action));
    if (startDate) queries.push(Query.greaterThanEqual("timestamp", new Date(startDate).toISOString()));
    if (endDate) queries.push(Query.lessThanEqual("timestamp", new Date(endDate).toISOString()));

    log("Queries built:", queries);

    // Fetch logs from database
    const logs = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_LOGS_COLLECTION_ID,
      queries
    );

    log("Documents retrieved:", logs.documents.length);

    // Parse details JSON for each log
    const processedLogs = logs.documents.map((doc) => ({
      ...doc,
      details: doc.details ? JSON.parse(doc.details) : {},
    }));

    log(`Retrieved ${processedLogs.length} logs`);

    return res.json({
      success: true,
      logs: processedLogs,
      total: logs.total,
      page,
      limit,
    });
  } catch (err) {
    error("Failed to fetch logs:", err);
    return res.json(
      {
        success: false,
        error: err.message,
      },
      500
    );
  }
};
