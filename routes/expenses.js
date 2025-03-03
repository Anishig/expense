const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  date: Date,
  description: String,
});

const Expense = mongoose.model('Expense', expenseSchema);


router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/filter', async (req, res) => {
  try {
    const { category, date } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (date) filter.date = new Date(date);
    
    const expenses = await Expense.find(filter);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/total', async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const total = await Expense.aggregate([
      {
        $match: {
          date: { $gte: new Date(start), $lte: new Date(end) },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.json({ total: total[0]?.totalAmount || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
