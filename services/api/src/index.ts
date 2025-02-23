import express = require('express');
import type { Task } from '@todoiti/common';
const app = express();

const task: Task = { name: 'Finish test' };

app.get('/', function (req, res) {
  res.send(task.name);
});

app.listen(8000);
