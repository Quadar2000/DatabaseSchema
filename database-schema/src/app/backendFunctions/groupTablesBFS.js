
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

    let x = 200;
    let y = 200;
    let i = -1;
    let j = -1;

      groupedTables.forEach(group => {
        j=-1;
        group.forEach(table => {
          table.x = x;
          table.y = y;
          table.fixed = false;
          //console.log('name: ' + table.id + ', x: ' + table.x + ', y: ' + table.y + '\n')
          x += 200;
          y += 100;
        });
      x = 100;
      i++;
      j++;
      //group[0].fixed = true;
      });
      const group = groupedTables[0]
      group[0].fixed = true;

      const group2 = groupedTables[i]
      group2[j].fixed = true;
    return groupedTables;
  }