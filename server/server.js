require('dotenv').config();

const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
