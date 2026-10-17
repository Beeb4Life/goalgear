/**
 * GoalGear - Server Entrypoint
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚽ GoalGear Football Store Server Running`);
    console.log(`📡 Local URL: http://localhost:${PORT}`);
    console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin.html`);
    console.log(`📦 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
});
