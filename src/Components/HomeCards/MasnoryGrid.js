// MasonryGrid.js
import React from "react";
import Masonry from "react-masonry-css";
import "./MasonryGrid.css"; // styles for gap etc.

const MasonryGrid = ({ children }) => {
  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="masonry-grid"
      columnClassName="masonry-column"
    >
      {children}
    </Masonry>
  );
};

export default MasonryGrid;
