import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const SchemaDiagram = () => {
  const d3Container = useRef(null);
  const [showDiagram, setShowDiagram] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);

  useEffect(() => { 
    const fetchData = async () => {

    if (showDiagram && d3Container.current) {

      d3.select(d3Container.current).selectAll('*').remove();

      const svg = d3.select(d3Container.current)
        .append('g') // Grupa wewnątrz SVG do przesuwania i zoomowania
        .call(d3.zoom().on('zoom', (event) => {
          svg.attr('transform', event.transform);
        }));

        setError("");
        setSuccess("");

        
      const tables1 = [
        { name: 'Table1', columns: ['id', 'name', 'created_at'], x: 100, y: 100 },
        { name: 'Table2', columns: ['id', 'user_id', 'order_id', 'date'], x: 300, y: 200 }
      ];

      try {
        const res = await fetch("/api/database-schema", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setTables(data.tables);
        } else {
          const data = await res.json();
          setError(data.message || "Something went wrong");
        }
      } catch (error) {
        setError("Error fetching data");
      }

      // Tworzenie prostokątów reprezentujących tabele
      const tableNodes = svg.selectAll('.table')
        .data(tables1)
        .enter().append('g')
        .attr('class', 'table')
        .attr('transform', d => `translate(${d.x}, ${d.y})`);

      // Dodanie prostokątów dla każdej tabeli
      tableNodes.append('rect')
        .attr('width', 120)
        .attr('height', d => 20 + d.columns.length * 20)
        .attr('fill', '#ccc')
        .attr('stroke', '#000');

      // Dodanie nazw tabel
      tableNodes.append('text')
        .attr('x', 10)
        .attr('y', 15)
        .text(d => d.name)
        .attr('font-size', '14px')
        .attr('fill', '#000');

      // Dodanie kolumn jako tekst
      tableNodes.selectAll('.column')
        .data(d => d.columns)
        .enter().append('text')
        .attr('class', 'column')
        .attr('x', 10)
        .attr('y', (d, i) => 35 + i * 20)
        .text(d => d)
        .attr('font-size', '12px')
        .attr('fill', '#000');
    }

  };

  fetchData();

  return () => {
    if (d3Container.current) {
      d3.select(d3Container.current).selectAll('*').remove(); // Usunięcie poprzedniego diagramu
    }
  };
  }, [showDiagram]);

  

  return (
    <div style={{ width: '100%', height: '600px'}}>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div>
        <button onClick={() => setShowDiagram(true)}>Generate Schema</button>
      </div>
      <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <svg
        ref={d3Container}
        style={{ width: '100%', height: '100%' }}
      />
      </div>
    </div>
    
  );
};

export default SchemaDiagram;