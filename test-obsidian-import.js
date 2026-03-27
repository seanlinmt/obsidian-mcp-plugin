try {
    const obsidian = require('obsidian');
    console.log('Obsidian module loaded:', obsidian);
    console.log('App:', obsidian.App);
} catch (error) {
    console.error('Error loading obsidian:', error.message);
}
