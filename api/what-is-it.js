const { MongoClient } = require('mongodb');

const PAGE_COLLECTION_NAME = 'what_is_it';
const EDITORS_COLLECTION_NAME = 'what_is_it_editors';
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

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function getDatabase() {
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
  return client.db(DATABASE_NAME);
}

async function getCollections() {
  const database = await getDatabase();
  const pages = database.collection(PAGE_COLLECTION_NAME);
  const editors = database.collection(EDITORS_COLLECTION_NAME);

  await editors.createIndex(
    { pageId: 1, email: 1 },
    { unique: true, name: 'page_email_unique' }
  );
  await editors.createIndex(
    { email: 1 },
    { name: 'email_lookup' }
  );

  return { pages, editors };
}

function serializeDocument(document) {
  return {
    content: document && typeof document.content === 'string' ? document.content : '',
    updatedAt: document && document.updatedAt ? new Date(document.updatedAt).toISOString() : null,
    lastEditorName: document && typeof document.lastEditorName === 'string' ? document.lastEditorName : '',
    editorCount: Number(document && document.editorCount) || 0
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
      const collections = await getCollections();
      const document = await collections.pages.findOne({ _id: PAGE_ID });
      const editorCount = await collections.editors.countDocuments({ pageId: PAGE_ID });

      sendJson(response, 200, serializeDocument({
        ...(document || {}),
        editorCount: editorCount
      }));
      return;
    }

    if (request.method !== 'POST') {
      response.setHeader('Allow', 'GET, POST');
      sendJson(response, 405, { error: 'Method not allowed' });
      return;
    }

    const body = await readBody(request);
    const username = sanitizeText(body.username, 40);
    const email = sanitizeText(body.email, 160).toLowerCase();
    const content = String(body.content || '').replace(/\r\n?/g, '\n').slice(0, 20000);

    if (!username || !email) {
      sendJson(response, 400, { error: 'Missing required fields' });
      return;
    }

    if (!isValidEmail(email)) {
      sendJson(response, 400, { error: 'Invalid email' });
      return;
    }

    const collections = await getCollections();
    const updatedAt = new Date();

    await collections.pages.updateOne(
      { _id: PAGE_ID },
      {
        $set: {
          content,
          updatedAt,
          lastEditorName: username,
          lastEditorEmail: email
        }
      },
      { upsert: true }
    );

    await collections.editors.updateOne(
      { pageId: PAGE_ID, email: email },
      {
        $set: {
          pageId: PAGE_ID,
          email,
          username,
          content,
          updatedAt
        },
        $setOnInsert: {
          createdAt: updatedAt
        },
        $inc: {
          saveCount: 1
        }
      },
      { upsert: true }
    );

    const document = await collections.pages.findOne({ _id: PAGE_ID });
    const editorCount = await collections.editors.countDocuments({ pageId: PAGE_ID });

    sendJson(response, 200, serializeDocument({
      ...(document || {}),
      editorCount: editorCount
    }));
  } catch (error) {
    if (error && error.code === 'DATABASE_URL_MISSING') {
      sendJson(response, 503, { error: 'Database unavailable' });
      return;
    }

    sendJson(response, 500, { error: 'Internal server error' });
  }
};
