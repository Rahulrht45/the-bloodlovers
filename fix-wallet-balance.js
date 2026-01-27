// Manual Wallet Balance Fixer
// Open browser console and paste this script

console.log('🔧 Wallet Balance Fixer');
console.log('========================\n');

// Function to add balance to a specific player
function addPlayerBalance(playerName, amount) {
    const key = `player_wallet_${playerName.toLowerCase().replace(/\s+/g, '_')}`;
    const currentBalance = Number(localStorage.getItem(key) || 0);
    const newBalance = currentBalance + amount;
    localStorage.setItem(key, String(newBalance));
    console.log(`✅ ${playerName}: ${currentBalance} + ${amount} = ${newBalance}`);
    return newBalance;
}

// Function to show all player wallets
function showAllWallets() {
    console.log('\n📊 Current Player Wallets:');
    console.log('==========================');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('player_wallet_')) {
            const playerName = key.replace('player_wallet_', '').replace(/_/g, ' ').toUpperCase();
            const balance = Number(localStorage.getItem(key) || 0);
            console.log(`${playerName}: ৳${balance}`);
        }
    }
}

// Show current state
showAllWallets();

// UNCOMMENT THE LINE BELOW TO ADD 72 TAKA TO RAHUL SARDER
// addPlayerBalance('RAHUL SARDER', 72);

// Or if the name is different, use the correct name:
// addPlayerBalance('RAHULRHT', 72);
// addPlayerBalance('RAHUL', 72);

console.log('\n💡 Instructions:');
console.log('1. Check the player names above');
console.log('2. Uncomment the correct addPlayerBalance line');
console.log('3. Run this script again');
console.log('4. Refresh the page to see updated balance');
