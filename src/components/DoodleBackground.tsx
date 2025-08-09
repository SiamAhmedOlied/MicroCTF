import React from "react";

const DoodleBackground: React.FC = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 -z-10 opacity-10"
    style={{
      backgroundImage: "url('/assets/doodle-bg.svg')",
      backgroundSize: '256px 256px',
      backgroundRepeat: 'repeat',
    }}
  />
);

export default DoodleBackground;
