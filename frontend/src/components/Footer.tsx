import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div>
        NASA Space Apps Challenge 2026 — <em>Dancing with the SARs</em> • NISAR Data courtesy of NASA/ISRO via{' '}
        <a href="https://asf.alaska.edu" target="_blank" rel="noreferrer">
          ASF DAAC
        </a>
      </div>
      <div>
        Boundary: <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">geoBoundaries (CC BY 4.0)</a> • Basemap: CARTO/OSM • <em>Not an official NASA product</em>
      </div>
    </footer>
  );
};
