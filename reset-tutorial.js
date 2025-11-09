// SCRIPT PARA RESETAR TUTORIAL - Cole no console (F12)

console.log('🔄 RESETANDO TUTORIAL...');

// Remove TODAS as chaves relacionadas
localStorage.removeItem('dungeon_scoundrel_played_before');
localStorage.removeItem('dungeon_scoundrel_tutorial_completed');

console.log('✅ LocalStorage limpo!');
console.log('📊 Status:');
console.log('  - played_before:', localStorage.getItem('dungeon_scoundrel_played_before'));
console.log('  - tutorial_completed:', localStorage.getItem('dungeon_scoundrel_tutorial_completed'));

console.log('🔄 Recarregando página...');
setTimeout(() => location.reload(), 1000);
