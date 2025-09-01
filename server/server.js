require('dotenv').config();

const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');

const app = express();

app.use(cors());

// Aumentar límite para JSON grande
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
