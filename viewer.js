// viewer.js

// Entry point called from viewer.html
function initViewer(material) {
  const basePath = `materials/${material}/`;

  // Update title
  document.getElementById("material-title").innerHTML = formatFormula(material);
  document.title = `MXene Viewer - ${material}`;

  // Initialize viewers and plots
  loadCIF(basePath + "POSCAR.cif");
  loadPOSCAR(basePath + "POSCAR");
  loadPhonon(basePath + "data/band.yaml");

  // Dark/light theme toggle
  const toggleBtn = document.getElementById("theme-toggle");
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });
}

// ========== 3D Structure Viewer ==========
function loadCIF(cifPath) {
  const viewerDiv = document.createElement("div");
  viewerDiv.id = "structure";
  viewerDiv.style.width = "100%";
  viewerDiv.style.height = "400px";
  document.getElementById("app").appendChild(viewerDiv);

  fetch(cifPath)
    .then(res => res.text())
    .then(cifData => {
      const viewer = $3Dmol.createViewer("structure", { backgroundColor: "white" });
      viewer.addModel(cifData, "cif");
      viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
      viewer.zoomTo();
      viewer.render();
    })
    .catch(err => {
      console.error("Error loading CIF:", err);
      viewerDiv.innerHTML = "<p>No CIF file found.</p>";
    });
}

// ========== POSCAR Viewer ==========
function loadPOSCAR(poscarPath) {
  const poscarDiv = document.createElement("div");
  poscarDiv.id = "poscar-block";
  poscarDiv.innerHTML = "<h2>POSCAR</h2><pre id='poscar-text'>Loading...</pre>";
  document.getElementById("app").appendChild(poscarDiv);

  fetch(poscarPath)
    .then(res => res.text())
    .then(text => {
      document.getElementById("poscar-text").textContent = text;
    })
    .catch(() => {
      document.getElementById("poscar-text").textContent = "No POSCAR found.";
    });
}

// ========== Phonon Band Structure ==========
function loadPhonon(bandPath) {
  const phononDiv = document.createElement("div");
  phononDiv.id = "phonon-block";
  phononDiv.innerHTML = "<h2>Phonon Band Structure</h2><div id='phonon-plot'></div>";
  document.getElementById("app").appendChild(phononDiv);

  fetch(bandPath)
    .then(res => res.text())
    .then(yamlText => {
      const bandData = jsyaml.load(yamlText);

      // Convert to plotly traces
      const traces = [];
      bandData.bands.forEach((band, i) => {
        traces.push({
          x: bandData.kpoints,
          y: band,
          type: "scatter",
          mode: "lines",
          line: { width: 1 },
          name: `Band ${i + 1}`,
          hoverinfo: "y"
        });
      });

      const layout = {
        xaxis: { title: "k-point", showgrid: false },
        yaxis: { title: "Frequency (THz)" },
        margin: { l: 60, r: 30, t: 40, b: 50 },
        showlegend: false
      };

      Plotly.newPlot("phonon-plot", traces, layout, { responsive: true });
    })
    .catch(() => {
      document.getElementById("phonon-plot").innerHTML = "<p>No band.yaml found.</p>";
    });
}

// ========== Utility ==========
function formatFormula(formula) {
  // Add subscripts for digits in formula
  return formula.replace(/([A-Za-z])(\d+)/g, (match, p1, p2) => p1 + "<sub>" + p2 + "</sub>");
}

