import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import StyledButton from '../StyledButton/StyledButton';
import { useSession } from 'next-auth/react';
import '../Spinner/spinner.module.css';
import StyledDiv from '../StyledDiv/StyledDiv';
import StyledForm from '../StyledForm/StyledForm';
import { useRouter } from 'next/navigation';
import StyledListItem from '@/app/components/StyledListItem/StyledListItem';

const SchemaDiagram = () => {
  const d3Container = useRef(null);
  const [showDiagram, setShowDiagram] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("postgres");
  const [host, setHost] = useState("localhost");
  const [database, setDatabase] = useState("DatabaseSchema");
  const [password, setPassword] = useState("QWERTY123");
  const [port, setPort] = useState("5432");
  const [data, setData] = useState({nodes: [], links: []});
  const [permissions, setPermissionsValue] = useState([]);

  const { data: session } = useSession();
  const router = useRouter();

  const calculateSVGSize = () => {
    const padding = 1000; // Dodajemy trochę miejsca dookoła
    const maxX = Math.max(...data.nodes.map(table => table.x)); // Szerokość, uwzględniamy największą pozycję X
    const maxY = Math.max(...data.nodes.map(table => table.y)); // Wysokość, uwzględniamy największą pozycję Y
    return {
      width: maxX + padding,
      height: maxY + padding
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDiagram(true);
  };

  const downloadPNG = () => {
    const svgElement = d3Container.current;
  
    // Ustawienie viewBox SVG, aby zapewnić pełny widok schematu
    const svgRect = svgElement.getBBox();
    const margin = 50; // Zwiększenie marginesu
    svgElement.setAttribute(
      "viewBox",
      `${svgRect.x - margin} ${svgRect.y - margin} ${svgRect.width + 2 * margin} ${svgRect.height + 2 * margin}`
    );
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
  
    // Klonowanie elementu SVG i jego atrybutów
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
  
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    // Tworzenie elementu obrazu z danych SVG
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svgRect.width + 1000;
      canvas.height = svgRect.height + 1000;
      const context = canvas.getContext("2d");
  
      // Rysowanie SVG na kanwie
      context.drawImage(image, 0, 0, svgRect.width, svgRect.height);
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

  const renderDiagram = () => {
    const svgSize = calculateSVGSize(); // Wyliczenie wymiarów SVG
    const svg = d3.select(d3Container.current)
        .attr('width', svgSize.width) // Ustawienie szerokości SVG
        .attr('height', svgSize.height) // Ustawienie wysokości SVG
        .append('g')
        .call(d3.zoom()
            .scaleExtent([0.5, 10]) // Zakres zoomowania
            .translateExtent([[-500, -500], [svgSize.width + 1000, svgSize.height + 1000]])
            .on('zoom', (event) => {
                const transform = event.transform;
                svg.attr('transform', transform);
            }));

    const margin = 50; // Margines, aby schemat nie był przycięty
    const boundingBox = { x: Infinity, y: Infinity, width: -Infinity, height: -Infinity };

    const area = svgSize.width * svgSize.height;
    const k = Math.sqrt(area / data.nodes.length)

    // Tworzenie symulacji siłowej
    const simulation = d3.forceSimulation(data.nodes)
         .force('link', d3.forceLink(data.links).id(d => d.id).distance(800))
        //.force('charge', d3.forceManyBody().strength(-k * k/ 700))
        // .force('link', d3.forceLink(data.links)
        // .id(d => d.id)
        // .distance(link => Math.pow(1.1*link.source.x - link.target.x, 2) / (k/2))// Użycie właściwości link
        // .strength(1.1))
        .force('charge', d3.forceManyBody().strength(-800))

        .force('center', d3.forceCenter(svgSize.width/3, svgSize.height/3))
        .on('tick', ticked)
        // .on('tick', () => {
        //     // Aktualizacja pozycji tabel i krawędzi
        //     link.attr('d', d => {
        //         const sourceX = d.source.x + 140;
        //         const targetX = d.target.x;
        //         const sourceY = d.source.y + 35 + d.foreignKeyPosition * 20;
        //         const targetY = d.target.y + 35 + d.primaryKeyPosition * 20;

        //         boundingBox.x = Math.min(boundingBox.x, sourceX, targetX);
        //         boundingBox.y = Math.min(boundingBox.y, sourceY, targetY);
        //         boundingBox.width = Math.max(boundingBox.width, sourceX, targetX);
        //         boundingBox.height = Math.max(boundingBox.height, sourceY, targetY);

        //         return `M${sourceX},${sourceY} H${targetX} V${targetY}`;
        //     });

        //     tableNodes.attr('transform', d => {
        //         boundingBox.x = Math.min(boundingBox.x, d.x);
        //         boundingBox.y = Math.min(boundingBox.y, d.y);
        //         boundingBox.width = Math.max(boundingBox.width, d.x + 140);
        //         boundingBox.height = Math.max(boundingBox.height, d.y + 20 + d.columns.length * 20);
        //         return `translate(${d.x},${d.y})`;
        //     });
        // })
        .on('end', () => {
          const adjustedWidth = boundingBox.width - boundingBox.x + 2 * margin;
          const adjustedHeight = boundingBox.height - boundingBox.y + 2 * margin;
          svg.attr('viewBox', `${boundingBox.x - margin} ${boundingBox.y - margin} ${adjustedWidth} ${adjustedHeight}`)
              .attr('preserveAspectRatio', 'xMidYMid meet');
        });

    const tableNodes = svg.selectAll('.table')
        .data(data.nodes)
        .enter().append('g')
        .attr('class', 'table');

    const link = svg.selectAll('.link')
        .data(data.links)
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('fill', 'none')
        .attr('stroke', '#999')
        .attr('stroke-width', 2);

    tableNodes.append('rect')
        .attr('width', 140)
        .attr('height', d => 20 + d.columns.length * 20)
        .attr('fill', '#ccc')
        .attr('stroke', '#000');

    tableNodes.append('text')
        .attr('x', 10)
        .attr('y', 15)
        .text(d => d.id)
        .attr('font-size', '14px')
        .attr('fill', '#000');

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
                  link.attr('d', d => {
                    const isSourceAboveTarget = d.source.y < d.target.y;
                    const isSourceToLeft = d.source.x + 140 < d.target.x;
                
                    // Dostosowanie punktów początkowych i końcowych na krawędzie tabeli
                    const sourceX = isSourceToLeft ? d.source.x + 140 : d.source.x;
                    const targetX = isSourceToLeft ? d.target.x : d.target.x + 140;
                
                    const sourceY = d.source.y + 35 + d.foreignKeyPosition * 20
                     
                
                    const targetY = d.target.y + 35 + d.primaryKeyPosition * 20;
                
                    const midX = (sourceX + targetX) / 2; // Środkowy punkt na osi X
                    const midY = (sourceY + targetY) / 2; // Środkowy punkt na osi Y
                
                    // Linie z korektą dla dynamicznego położenia
                    return `M${sourceX},${sourceY} 
                            H${midX} 
                            V${midY}
                            V${targetY}
                            H${targetX}`;
                  });
                
                  // Przypisanie nowych pozycji dla tabel
                  tableNodes.attr('transform', d => `translate(${d.x},${d.y})`);
                }

};

// const renderDiagram = () => {
//   const svgSize = calculateSVGSize(); 

  
//   const svg = d3.select(d3Container.current)
//       .attr('width', svgSize.width)
//       .attr('height', svgSize.height)
//       .append('g')
//       .call(d3.zoom()
//           .scaleExtent([0.5, 10]) // Zakres zoomowania
//           .translateExtent([[-500, -500], [svgSize.width + 1000, svgSize.height + 1000]])
//           .on('zoom', (event) => {
//               const transform = event.transform;
//               svg.attr('transform', transform);
//           }));

//   const margin = 50; 

//   // Zamrażanie wybranych wierzchołków (stałych)
//   // data.nodes.forEach((node, i) => {
//   //     if (node.fixed) { // np. flagujemy punkty brzegowe
//   //         node.fx = node.x || svgSize.width / 2;
//   //         node.fy = node.y || svgSize.height / 2;
//   //     } else {
//   //         node.fx = null; 
//   //         node.fy = null; 
//   //     }
//   // });

//   // Funkcja iteracyjnego barycentrum
//   function computeBarycentricPositions(nodes, links, iterations = 50) {
//       for (let iter = 0; iter < iterations; iter++) {
//           nodes.forEach(node => {
//               if (!node.fixed) { // Tylko dla "wolnych" wierzchołków
//                   const neighbors = links
//                       .filter(link => link.source.id === node.id || link.target.id === node.id)
//                       .map(link => link.source.id === node.id ? link.target : link.source);

//                   // Obliczenie średniej pozycji (barycentrum) sąsiadów
//                   let sumX = 0, sumY = 0;
//                   neighbors.forEach(neighbor => {
//                       sumX += neighbor.x || 0;
//                       sumY += neighbor.y || 0;
//                   });

//                   if (neighbors.length > 0) {
//                     node.x = sumX / neighbors.length || svgSize.width / 2;
//                     node.y = sumY / neighbors.length || svgSize.height / 2;
//                 } else {
//                     node.x = svgSize.width / 2; // Domyślna pozycja
//                     node.y = svgSize.height / 2;
//                 }
//               }
//           });
//       }
//   }

//   function resolveOverlaps(nodes, spacing = 200) {
//     for (let i = 0; i < nodes.length; i++) {
//         for (let j = i + 1; j < nodes.length; j++) {
//             const nodeA = nodes[i];
//             const nodeB = nodes[j];
//             const dx = nodeB.x - nodeA.x;
//             const dy = nodeB.y - nodeA.y;
//             const distance = Math.sqrt(dx * dx + dy * dy);

//             if (distance < spacing) { // Jeśli odległość mniejsza niż minimalny odstęp
//                 const offset = (spacing - distance) / 2;
//                 const angle = Math.atan2(dy, dx);
                
//                 nodeA.x -= Math.cos(angle) * offset;
//                 nodeA.y -= Math.sin(angle) * offset;

//                 nodeB.x += Math.cos(angle) * offset;
//                 nodeB.y += Math.sin(angle) * offset;
//             }
//         }
//     }
//   }

//     function updateLinks(links) {
//       svg.selectAll('.link')
//           .data(links)
//           .attr('d', d => {
//               const sourceX = d.source.x + 70; // Środek prostokąta źródła
//               const sourceY = d.source.y + 10;
//               const targetX = d.target.x + 70; // Środek prostokąta celu
//               const targetY = d.target.y + 10;
//               const midX = (sourceX + targetX) / 2;
  
//               return `
//                   M ${sourceX} ${sourceY} 
//                   H ${midX} 
//                   V ${targetY} 
//                   H ${targetX}
//               `;
//           });
//   }


//   // Ustawienie początkowych pozycji wierzchołków
//   // data.nodes.forEach(node => {
//   //     node.x = Math.random() * svgSize.width;
//   //     node.y = Math.random() * svgSize.height;
//   // });

//   // Iteracyjne obliczanie pozycji (zgodnie z algorytmem Tutte'a)
//   //computeBarycentricPositions(data.nodes, data.links);
//   //resolveOverlaps(data.nodes);
//   //updateLinks(data.links);
//   // Rysowanie wierzchołków (tabel)
//   const tableNodes = svg.selectAll('.table')
//       .data(data.nodes)
//       .enter().append('g')
//       .attr('class', 'table')
//       .attr('transform', d => `translate(${d.x},${d.y})`);

//   tableNodes.append('rect')
//       .attr('width', 140)
//       .attr('height', d => 20 + (d.columns?.length || 1) * 20)
//       .attr('fill', '#ccc')
//       .attr('stroke', '#000');

//   tableNodes.append('text')
//       .attr('x', 10)
//       .attr('y', 15)
//       .text(d => d.id)
//       .attr('font-size', '14px')
//       .attr('fill', '#000');

//   tableNodes.selectAll('.column')
//         .data(d => d.columns)
//         .enter().append('text')
//         .attr('class', 'column')
//         .attr('x', 10)
//         .attr('y', (d, i) => 35 + i * 20)
//         .text(d => d)
//         .attr('font-size', '12px')
//         .attr('fill', '#000');

//   // Rysowanie krawędzi
//   svg.selectAll('.link')
//       .data(data.links)
//       .enter().append('path')
//       .attr('class', 'link')
//       .attr('stroke', '#999')
//       .attr('fill', 'none')
//       .attr('stroke-width', 2)
//       .attr('d', d => {
//         const sourceX = d.source.x + 70; // Środek prostokąta źródła
//         const sourceY = d.source.y + 10;
//         const targetX = d.target.x + 70; // Środek prostokąta celu
//         const targetY = d.target.y + 10;
//         const midX = (sourceX + targetX) / 2;

//         return `
//             M ${sourceX} ${sourceY} 
//             H ${midX} 
//             V ${targetY} 
//             H ${targetX}
//         `;
//     });


    
// };

  function clearAll() {
    setShowDiagram(false);
    setSuccess("");
    setError("");
    d3.select(d3Container.current).selectAll('*').remove();
  }

  


  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        
        if(!session) {
          router.push('/'); 
        }
        
        if(session.user.role === 'user'){
          
          const res = await fetch(`/api/get-permissions?id=${session.user.id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            const data = await res.json();
            setPermissionsValue(data.permissions);
          } else {
            const data = await res.json();
            setError(data.message || "Something went wrong");
          }
        }     
         
      } catch (error) {
        setError(error.message);
      }
    };

    fetchPermissions();
  }, [])

  useEffect(() => { 
    const fetchData = async () => {

      if (showDiagram && d3Container.current) {
  
        setLoading(true);
        d3.select(d3Container.current).selectAll('*').remove();
        setError("");
        setSuccess("");
  
        try {
          const res = await fetch("/api/database-schema", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: user,
              host: host,
              database: database,
              password: password,
              port: port,
            }),
          });
  
          if (res.ok) {
            const data = await res.json();
            setData(data.tables);
            setSuccess(data.message);
            // setUser("");
            // setHost("");
            // setDatabase("");
            // setPassword("");
            // setPort("");
          } else {
            const data = await res.json();
            setError(data.message || "Something went wrong");
          }
        } catch (error) {
          setError(error.message);
        }
        finally{
          setLoading(false);
        }
      };
  
    };

    fetchData();
  }, [showDiagram]);

  useEffect(() => { 
    if (showDiagram && data.nodes.length > 0) {
      renderDiagram();
    }
  }, [showDiagram, data]);
  

  return (
    <div style={{ width: '100%'}}>
      <div style={{ padding: '20px'}}>
        
        {session.user.role == 'admin'? <div></div> : <div>
          <StyledDiv>
            <h1>Permitted Databases</h1>
              {/* {permissionsError && <p style={{ color: "red" }}>{permissionsError}</p>} */}
              {permissions.length == 0 ? <p>Currently this user has no permission to access to any database.</p> :
              <ul>
                <StyledListItem>
                  <div className="column">Database</div>
                  <div className="column">Database User</div>
                  <div className="column">Host</div>
                  <div className="column">Port</div>
                </StyledListItem>
                {permissions.map(permission => (
                  <StyledListItem key={permission.dbName}>
                    <div className="column" style={{width: '90px'}}>{permission.dbName}</div>
                    <div className="column" style={{width: '90px'}}>{permission.dbUser}</div>
                    <div className="column" style={{width: '90px'}}>{permission.dbHost}</div>
                    <div className="column" style={{width: '90px'}}>{permission.dbPort}</div>
                  </StyledListItem>
                ))}
              </ul>}
              
          </StyledDiv>
          <div style={{ padding: '20px',borderBottom: '1px solid #eaeaea'}}></div>
          </div>
          }
          
          <StyledDiv style={{padding: '20px',flexDirection: 'row'}}>
            <StyledForm style={{flexDirection: 'row'}} onSubmit={handleSubmit}>
              <div style={{flexDirection: 'column',display: 'flex'}}>
                <label>User</label>
                <input 
                  type="text" 
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required 
                />
              </div>       
              <div style={{flexDirection: 'column',display: 'flex'}}>
                <label style={{gap: '20px'}}>Host</label>
                <input 
                  type="text" 
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  required 
                />
              </div>
              <div style={{flexDirection: 'column',display: 'flex'}}>
                <label>Database</label>
                <input 
                  type="text" 
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  required 
                />
              </div>
              <div style={{flexDirection: 'column',display: 'flex'}}>
                <label>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div style={{flexDirection: 'column',display: 'flex'}}>
                <label>Port</label>
                <input 
                  type="text" 
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  required 
                />
              </div>
              
              <StyledButton type = "submit">Generate Diagram</StyledButton>
              
            </StyledForm>
            <StyledButton onClick={() => clearAll()}>Clear Diagram</StyledButton>
            <StyledButton onClick={downloadPNG} disabled={!showDiagram}>Download PNG</StyledButton>
          </StyledDiv>
      </div>
      
      
      <br />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
      <br />
      <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      {loading ? <div className="spinner"><p>Loading...</p></div> : <svg ref={d3Container} style={{ width: '100%', height: '100%' }} />}
      </div>
      <br />
    </div>
    
  );
};

export default SchemaDiagram;