export default function classifyRelationships(foreignKeys, primaryKeys) {
    const links = [];
  
    foreignKeys.forEach(fk => {
      const sourcePK = primaryKeys.find(pk => pk.table_name === fk.source_table && pk.column_name === fk.source_column);
      const targetPK = primaryKeys.find(pk => pk.table_name === fk.target_table && pk.column_name === fk.target_column);
  
      if (sourcePK && targetPK) {
        // Relacja jeden do jednego
        links.push({ source: fk.source_table, target: fk.target_table, type: 'one-to-one' });
      } else if (targetPK) {
        // Relacja jeden do wielu
        links.push({ source: fk.source_table, target: fk.target_table, type: 'one-to-many' });
      }
    });
  
    return links;
  }