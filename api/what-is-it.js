const { MongoClient } = require('mongodb');

const COLLECTION_NAME = 'what_is_it';
const PAGE_ID = 'what-is-it';
const MONGODB_URI = process.env.DATABASE_URL || '';

function extractDatabaseName(uri) {
  const match = uri.match(/^[^/]+\/\/[^/]+\/([^?]+)/);
  return match && match[1] ? decodeURIComponent(match[1]) : 'database';
}

const DATABASE_NAME = process.env.DATABASE_NAME || extractDatabaseName(MONGODB_URI);

let clientPromise = global.__whatIsItMongoClientPromise;

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

function sanitizeText(value, maxLength) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .slice(0, maxLength)
    .trim();
}

async function getCollection() {
  if (!MONGODB_URI) {
    const error = new Error('DATABASE_URL is not configured');
    error.code = 'DATABASE_URL_MISSING';
    throw error;
  }

  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 4
    });
    clientPromise = client.connect();
    global.__whatIsItMongoClientPromise = clientPromise;
  }

  const client = await clientPromise;
  return client.db(DATABASE_NAME).collection(COLLECTION_NAME);
}

function serializeDocument(document) {
  const editorIds = Array.isArray(document && document.editorIds) ? document.editorIds : [];
  return {
    content: document && typeof document.content === 'string' ? document.content : '',
    updatedAt: document && document.updatedAt ? new Date(document.updatedAt).toISOString() : null,
    lastEditorName: document && typeof document.lastEditorName === 'string' ? document.lastEditorName : '',
    editorCount: editorIds.length
  };
}

async function readBody(request) {
  if (request.body && typeof request.body === 'object') {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    return {};
  }
}

module.exports = async function handler(request, response) {
  try {
    if (request.method === 'GET') {
      const collection = await getCollection();
      const document = await collection.findOne({ _id: PAGE_ID });
      sendJson(response, 200, serializeDocument(document));
      return;
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST');
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    const body = await readBody(request);
    const username = sanitizeText(body.username, 40);
    const editorId = sanitizeText(body.editorId, 128);
    const content = String(body.content || '').replace(/\r\n?/g, '\n').slice(0, 20000);

    if (!username || !editorId) {
      sendJson(response, 400, { error: 'Missing required fields' });
      return;
    }

    const collection = await getCollection();
    const updatedAt = new Date();

    await collection.updateOne(
      { _id: PAGE_ID },
      {
        $set: {
          content,
          updatedAt,
          lastEditorName: username
        },
        $addToSet: {
          editorIds: editorId
        }
      },
      { upsert: true }
    );

    const document = await collection.findOne({ _id: PAGE_ID });
    sendJson(response, 200, serializeDocument(document));
  } catch (error) {
    if (error && error.code === 'DATABASE_URL_MISSING') {
      sendJson(response, 503, { error: 'Database unavailable' });
      return;
    }

    sendJson(response, 500, { error: 'Internal server error' });
  }
};
