const fs = require('fs');
const path = require('path');

const SEED_FILE = path.join(__dirname, 'seedData.json');
const RUNTIME_DB_FILE = path.join(__dirname, 'runtimeData.json');

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(RUNTIME_DB_FILE)) {
        const raw = fs.readFileSync(RUNTIME_DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        const rawSeed = fs.readFileSync(SEED_FILE, 'utf-8');
        this.data = JSON.parse(rawSeed);
        this.save();
      }
    } catch (err) {
      console.error('Error loading database, resetting to seed:', err);
      const rawSeed = fs.readFileSync(SEED_FILE, 'utf-8');
      this.data = JSON.parse(rawSeed);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(RUNTIME_DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  reset() {
    const rawSeed = fs.readFileSync(SEED_FILE, 'utf-8');
    this.data = JSON.parse(rawSeed);
    this.save();
    return this.data;
  }

  get(collection) {
    return this.data[collection] || [];
  }

  find(collection, filterFn) {
    const items = this.get(collection);
    return filterFn ? items.filter(filterFn) : items;
  }

  findOne(collection, filterFn) {
    const items = this.get(collection);
    return items.find(filterFn) || null;
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, filterFn, updateFn) {
    const items = this.get(collection);
    let count = 0;
    for (let i = 0; i < items.length; i++) {
      if (filterFn(items[i])) {
        items[i] = updateFn(items[i]);
        count++;
      }
    }
    if (count > 0) this.save();
    return count;
  }

  remove(collection, filterFn) {
    if (!this.data[collection]) return 0;
    const initialLen = this.data[collection].length;
    this.data[collection] = this.data[collection].filter(item => !filterFn(item));
    const removedCount = initialLen - this.data[collection].length;
    if (removedCount > 0) this.save();
    return removedCount;
  }
}

const dbInstance = new Database();
module.exports = dbInstance;
