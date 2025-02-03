export default function classifyRelationships(foreignKeys, primaryKeys, databaseTables) {
  const links = [];

  foreignKeys.forEach(fk => {
    const sourcePK = primaryKeys.find(pk => pk.table_name === fk.source_table && pk.column_name === fk.source_column);
    const targetPK = primaryKeys.find(pk => pk.table_name === fk.target_table && pk.column_name === fk.target_column);

    const primaryKeyPosition = databaseTables.find(table => table.id === fk.target_table)
    .columns.findIndex(column => column === fk.target_column);

    const foreignKeyPosition = databaseTables.find(table => table.id === fk.source_table)
    .columns.findIndex(column => column === fk.source_column);

    if (sourcePK && targetPK) {
      // Relacja jeden do jednego
      links.push({ source: fk.source_table, target: fk.target_table, foreignKeyPosition: foreignKeyPosition, primaryKeyPosition: primaryKeyPosition,type: '1:1' });
    } else if (targetPK) {
      // Relacja jeden do wielu
      links.push({ source: fk.source_table, target: fk.target_table, foreignKeyPosition: foreignKeyPosition, primaryKeyPosition: primaryKeyPosition, type: '1:N' });
    }
    links.push({ source: fk.source_table, target: fk.target_table, foreignKeyPosition: foreignKeyPosition, primaryKeyPosition: primaryKeyPosition });
  });

  return links;
}