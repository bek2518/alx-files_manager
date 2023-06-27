import route from './routes/index';

const express = require('express');

const app = express();
const hostname = '0.0.0.0';
const port = process.env.PORT || 5000;

app.listen(port, hostname, () => {
  console.log(`Server running on port ${port}`);
});
app.use(express.json())
app.use('/', route);

export default app;
