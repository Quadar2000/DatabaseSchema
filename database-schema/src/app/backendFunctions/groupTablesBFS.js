
export default function groupTablesBFS(tables, relationships) {
    // Tworzenie mapy relacji dla szybkiego dostępu
    const relationMap = new Map();
    tables.forEach(table => {
      relationMap.set(table.id, []);
    });
    
    relationships.forEach(rel => {
      relationMap.get(rel.source).push(rel.target);
      relationMap.get(rel.target).push(rel.source); // Dla relacji dwukierunkowej
    });
    
    const groupedTables = [];
    const visited = new Set();
    
    function bfs(startTable) {
      const queue = [startTable];
      const group = [];
      
      while (queue.length > 0) {
        const currentTable = queue.shift();
        
        if (!visited.has(currentTable.id)) {
          visited.add(currentTable.id);
          group.push(currentTable);
          
          const neighbors = relationMap.get(currentTable.id);
          neighbors.forEach(neighborId => {
            const neighborTable = tables.find(table => table.id === neighborId);
            if (neighborTable && !visited.has(neighborId)) {
              queue.push(neighborTable);
            }
          });
        }
      }
      
      return group;
    }
    
    // Grupa dla każdej niezależnej części schematu
    tables.forEach(table => {
      if (!visited.has(table.id)) {
        const group = bfs(table);
        groupedTables.push(group);
      }
    });

    let x = 100;
    let y = 100;

      groupedTables.forEach(group => {
        group.forEach(table => {
          table.x = x;
          table.y = y;

          x += 200;
          y += 100;
        });
      x = 100;
      });
    
    return groupedTables;
  }