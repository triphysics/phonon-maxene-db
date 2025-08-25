// viewer.js

// Get material from query parameter
const params = new URLSearchParams(window.location.search);
const material = params.get("material");
const basePath = material ? `materials/${material}/` : "./";

// Utility: format formula with subscripts
function formatFormula(formula) {
  return formula.replace(/(\d+)/g, "<sub>$1</sub>");
}

// Initialize UI
if (material) {
  document.getElementById("material-title").innerHTML = formatFormula(material);
  document.title = `MXene Viewer - ${material}`;
}

// 3Dmol.js viewer
let viewer;

function loadCIF(cifPath) {
  const container = document.getElementById("viewer");
  viewer = $3Dmol.createViewer(container, { backgroundColor: "white" });

  fetch(cifPath)
    .then(res => res.text())
    .then(cifData => {
      viewer.addModel(cifData, "cif");
      viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
      viewer.zoomTo();
      viewer.render();

      document.getElementById("structureStatus").style.display = "none";
    })
    .catch(err => {
      console.error("Error loading CIF:", err);
      document.getElementById("structureStatus").innerText = "No CIF file found.";
    });
}

// Bond, labels, etc. controls
document.getElementById("cb-bonds").addEventListener("change", e => {
  if (!viewer) return;
  if (e.target.checked) {
    viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
  } else {
    viewer.setStyle({}, { sphere: { scale: 0.3 } });
  }
  viewer.render();
});

document.getElementById("cb-labels").addEventListener("change", e => {
  if (!viewer) return;
  if (e.target.checked) {
    viewer.addLabel("Atoms", { fontSize: 12 });
  } else {
    viewer.removeAllLabels();
  }
  viewer.render();
});

// Zoom controls
document.getElementById("zoom-in-btn").addEventListener("click", () => { if(viewer){ viewer.zoom(1.2); viewer.render(); } });
document.getElementById("zoom-out-btn").addEventListener("click", () => { if(viewer){ viewer.zoom(0.8); viewer.render(); } });
document.getElementById("home-btn").addEventListener("click", () => { if(viewer){ viewer.zoomTo(); viewer.render(); } });

// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Load POSCAR text
function loadPOSCAR(path) {
  fetch(path)
    .then(res => res.text())
    .then(text => {
      const poscarBlock = document.createElement("pre");
      poscarBlock.textContent = text;
      document.getElementById("atoms-section").appendChild(poscarBlock);
    })
    .catch(() => {
      document.getElementById("structuralStatus").innerText = "No POSCAR found.";
    });
}

// Load phonon band.yaml
function loadPhonon(path) {
  fetch(path)
    .then(res => res.text())
    .then(yamlText => {
      const bandData = jsyaml.load(yamlText);
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

      Plotly.newPlot("phononPlot", traces, layout, { responsive: true });
      document.getElementById("phononStatus").style.display = "none";
    })
    .catch(() => {
      document.getElementById("phononStatus").innerText = "No band.yaml found.";
    });
}

// === Initialization ===
if (material) {
  loadCIF(basePath + "POSCAR.cif");
  loadPOSCAR(basePath + "POSCAR");
  loadPhonon(basePath + "data/band.yaml");
}

