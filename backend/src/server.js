const app = require('./app');
const { connectDB } = require('./config/db');
const seed = require('./seed');

const PORT = process.env.PORT || 3000;

connectDB()
  .then(async () => {
    console.log('Database connected and models synchronized');
    if (process.env.NODE_ENV !== 'test') {
      await seed();
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API docs:    http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });
