require ('dotenv').config()
const connectDB = require('./src/config/db');
const app = require('./app');

connectDB();

const PORT = process.env.PORT || 8000;
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
});
