import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fetchData } from 'next-auth/client/_utils';
import  databaseClient from '@/app/backendFunctions/database-client';
import html2canvas from 'html2canvas';
import StyledButton from '../StyledButton/StyledButton';

const SchemaDiagram = () => {
  const d3Container = useRef(null);
  const [showDiagram, setShowDiagram] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({nodes: [], links: []});

  const calculateSVGSize = () => {
    const padding = 50; // Dodajemy trochę miejsca dookoła
    const maxX = Math.max(...data.nodes.map(table => table.x)) + 200; // Szerokość, uwzględniamy największą pozycję X
    const maxY = Math.max(...data.nodes.map(table => table.y)) + 200; // Wysokość, uwzględniamy największą pozycję Y
    return {
      width: maxX + padding,
      height: maxY + padding
    };
  };

  const downloadPNG = () => {
    const svgElement = d3Container.current;
  
    // Klonowanie elementu SVG i jego atrybutów
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    // Tworzenie elementu obrazu z danych SVG
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgElement.clientWidth;
      canvas.height = svgElement.clientHeight;
      const context = canvas.getContext("2d");
  
      // Rysowanie SVG na kanwie
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
  
      // Konwersja kanwy na obraz PNG
      const pngUrl = canvas.toDataURL("image/png");
  
      // Pobranie pliku PNG
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = 'diagram.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
  
    image.src = url;
  };

  const fetchData = async () => {

    if (showDiagram && d3Container.current) {

      d3.select(d3Container.current).selectAll('*').remove();
      setError("");
      setSuccess("");

      try {
        const res = await fetch("/api/database-schema", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          setData(data.tables);
          setSuccess(data.message);
        } else {
          const data = await res.json();
          setError(data.message || "Something went wrong");
        }
      } catch (error) {
        setError("Error fetching data");
      }

      // const svg = d3.select(d3Container.current)
      //   .append('g') // Grupa wewnątrz SVG do przesuwania i zoomowania
      //   .call(d3.zoom().on('zoom', (event) => {
      //     svg.attr('transform', event.transform);
      //   }));

      const svgSize = calculateSVGSize(); // Wyliczenie wymiarów SVG
      const svg = d3.select(d3Container.current)
        .attr('width', svgSize.width) // Ustawiamy dynamicznie szerokość SVG
        .attr('height', svgSize.height) // Ustawiamy dynamicznie wysokość SVG
        .append('g')
        .call(d3.zoom().on('zoom', (event) => {
          svg.attr('transform', event.transform);
        }));

      const simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(200))
        .force('charge', d3.forceManyBody().strength(-400))  // Siła odpychająca
        .force('center', d3.forceCenter(svgSize.width / 2, svgSize.height / 2)) // Ustawienie w centrum
        .force('xGrouping', forceXGrouping(200))
        .on('tick', ticked);

      // Tworzenie prostokątów reprezentujących tabele
      const tableNodes = svg.selectAll('.table')
        .data(data.nodes)
        .enter().append('g')
        .attr('class', 'table');
        //.attr('transform', d => `translate(${d.x}, ${d.y})`);
        // .call(d3.drag()
        // .on('start', dragStarted)
        // .on('drag', dragged)
        // .on('end', dragEnded));

        

      // const link = svg.selectAll('.link')
      //   .data(data.links)
      //   .enter()
      //   .append('line')
      //   .attr('x1', d => d.source.x)
      //   .attr('y1', d => d.source.y)
      //   .attr('x2', d => d.target.x)
      //   .attr('y2', d => d.target.y)
      //   .attr('class', 'link')
      //   .attr('stroke', '#999')
      //   .attr('stroke-width', 2);
      
      const link = svg.selectAll('.link')
        .data(data.links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#999')
        .attr('stroke-width', 2);
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
        .text(d => d.id)
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



        function ticked() {
          // link
          //   .attr('x1', d => d.source.x)
          //   .attr('y1', d => d.source.y)
          //   .attr('x2', d => d.target.x)
          //   .attr('y2', d => d.target.y);
          link.attr('d', d => {
            if(d.source.x > d.target.x) {
              const midX = (d.source.x + 120 + d.target.x) / 2; // Środkowy punkt na osi X
              return `M${d.source.x},${d.source.y} 
                      H${midX} 
                      V${d.target.y} 
                      H${d.target.x + 120}`;
            } else {
              const midX = (d.source.x + 120 + d.target.x) / 2; // Środkowy punkt na osi X
              return `M${d.source.x + 120},${d.source.y} 
                      H${midX} 
                      V${d.target.y} 
                      H${d.target.x}`;
            }
            
          });
            tableNodes.attr('transform', d => `translate(${d.x},${d.y})`);
        }

        function forceXGrouping(separation) {
          return function () {
            data.nodes.forEach(node => {
              if (node.group === 1) {
                node.x = Math.max(node.x, separation);
              } else if (node.group === 2) {
                node.x = Math.min(node.x, -separation);
              }
              // Możesz dostosować więcej grup
            });
          };
        }
    
        // function dragStarted(event, d) {
        //   if (!event.active) simulation.alphaTarget(0.3).restart();
        //   d.fx = d.x;
        //   d.fy = d.y;
        // }
    
        // function dragged(event, d) {
        //   d.fx = event.x;
        //   d.fy = event.y;
        // }
    
        // function dragEnded(event, d) {
        //   if (!event.active) simulation.alphaTarget(0);
        //   d.fx = null;
        //   d.fy = null;
        // }
    }

  };

  function clearAll() {
    setShowDiagram(false);
    setSuccess("");
    setError("");
    d3.select(d3Container.current).selectAll('*').remove();
  }

  useEffect(() => { 
    fetchData();
  }, [showDiagram]);

  

  return (
    <div style={{ width: '100%', height: '600px'}}>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <div>
        <StyledButton onClick={() => setShowDiagram(true)}>Generate Diagram</StyledButton>
      </div>
      <div>
        <StyledButton onClick={() => clearAll()}>Clear Diagram</StyledButton>
      </div>
      <div>
        <StyledButton onClick={downloadPNG} disabled={!showDiagram}>Download PNG</StyledButton>
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