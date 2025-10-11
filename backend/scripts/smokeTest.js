const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Started in-memory MongoDB at', uri);

  // set env for the app
  process.env.MONGO_URI = uri;
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';
  process.env.NODE_ENV = 'test';

  // connect mongoose programmatically (app itself doesn't call connect)
  await mongoose.connect(uri, { dbName: 'test' });

  // start the app programmatically
  const app = require(path.join(__dirname, '..', 'app'));
  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log('App started on port', port);
    const base = `http://127.0.0.1:${port}/api`;

    try {
      // 1) Register consumer
      const reg = await axios.post(`${base}/auth/register`, { name: 'Test', email: 'test@example.com', password: 'password' });
      console.log('Register:', reg.data);

      // 2) Login consumer
      const login = await axios.post(`${base}/auth/login`, { email: 'test@example.com', password: 'password' });
      console.log('Login:', login.data);
      const token = login.data.data?.token || login.data.token;
      const consumerId = login.data.data?.id || login.data.id;

      // 3) Protected route (consumer)
      const prot = await axios.get(`${base}/auth/protected`, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Protected:', prot.data.message ? prot.data : prot.data);

      // 4) Register farmer
      const regFarmer = await axios.post(`${base}/auth/register`, { name: 'Farmer', email: 'farmer@example.com', password: 'password', role: 'farmer' });
      console.log('Farmer register:', regFarmer.data);
      const farmerToken = regFarmer.data.data?.token || (await axios.post(`${base}/auth/login`, { email: 'farmer@example.com', password: 'password' })).data.data.token;
      const farmerId = regFarmer.data.data?.id || (await axios.post(`${base}/auth/login`, { email: 'farmer@example.com', password: 'password' })).data.data.id;

      // 5) Create a product as farmer
  const prodPayload = { name: 'Test Product', description: 'Sample', price: 100, category: 'vegetables', quantity: 50, unit: 'kg', image: 'test.png', location: 'Testville' };
      const prodResp = await axios.post(`${base}/products`, prodPayload, { headers: { Authorization: `Bearer ${farmerToken}` } });
      console.log('Create product response status:', prodResp.status);
      const product = prodResp.data.data || prodResp.data;
      const productId = product._id || product.id;

      // 6) Place an order (public endpoint)
      const orderPayload = {
        customerInfo: { name: 'Test Buyer', email: 'test@example.com', phone: '9999999999', address: '123 Test St' },
        items: [ { productId: productId, name: product.name || 'Test Product', quantity: 1, price: 100, farmerId: farmerId } ],
        totalAmount: 100
      };
      const orderResp = await axios.post(`${base}/orders`, orderPayload);
      console.log('Order create status:', orderResp.status, orderResp.data.success ? 'success' : orderResp.data);

      // 7) Create bulk negotiation as consumer (protected)
  const bulkPayload = { productId: productId, sellerId: farmerId, quantity: 10, negotiatedPrice: 90, paymentMethod: 'UPI', deliveryDate: new Date().toISOString(), notes: 'Test bulk' };
      const bulkResp = await axios.post(`${base}/bulk-buy`, bulkPayload, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Bulk negotiation create status:', bulkResp.status);
      const negotiation = bulkResp.data;

      // 8) Create cold storage as farmer
      const storagePayload = {
        name: 'Test Storage',
        location: 'Testville',
        coordinates: { lat: 12.97, lng: 77.59 },
        capacity: 100,
        available: 100,
        temperature: 5,
        price: 1000,
        pricePerTonPerDay: 10,
        features: ['dry', 'cooled'],
        contact: '0123456789'
      };
      const storageResp = await axios.post(`${base}/cold-storage`, storagePayload, { headers: { Authorization: `Bearer ${farmerToken}` } });
      console.log('Cold storage create status:', storageResp.status);
      const storage = storageResp.data;
      const storageId = storage._id || storage.id;

  // 9) Book cold storage as consumer
      const bookingPayload = { quantity: 10, duration: 2, transportType: 'truck', deliveryDate: new Date().toISOString(), notes: 'Test booking' };
      const bookResp = await axios.post(`${base}/cold-storage/${storageId}/book`, bookingPayload, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Cold storage booking status:', bookResp.status);

      // 10) Test upload single file (ensure uploads dir exists)
      const fs = require('fs');
      const FormData = require('form-data');
      const uploadsDir = path.join(__dirname, '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      // Minimal PNG header buffer (small image) to satisfy multer mime check
      const imgBuffer = Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82]);
      const form = new FormData();
      form.append('image', imgBuffer, { filename: 'test.png', contentType: 'image/png' });

      const uploadResp = await axios.post(`${base}/upload/single`, form, { headers: form.getHeaders(), maxBodyLength: Infinity });
      console.log('Upload response status:', uploadResp.status, uploadResp.data.message || uploadResp.data);

  // 11) Pricing endpoint
  const pricingResp = await axios.get(`${base}/pricing`);
  console.log('Pricing endpoint status:', pricingResp.status);

  // 12) Add a product review as consumer
  const reviewResp = await axios.post(`${base}/products/${productId}/reviews`, { rating: 5, comment: 'Great product!' }, { headers: { Authorization: `Bearer ${token}` } });
  console.log('Review response status:', reviewResp.status);

  // 13) Chatbot session and message (will use fallback if GEMINI_KEY not set)
  const sessionResp = await axios.post(`${base}/chatbot/session`, { userId: consumerId });
  const sessionId = sessionResp.data.sessionId;
  console.log('Chat session created:', sessionId);

  const chatResp = await axios.post(`${base}/chatbot/message`, { userId: consumerId, sessionId, message: 'How should I water my wheat crop?' });
  console.log('Chat response:', chatResp.data);

  // 14) Cold-storage utility endpoints
  const availResp = await axios.get(`${base}/cold-storage/${storageId}/availability`, { params: { quantity: 5, duration: 2 } });
  console.log('Availability status:', availResp.status);

  const nearbyResp = await axios.get(`${base}/cold-storage/nearby`, { params: { lat: 12.97, lng: 77.59, radius: 50 } });
  console.log('Nearby response status:', nearbyResp.status);

  const deliveryResp = await axios.get(`${base}/cold-storage/delivery-estimate`, { params: { lat: 12.97, lng: 77.59, quantity: 5, transportType: 'truck' } });
  console.log('Delivery estimate status:', deliveryResp.status);

  console.log('Extended smoke test completed successfully');
    } catch (err) {
      console.error('Smoke test failed:', err.response ? err.response.data : err.message);
    } finally {
      server.close();
      await mongod.stop();
      mongoose.disconnect();
    }
  });
}

run().catch(err => {
  console.error('Smoke runner error:', err);
  process.exit(1);
});
