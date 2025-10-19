// frontend/src/components/PlotlyChart.jsx
import React from 'react';
import Plot from 'react-plotly.js';

function PlotlyChart({ data, layout, title }) {
  // Use responsive design properties to fit the chart container
  const defaultLayout = {
    title: title,
    autosize: true,
    margin: { l: 40, r: 20, b: 50, t: 80 },
    paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#333' }
  };

  const fullLayout = { ...defaultLayout, ...layout };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={data}
        layout={fullLayout}
        // Config options for interactivity
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default PlotlyChart;